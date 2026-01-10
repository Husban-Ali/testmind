const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Channel = require('../models/Channel');
const User = require('../models/User');
const Message = require('../models/Message');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/channels/direct
// @desc    Create or get direct message channel
// @access  Private
router.post('/direct', protect, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create DM with yourself'
      });
    }

    // Check if DM channel already exists
    let channel = await Channel.findOne({
      type: 'direct',
      isActive: true,
      members: { $all: [req.user.id, userId], $size: 2 }
    })
      .populate('members', 'username firstName lastName avatar status');

    if (channel) {
      // Make sure both users are in the channel room
      const io = req.app.get('io');
      const channelIdStr = channel._id.toString();
      const userIdStr = userId.toString();
      const currentUserIdStr = req.user.id.toString();
      
      const sockets = await io.fetchSockets();
      sockets.forEach(socket => {
        const socketUserId = socket.user?._id?.toString();
        if (socketUserId === userIdStr || socketUserId === currentUserIdStr) {
          socket.join(channelIdStr);
          console.log(`User ${socketUserId} joined existing DM channel room ${channelIdStr}`);
        }
      });
      
      return res.json({
        success: true,
        channel
      });
    }

    // Create new DM channel
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    channel = await Channel.create({
      name: `${req.user.firstName} & ${otherUser.firstName}`,
      description: 'Direct message',
      type: 'direct',
      createdBy: req.user.id,
      members: [req.user.id, userId],
      admins: [req.user.id, userId]
    });

    // Add channel to both users
    await User.updateMany(
      { _id: { $in: [req.user.id, userId] } },
      { $addToSet: { channels: channel._id } }
    );

    const populatedChannel = await Channel.findById(channel._id)
      .populate('members', 'username firstName lastName avatar status');

    // Emit socket event to both users
    const io = req.app.get('io');
    const channelIdStr = channel._id.toString();
    const userIdStr = userId.toString();
    const currentUserIdStr = req.user.id.toString();
    
    console.log('New DM channel created:', channelIdStr);
    console.log('Emitting to users:', [currentUserIdStr, userIdStr]);
    
    // Emit to both users
    io.to(userIdStr).emit('channel:created', populatedChannel);
    io.to(currentUserIdStr).emit('channel:created', populatedChannel);
    
    // Also make both users join the channel room
    const sockets = await io.fetchSockets();
    sockets.forEach(socket => {
      const socketUserId = socket.user?._id?.toString();
      if (socketUserId === userIdStr || socketUserId === currentUserIdStr) {
        socket.join(channelIdStr);
        console.log(`User ${socketUserId} joined DM channel room ${channelIdStr}`);
      }
    });

    res.status(201).json({
      success: true,
      channel: populatedChannel
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/channels
// @desc    Create a new channel
// @access  Private (CO-CEO, Manager, CEO, Sales Head)
router.post('/', protect, authorize('ceo', 'co_ceo', 'manager', 'sales_head', 'company_manager'), [
  body('name').notEmpty().trim(),
  body('type').isIn(['public', 'private', 'project'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description, type, members, project } = req.body;

    const channel = await Channel.create({
      name,
      description,
      type,
      createdBy: req.user.id,
      members: members || [req.user.id],
      admins: [req.user.id],
      project
    });

    // Add channel to users
    await User.updateMany(
      { _id: { $in: channel.members } },
      { $addToSet: { channels: channel._id } }
    );

    const populatedChannel = await Channel.findById(channel._id)
      .populate('createdBy', 'username firstName lastName avatar')
      .populate('members', 'username firstName lastName avatar status')
      .populate('project', 'name');

    // Emit socket event
    const io = req.app.get('io');
    io.to(channel.members.map(m => m._id.toString())).emit('channel:created', populatedChannel);

    res.status(201).json({
      success: true,
      channel: populatedChannel
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/channels
// @desc    Get all channels for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type } = req.query;
    const query = {
      $or: [
        { members: req.user.id },
        { type: 'public', isActive: true }
      ]
    };

    if (type) {
      query.type = type;
    }

    const channels = await Channel.find(query)
      .populate('createdBy', 'username firstName lastName avatar')
      .populate('members', 'username firstName lastName avatar status')
      .populate('project', 'name status')
      .populate('lastMessage', 'content sender createdAt')
      .sort({ lastActivity: -1 });

    // Convert unreadCount Map to object for each channel
    const channelsWithUnread = channels.map(channel => {
      const channelObj = channel.toObject();
      const unreadMap = {};
      if (channel.unreadCount) {
        channel.unreadCount.forEach((value, key) => {
          unreadMap[key] = value;
        });
      }
      channelObj.unreadCount = unreadMap;
      channelObj.userUnreadCount = unreadMap[req.user.id.toString()] || 0;
      return channelObj;
    });

    res.json({
      success: true,
      count: channelsWithUnread.length,
      channels: channelsWithUnread
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/channels/:id
// @desc    Get channel by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName avatar')
      .populate('members', 'username firstName lastName avatar status')
      .populate('admins', 'username firstName lastName avatar')
      .populate('project', 'name status manager');

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Check access
    if (channel.type === 'private' && !channel.members.some(m => m._id.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this channel'
      });
    }

    res.json({
      success: true,
      channel
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/channels/:id
// @desc    Update channel
// @access  Private (Channel admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Check if user is admin of channel
    if (!channel.admins.includes(req.user.id) && 
        !['ceo', 'co_ceo'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this channel'
      });
    }

    const { name, description } = req.body;
    if (name) channel.name = name;
    if (description) channel.description = description;

    await channel.save();

    const updatedChannel = await Channel.findById(channel._id)
      .populate('createdBy', 'username firstName lastName avatar')
      .populate('members', 'username firstName lastName avatar status')
      .populate('project', 'name');

    // Emit socket event
    const io = req.app.get('io');
    io.to(channel._id.toString()).emit('channel:updated', updatedChannel);

    res.json({
      success: true,
      channel: updatedChannel
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/channels/:id/members
// @desc    Add members to channel
// @access  Private (Channel admin, Admin, Manager)
router.post('/:id/members', protect, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Check authorization
    if (!channel.admins.includes(req.user.id) && 
        !['super_admin', 'admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { userIds } = req.body;

    // Add members
    const newMembers = userIds.filter(id => !channel.members.includes(id));
    channel.members.push(...newMembers);
    await channel.save();

    // Update users
    await User.updateMany(
      { _id: { $in: newMembers } },
      { $addToSet: { channels: channel._id } }
    );

    const updatedChannel = await Channel.findById(channel._id)
      .populate('members', 'username firstName lastName avatar status');

    // Emit socket event
    const io = req.app.get('io');
    newMembers.forEach(userId => {
      io.to(userId).emit('channel:joined', updatedChannel);
    });

    res.json({
      success: true,
      channel: updatedChannel
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/channels/:id/members/:userId
// @desc    Remove member from channel
// @access  Private (Channel admin, Admin, Manager)
router.delete('/:id/members/:userId', protect, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Check authorization
    if (!channel.admins.includes(req.user.id) && 
        !['super_admin', 'admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    channel.members = channel.members.filter(m => m.toString() !== req.params.userId);
    await channel.save();

    // Update user
    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { channels: channel._id }
    });

    // Emit socket event
    const io = req.app.get('io');
    io.to(req.params.userId).emit('channel:removed', { channelId: channel._id });

    res.json({
      success: true,
      message: 'Member removed from channel'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/channels/:id
// @desc    Delete/deactivate channel
// @access  Private (CO-CEO, CEO)
router.delete('/:id', protect, authorize('ceo', 'co_ceo'), async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Mark as inactive instead of deleting
    channel.isActive = false;
    await channel.save();

    // Remove channel from all users' channel lists
    await User.updateMany(
      { channels: channel._id },
      { $pull: { channels: channel._id } }
    );

    // Emit socket event to all channel members
    const io = req.app.get('io');
    channel.members.forEach(memberId => {
      io.to(memberId.toString()).emit('channel:deleted', { channelId: channel._id });
    });

    res.json({
      success: true,
      message: 'Channel deleted successfully'
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
