const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Channel = require('../models/Channel');
const UserLocation = require('../models/UserLocation');
const { protect } = require('../middleware/auth');


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};


router.post('/register', [
  body('username').notEmpty().trim().isLength({ min: 3 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, email, password, firstName, lastName, role } = req.body;

    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || 'employee'
    });

    let eodChannel = await Channel.findOne({ type: 'eod' });
    if (!eodChannel) {
      eodChannel = await Channel.create({
        name: 'EOD Reports',
        description: 'Daily End of Day reports from all employees',
        type: 'eod',
        createdBy: user._id,
        members: [user._id],
        admins: [user._id]
      });
    } else {
      if (!eodChannel.members.includes(user._id)) {
        eodChannel.members.push(user._id);
        await eodChannel.save();
      }
    }

    user.channels.push(eodChannel._id);
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password format',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    console.log('[AUTH] Login attempt for email:', email);

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('[AUTH] ❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      console.log('[AUTH] ❌ Account inactive:', email);
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact your administrator.'
      });
    }

    // Compare password with hashed password in database
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('[AUTH] ❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('[AUTH] ✅ Login successful for:', email);

    
    user.status = 'online';
    user.lastSeen = Date.now();
    await user.save();

    // Ensure a UserLocation document exists and mark user online on login
    try {
      await UserLocation.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          isOnline: true,
          permissionStatus: 'prompt',
          locationEnabled: false,
          latitude: null,
          longitude: null,
          lastUpdated: new Date()
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (err) {
      console.error('[AUTH] Failed to upsert UserLocation on login:', err);
    }
    // Emit socket events so frontend presence reflects tracking state
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('user:status', { userId: user._id.toString(), status: 'online', lastUpdated: new Date() });

        // Build online list from recent UserLocation docs
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const onlineLocations = await UserLocation.find({
          isOnline: true,
          lastUpdated: { $gt: tenMinutesAgo }
        }).select('userId');
        const onlineUserIds = onlineLocations.map(l => l.userId.toString());
        io.emit('users:online', onlineUserIds);
      }
    } catch (err) {
      console.error('[AUTH] Failed to emit socket presence after login:', err);
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});


router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('channels', 'name type')
      .populate('assignedProjects', 'name status');

    // Merge UserLocation status (consider user online if recent location update)
    try {
      const location = await UserLocation.findOne({ userId: user._id });
      if (location) {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        if (location.isOnline && location.lastUpdated > tenMinutesAgo) {
          user.status = 'online';
        } else {
          user.status = 'offline';
        }
      }
    } catch (err) {
      console.error('[AUTH] Failed to merge UserLocation for /me:', err);
    }

    res.json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.post('/logout', protect, async (req, res) => {
  try {
    // Set user offline in User collection
    await User.findByIdAndUpdate(req.user.id, {
      status: 'offline',
      lastSeen: Date.now()
    });

    // Set user offline in UserLocation collection
    await UserLocation.findOneAndUpdate(
      { userId: req.user.id },
      { 
        isOnline: false,
        lastUpdated: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

module.exports = router;
