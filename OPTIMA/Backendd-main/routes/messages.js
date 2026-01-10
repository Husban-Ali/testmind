const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const Channel = require('../models/Channel');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const pushRoutes = require('./push');
const sendNotificationToUser = pushRoutes.sendNotificationToUser;


router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    const { channel } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    if (!channel) {
      return res.status(400).json({
        success: false,
        message: 'Channel ID is required'
      });
    }

    const channelDoc = await Channel.findById(channel);
    if (!channelDoc) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    if (!channelDoc.members.includes(req.user.id) && channelDoc.type !== 'public') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this channel'
      });
    }

    let messageType = 'file';
    if (req.file.mimetype.startsWith('image/')) {
      messageType = 'image';
    } else if (req.file.mimetype.startsWith('video/')) {
      messageType = 'video';
    } else if (req.file.mimetype.startsWith('audio/')) {
      messageType = 'audio';
    }

    const message = await Message.create({
      channel,
      sender: req.user.id,
      content: req.body.caption || req.file.originalname,
      type: messageType,
      attachments: [{
        filename: req.file.originalname,
        url: req.file.path,
        fileType: req.file.mimetype,
        size: req.file.size
      }]
    });

    channelDoc.lastActivity = Date.now();
    await channelDoc.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username firstName lastName avatar status');

    const io = req.app.get('io');
    const channelId = channel.toString();
    console.log('Emitting file upload message:new to channel:', channelId);
    io.to(channelId).emit('message:new', populatedMessage);

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.post('/', protect, [
  body('channel').notEmpty(),
  body('content').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { channel, content, type, attachments, mentions, replyTo } = req.body;

    const channelDoc = await Channel.findById(channel);
    if (!channelDoc) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    if (!channelDoc.members.includes(req.user.id) && channelDoc.type !== 'public') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this channel'
      });
    }

    const messageData = {
      channel,
      sender: req.user.id,
      content,
      type: type || 'text',
      attachments,
      mentions
    };
    
    if (replyTo) {
      messageData.replyTo = replyTo;
    }
    
    const message = await Message.create(messageData);

    // Update channel last activity and last message
    channelDoc.lastActivity = Date.now();
    channelDoc.lastMessage = message._id;
    
    // Increment unread count for all members except sender
    channelDoc.members.forEach(memberId => {
      const memberIdStr = memberId.toString();
      const senderIdStr = req.user.id.toString();
      if (memberIdStr !== senderIdStr) {
        const currentCount = channelDoc.unreadCount.get(memberIdStr) || 0;
        channelDoc.unreadCount.set(memberIdStr, currentCount + 1);
      }
    });
    
    await channelDoc.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username firstName lastName avatar status')
      .populate('mentions', 'username firstName lastName')
      .populate({
        path: 'replyTo',
        select: 'content sender',
        populate: {
          path: 'sender',
          select: 'firstName lastName username'
        }
      });

    // Emit socket event
    const io = req.app.get('io');
    const channelId = channel.toString();
    console.log('Emitting message:new to channel:', channelId);
    io.to(channelId).emit('message:new', populatedMessage);

    // Send push notifications to channel members (except sender)
    try {
      const channelWithMembers = await Channel.findById(channelId).populate('members', '_id firstName lastName');
      const senderIdStr = req.user.id.toString();
      
      console.log(`[PUSH] 📨 Preparing to send message notifications for channel: ${channelId}`);
      console.log(`[PUSH] Channel has ${channelWithMembers.members.length} members`);
      
      // Get channel display name
      let channelName = channelWithMembers.name || 'Direct Message';
      if (channelWithMembers.type === 'direct') {
        const otherMember = channelWithMembers.members.find(m => m._id.toString() !== senderIdStr);
        if (otherMember) {
          channelName = `${otherMember.firstName} ${otherMember.lastName}`;
        }
      }
      
      // Prepare message preview
      let messagePreview = content;
      if (type === 'image') {
        messagePreview = '📷 Image';
      } else if (type === 'video') {
        messagePreview = '🎥 Video';
      } else if (type === 'file') {
        messagePreview = '📎 File';
      } else if (type === 'audio') {
        messagePreview = '🎵 Audio';
      }
      
      // Limit preview to 100 characters
      if (messagePreview.length > 100) {
        messagePreview = messagePreview.substring(0, 100) + '...';
      }
      
      // Send to all members except sender
      let notificationsSent = 0;
      let notificationsFailed = 0;
      
      for (const member of channelWithMembers.members) {
        const memberIdStr = member._id.toString();
        if (memberIdStr !== senderIdStr) {
          console.log(`[PUSH] 📤 Sending notification to member: ${member.firstName} ${member.lastName} (${memberIdStr})`);
          
          const pushPayload = {
            type: 'message',
            title: channelWithMembers.type === 'direct' 
              ? `${req.user.firstName} ${req.user.lastName}`
              : `# ${channelName}`,
            body: `${req.user.firstName}: ${messagePreview}`,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            data: {
              channelId,
              messageId: message._id.toString(),
              senderId: senderIdStr,
              url: `/dashboard/channel/${channelId}`
            }
          };
          
          const result = await sendNotificationToUser(memberIdStr, pushPayload);
          if (result && result.success) {
            notificationsSent++;
            console.log(`[PUSH] ✅ Notification sent to ${member.firstName} ${member.lastName} - Sent: ${result.sent}, Failed: ${result.failed}`);
          } else {
            notificationsFailed++;
            console.log(`[PUSH] ❌ Failed to send notification to ${member.firstName} ${member.lastName}:`, result?.error || result?.message);
          }
          // Also emit an in-app socket notification for connected users
          try {
            const io = req.app.get('io');
            io.to(memberIdStr).emit('notification:new', pushPayload);
            console.log(`[SOCKET] Notification emitted to ${memberIdStr}`);
          } catch (emitErr) {
            console.error('[SOCKET] Error emitting in-app notification:', emitErr);
          }
        }
      }
      
      console.log(`[PUSH] 📊 Total notifications sent: ${notificationsSent}, failed: ${notificationsFailed}`);
    } catch (pushError) {
      console.error('[PUSH] ❌ Error sending push notifications:', pushError);
      // Don't fail the message send if push notification fails
    }

    // Emit notification to mentioned users
    if (mentions && mentions.length > 0) {
      mentions.forEach(userId => {
        io.to(userId).emit('notification:mention', {
          message: populatedMessage,
          channel: channelDoc
        });
      });
    }

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.get('/:channelId', protect, async (req, res) => {
  try {
    const { channelId } = req.params;
    const { limit = 50, before } = req.query;

  
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    if (!channel.members.includes(req.user.id) && channel.type !== 'public') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view messages in this channel'
      });
    }

    const query = {
      channel: channelId,
      isDeleted: false
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'username firstName lastName avatar status')
      .populate('mentions', 'username firstName lastName')
      .populate({
        path: 'replyTo',
        select: 'content sender',
        populate: {
          path: 'sender',
          select: 'firstName lastName username'
        }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Mark messages as read for this user
    channel.unreadCount.set(req.user.id.toString(), 0);
    await channel.save();

    res.json({
      success: true,
      count: messages.length,
      messages: messages.reverse()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/messages/:id
// @desc    Update/edit a message
// @access  Private (message sender)
router.put('/:id', protect, [
  body('content').notEmpty()
], async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this message'
      });
    }

    message.content = req.body.content;
    message.isEdited = true;
    message.editedAt = Date.now();
    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate('sender', 'username firstName lastName avatar status');

    
    const io = req.app.get('io');
    io.to(message.channel.toString()).emit('message:updated', updatedMessage);

    res.json({
      success: true,
      message: updatedMessage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    
    if (message.sender.toString() !== req.user.id && 
        !['super_admin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    message.isDeleted = true;
    message.deletedAt = Date.now();
    await message.save();

    
    const io = req.app.get('io');
    io.to(message.channel.toString()).emit('message:deleted', { messageId: message._id });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.post('/:id/reactions', protect, [
  body('emoji').notEmpty()
], async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    
    const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
    
    if (reactionIndex > -1) {
      
      if (message.reactions[reactionIndex].users.includes(req.user.id)) {
        
        message.reactions[reactionIndex].users = message.reactions[reactionIndex].users.filter(
          u => u.toString() !== req.user.id
        );
        
        
        if (message.reactions[reactionIndex].users.length === 0) {
          message.reactions.splice(reactionIndex, 1);
        }
      } else {
        
        message.reactions[reactionIndex].users.push(req.user.id);
      }
    } else {
      
      message.reactions.push({
        emoji,
        users: [req.user.id]
      });
    }

    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate('sender', 'username firstName lastName avatar status')
      .populate('reactions.users', 'username firstName lastName');

    // Emit socket event
    const io = req.app.get('io');
    io.to(message.channel.toString()).emit('message:reaction', updatedMessage);

    res.json({
      success: true,
      message: updatedMessage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.post('/:id/read', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const alreadyRead = message.readBy.some(r => r.user.toString() === req.user.id);

    if (!alreadyRead) {
      message.readBy.push({
        user: req.user.id,
        readAt: Date.now()
      });
      await message.save();
    }

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

