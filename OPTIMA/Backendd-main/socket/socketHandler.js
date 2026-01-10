const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Channel = require('../models/Channel');
const pushRoutes = require('../routes/push');
const sendNotificationToUser = pushRoutes.sendNotificationToUser;

const onlineUsers = new Map(); 
const activeCallRooms = new Map(); 

module.exports = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`User connected: ${socket.user.username} (${userId})`);

    
    onlineUsers.set(userId, socket.id);

    // Update user status to online
    await User.findByIdAndUpdate(userId, {
      status: 'online',
      lastSeen: Date.now()
    });

    // Join user's personal room
    socket.join(userId);

    // Join all user's channels including DMs
    const userChannels = await Channel.find({ 
      members: userId, 
      isActive: true 
    });
    userChannels.forEach(channel => {
      socket.join(channel._id.toString());
    });

    // Broadcast user online status
    io.emit('user:status', {
      userId,
      status: 'online'
    });

    // Send online users list to the connected user
    const onlineUserIds = Array.from(onlineUsers.keys());
    socket.emit('users:online', onlineUserIds);

    // Handle join channel
    socket.on('channel:join', async (channelId) => {
      try {
        const channel = await Channel.findById(channelId);
        
        if (channel && channel.members.includes(userId)) {
          socket.join(channelId);
          socket.emit('channel:joined', { channelId });
        }
      } catch (error) {
        console.error('Error joining channel:', error);
      }
    });

    // Handle leave channel
    socket.on('channel:leave', (channelId) => {
      socket.leave(channelId);
      socket.emit('channel:left', { channelId });
    });

    // Handle typing indicator
    socket.on('typing:start', ({ channelId }) => {
      socket.to(channelId).emit('user:typing', {
        channelId,
        userId,
        username: socket.user.username
      });
    });

    socket.on('typing:stop', ({ channelId }) => {
      socket.to(channelId).emit('user:stopped-typing', {
        channelId,
        userId
      });
    });

    // Handle video call signaling
    socket.on('call:initiate', async ({ channelId, callType }) => {
      try {
        const channel = await Channel.findById(channelId).populate('members', '_id username firstName lastName avatar');
        
        if (channel && channel.members.some(m => m._id.toString() === userId)) {
          console.log(`[CALL] User ${socket.user.username} initiating ${callType} call in channel ${channelId}`);
          console.log(`[CALL] Channel has ${channel.members.length} members`);
          
          // Notify ALL channel members EXCEPT the caller
          channel.members.forEach(async (member) => {
            const memberIdStr = member._id.toString();
            if (memberIdStr !== userId) {
              console.log(`[CALL] Sending call notification to member: ${member.username} (${memberIdStr})`);
              
              // Send socket event
              io.to(memberIdStr).emit('call:incoming', {
                channelId,
                callerId: userId,
                callerName: `${socket.user.firstName} ${socket.user.lastName}`,
                callType,
                timestamp: Date.now()
              });
              
              // Check if user is online via socket
              const isOnline = onlineUsers.has(memberIdStr);
              
              // Send push notification if user is not online OR app might be minimized
              // We send to all users because they might have app minimized
              const pushPayload = {
                type: 'call',
                title: `Incoming ${callType === 'audio' ? 'Voice' : 'Video'} Call`,
                body: `${socket.user.firstName} ${socket.user.lastName} is calling you`,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                data: {
                  channelId,
                  callerId: userId,
                  callerName: `${socket.user.firstName} ${socket.user.lastName}`,
                  callType,
                  url: `/dashboard/call/${channelId}?type=${callType}`
                }
              };
              
              // Send push notification
              await sendNotificationToUser(memberIdStr, pushPayload);
              console.log(`[PUSH] Call notification sent to ${member.username}`);
            }
          });
        }
      } catch (error) {
        console.error('[CALL] Error initiating call:', error);
      }
    });

    socket.on('call:join', async ({ channelId, callType }) => {
      try {
        console.log(`[CALL] User ${userId} (${socket.user.username}) joining call in channel ${channelId}`);
        console.log(`[CALL] Call type: ${callType}`);
        
        // Initialize call room if it doesn't exist
        if (!activeCallRooms.has(channelId)) {
          activeCallRooms.set(channelId, new Set());
          console.log(`[CALL] Created new call room for channel ${channelId}`);
        }
        
        const callRoom = activeCallRooms.get(channelId);
        console.log(`[CALL] Current participants before join:`, Array.from(callRoom));
        
        // Notify existing participants about the new user
        callRoom.forEach(participantSocketId => {
          console.log(`[CALL] Notifying participant ${participantSocketId} about new user ${socket.id}`);
          io.to(participantSocketId).emit('user:joined-call', {
            userId,
            socketId: socket.id,
            username: socket.user.username
          });
        });
        
        // Add user to call room
        callRoom.add(socket.id);
        
        console.log(`[CALL] Call room ${channelId} now has ${callRoom.size} participants:`, Array.from(callRoom));
      } catch (error) {
        console.error('[CALL] Error joining call:', error);
      }
    });

    socket.on('call:answer', ({ channelId, peerId }) => {
      socket.to(channelId).emit('call:answered', {
        userId,
        peerId
      });
    });

    socket.on('call:reject', ({ channelId }) => {
      socket.to(channelId).emit('call:rejected', {
        userId
      });
    });

    socket.on('call:end', ({ channelId }) => {
      // Remove user from call room
      if (activeCallRooms.has(channelId)) {
        const callRoom = activeCallRooms.get(channelId);
        callRoom.delete(socket.id);
        
        // Clean up empty call room
        if (callRoom.size === 0) {
          activeCallRooms.delete(channelId);
        }
      }
      
      socket.to(channelId).emit('call:ended', {
        userId
      });
      
      socket.to(channelId).emit('user:left-call', {
        socketId: socket.id,
        userId
      });
    });

    // WebRTC signaling
    socket.on('webrtc:offer', ({ channelId, offer, peerId }) => {
      socket.to(peerId).emit('webrtc:offer', {
        offer,
        peerId: socket.id,
        userId
      });
    });

    socket.on('webrtc:answer', ({ channelId, answer, peerId }) => {
      socket.to(peerId).emit('webrtc:answer', {
        answer,
        peerId: socket.id,
        userId
      });
    });

    socket.on('webrtc:ice-candidate', ({ candidate, peerId }) => {
      socket.to(peerId).emit('webrtc:ice-candidate', {
        candidate,
        peerId: socket.id,
        userId
      });
    });

    // Screen sharing
    socket.on('screen:share-start', ({ channelId }) => {
      socket.to(channelId).emit('screen:sharing-started', {
        userId,
        username: socket.user.username
      });
    });

    socket.on('screen:share-stop', ({ channelId }) => {
      socket.to(channelId).emit('screen:sharing-stopped', {
        userId
      });
    });

    // Handle user status updates
    socket.on('status:update', async ({ status }) => {
      try {
        await User.findByIdAndUpdate(userId, {
          status,
          lastSeen: Date.now()
        });

        io.emit('user:status', {
          userId,
          status
        });
      } catch (error) {
        console.error('Error updating status:', error);
      }
    });

    // Handle direct messages (for future implementation)
    socket.on('message:send', async (data) => {
      try {
        const { channelId, content, type, mentions } = data;
        
        // This is handled by the REST API, but we can emit real-time here
        socket.to(channelId).emit('message:new', {
          ...data,
          sender: socket.user
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.username} (${userId})`);

      // Remove from online users
      onlineUsers.delete(userId);
      
      // Remove from any active calls
      activeCallRooms.forEach((callRoom, channelId) => {
        if (callRoom.has(socket.id)) {
          callRoom.delete(socket.id);
          
          // Notify others in the call
          io.to(channelId).emit('user:left-call', {
            socketId: socket.id,
            userId
          });
          
          // Clean up empty call room
          if (callRoom.size === 0) {
            activeCallRooms.delete(channelId);
          }
        }
      });

      // Update user status to offline
      await User.findByIdAndUpdate(userId, {
        status: 'offline',
        lastSeen: Date.now()
      });

      // Broadcast user offline status
      io.emit('user:status', {
        userId,
        status: 'offline',
        lastSeen: Date.now()
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Helper function to get online users
  io.getOnlineUsers = () => {
    return Array.from(onlineUsers.keys());
  };

  // Helper function to check if user is online
  io.isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };
};
