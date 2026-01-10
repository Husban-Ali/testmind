const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const bcrypt = require('bcryptjs');


router.post('/', protect, authorize('ceo'), [
  body('username').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('role').isIn(['ceo', 'co_ceo', 'company_manager', 'sales_head', 'sales_employee', 'production_head', 'production_employee', 'manager', 'employee']),
  body('department').optional().isIn(['general', 'sales', 'production'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, email, password, firstName, lastName, role, department } = req.body;
    
    let assignedDepartment = department || 'general';
    if (role === 'sales_head' || role === 'sales_employee') {
      assignedDepartment = 'sales';
    } else if (role === 'production_head' || role === 'production_employee') {
      assignedDepartment = 'production';
    }

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
      role,
      department: assignedDepartment
    });

    const userResponse = user.getPublicProfile();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.get('/', protect, authorize('ceo', 'co_ceo', 'company_manager', 'sales_head', 'production_head', 'manager'), async (req, res) => {
  try {
    const { role, status, search, department } = req.query;
    const query = { isActive: true };


    if (department && ['ceo', 'co_ceo', 'company_manager'].includes(req.user.role)) {
      query.department = department;
    }
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    let users = await User.find(query)
      .select('-password')
      .populate('assignedProjects', 'name status department projectValue')
      .populate({
        path: 'projectValues.project',
        select: 'name status department'
      })
      .sort({ createdAt: -1 });

    try {
      // Merge latest UserLocation info to reflect tracking-based online status
      const userIds = users.map(u => u._id);
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const locations = await require('../models/UserLocation').find({
        userId: { $in: userIds },
      }).select('userId isOnline lastUpdated locationEnabled permissionStatus latitude longitude');

      const locMap = {};
      locations.forEach(l => { locMap[l.userId.toString()] = l; });

      users = users.map(u => {
        const lu = locMap[u._id.toString()];
        if (lu) {
          const isRecent = lu.isOnline && lu.lastUpdated > tenMinutesAgo;
          u = u.toObject();
          u.status = isRecent ? 'online' : 'offline';
          // Attach location meta for UI if needed
          u.location = {
            locationEnabled: lu.locationEnabled,
            permissionStatus: lu.permissionStatus,
            latitude: lu.latitude,
            longitude: lu.longitude,
            lastUpdated: lu.lastUpdated
          };
        }
        return u;
      });
    } catch (err) {
      console.error('Failed to merge UserLocation into users list:', err);
    }

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/available-for-dm
// @desc    Get users available for direct messaging
// @access  Private
router.get('/available-for-dm', protect, async (req, res) => {
  try {
    let users = await User.find({
      _id: { $ne: req.user.id },
      isActive: true
    })
      .select('username firstName lastName avatar status')
      .sort({ firstName: 1 });

    try {
      const userIds = users.map(u => u._id);
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const locations = await require('../models/UserLocation').find({
        userId: { $in: userIds }
      }).select('userId isOnline lastUpdated');

      const locMap = {};
      locations.forEach(l => { locMap[l.userId.toString()] = l; });

      users = users.map(u => {
        const lu = locMap[u._id.toString()];
        const obj = u.toObject ? u.toObject() : u;
        if (lu && lu.isOnline && lu.lastUpdated > tenMinutesAgo) {
          obj.status = 'online';
        } else {
          obj.status = 'offline';
        }
        return obj;
      });
    } catch (err) {
      console.error('Failed to merge UserLocation for available-for-dm:', err);
    }

    res.json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/sales-report', protect, authorize('ceo', 'co_ceo', 'company_manager', 'sales_head'), async (req, res) => {
  try {
    const salesEmployees = await User.find({
      department: 'sales',
      role: { $in: ['sales_employee', 'sales_head'] },
      isActive: true
    })
      .select('-password')
      .populate('projectValues.project', 'name status department projectValue')
      .populate('assignedProjects', 'name status department projectValue')
      .sort({ role: 1, createdAt: -1 });
                    
      const salesReport = salesEmployees.map(employee => {
      const totalValue = employee.projectValues.reduce((sum, pv) => sum + (pv.value || 0), 0);
      return {
        ...employee.toObject(),
        totalProjectValue: totalValue
      };
    });

    res.json({
      success: true,
      count: salesReport.length,
      salesEmployees: salesReport
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('assignedProjects', 'name status')
      .populate('channels', 'name type');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    try {
      const loc = await require('../models/UserLocation').findOne({ userId: user._id });
      if (loc) {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        user.status = (loc.isOnline && loc.lastUpdated > tenMinutesAgo) ? 'online' : 'offline';
        user = user.toObject();
        user.location = {
          locationEnabled: loc.locationEnabled,
          permissionStatus: loc.permissionStatus,
          latitude: loc.latitude,
          longitude: loc.longitude,
          lastUpdated: loc.lastUpdated
        };
      }
    } catch (err) {
      console.error('Failed to merge UserLocation for single user fetch:', err);
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const { firstName, lastName, avatar, role, department } = req.body;

    
    const isSelf = req.user.id === req.params.id;
    const isCEO = req.user.role === 'ceo';
    const isCoCEO = req.user.role === 'co_ceo';
    const isCompanyManager = req.user.role === 'company_manager';

    
    if (role && !isCEO) {
      return res.status(403).json({
        success: false,
        message: 'Only CEO can change user roles'
      });
    }

    
    if ((isCoCEO || isCompanyManager) && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'CO-CEO and Company Manager can only view user management, not modify'
      });
    }

    
    if (!isSelf && !isCEO) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (avatar) updateData.avatar = avatar;

    
    if (role && isCEO) {
      updateData.role = role;
    }
    if (department && isCEO) {
      updateData.department = department;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.delete('/:id', protect, authorize('ceo'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.put('/:id/status', protect, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status, lastSeen: Date.now() },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.post('/project-value', protect, authorize('sales_employee'), async (req, res) => {
  try {
    const { projectId, value } = req.body;

    if (!projectId || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and value are required'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    
    const existingIndex = user.projectValues.findIndex(
      pv => pv.project.toString() === projectId
    );

    if (existingIndex !== -1) {
      
      user.projectValues[existingIndex].value = value;
      user.projectValues[existingIndex].submittedAt = Date.now();
    } else {
      
      user.projectValues.push({
        project: projectId,
        value,
        submittedAt: Date.now()
      });
    }

    await user.save();

    const updatedUser = await User.findById(req.user.id)
      .select('-password')
      .populate('projectValues.project', 'name status department');

    res.json({
      success: true,
      message: 'Project value submitted successfully',
      projectValues: updatedUser.projectValues
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/:id/password
// @desc    Change user password (CEO only)
// @access  Private (CEO)
router.put('/:id/password', protect, authorize('ceo'), [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters',
        errors: errors.array() 
      });
    }

    const { password } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`[PASSWORD] 🔐 Changing password for user: ${user.email} (${user.firstName} ${user.lastName})`);
    console.log(`[PASSWORD] New password will be: ${password}`);

    // Update password - the pre-save hook will automatically:
    // 1. Store plain password in plainPassword field (for CEO reference)
    // 2. Hash the password and store in password field (for authentication)
    user.password = password;
    await user.save();

    console.log(`[PASSWORD] ✅ Password changed successfully for: ${user.email}`);
    console.log(`[PASSWORD] Plain password stored: ${user.plainPassword}`);
    console.log(`[PASSWORD] User can now login with the new password`);

    res.json({
      success: true,
      message: `Password changed successfully for ${user.firstName} ${user.lastName}`,
      plainPassword: user.plainPassword,
      newPassword: password
    });
  } catch (error) {
    console.error('[PASSWORD] ❌ Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
});

module.exports = router;
