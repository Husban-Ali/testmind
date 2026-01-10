const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Helper function to get start and end of day
const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// @route   POST /api/attendance/check-in
// @desc    Mark check-in for user (management can check-in for employees)
// @access  Private
router.post('/check-in', protect, async (req, res) => {
  try {
    const today = getStartOfDay(new Date());
    const { userId } = req.body;
    
    // If userId provided, check if user is management
    let targetUserId = req.user.id;
    if (userId) {
      // Check if requester is management (ceo, co_ceo, company_manager, manager)
      const allowedRoles = ['ceo', 'co_ceo', 'company_manager', 'manager'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to check-in for other users'
        });
      }
      targetUserId = userId;
    }

    // Check if already checked in today
    let attendance = await Attendance.findOne({
      user: targetUserId,
      date: today
    });

    if (attendance && attendance.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today',
        attendance
      });
    }

    // Create or update attendance
    if (!attendance) {
      attendance = new Attendance({
        user: targetUserId,
        date: today,
        status: 'present',
        checkInTime: new Date(),
        markedBy: userId ? 'manual' : 'manual'
      });
    } else {
      attendance.checkInTime = new Date();
      attendance.status = 'present';
      attendance.markedBy = userId ? 'manual' : 'manual';
    }

    await attendance.save();

    res.json({
      success: true,
      message: 'Checked in successfully',
      attendance
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check in'
    });
  }
});

// @route   POST /api/attendance/check-out
// @desc    Mark check-out for user (management can check-out for employees)
// @access  Private
router.post('/check-out', protect, async (req, res) => {
  try {
    const today = getStartOfDay(new Date());
    const { userId } = req.body;
    
    // If userId provided, check if user is management
    let targetUserId = req.user.id;
    if (userId) {
      // Check if requester is management (ceo, co_ceo, company_manager, manager)
      const allowedRoles = ['ceo', 'co_ceo', 'company_manager', 'manager'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to check-out for other users'
        });
      }
      targetUserId = userId;
    }

    const attendance = await Attendance.findOne({
      user: targetUserId,
      date: today
    });

    if (!attendance || !attendance.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'Please check in first'
      });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today'
      });
    }

    attendance.checkOutTime = new Date();
    attendance.calculateWorkingHours();
    await attendance.save();

    res.json({
      success: true,
      message: 'Checked out successfully',
      attendance
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check out'
    });
  }
});

// @route   GET /api/attendance/my-status
// @desc    Get current user's attendance status for today
// @access  Private
router.get('/my-status', protect, async (req, res) => {
  try {
    const today = getStartOfDay(new Date());
    const userId = req.user.id;

    // Check for approved leave today
    const todayLeave = await Leave.findOne({
      employee: userId,
      status: 'approved',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    let attendance = await Attendance.findOne({
      user: userId,
      date: today
    }).populate('leave');

    // If no attendance record, create one based on leave status
    if (!attendance) {
      if (todayLeave) {
        attendance = new Attendance({
          user: userId,
          date: today,
          status: 'on_leave',
          leaveType: todayLeave.leaveType === 'uninformed' ? 'unpaid' : 'paid',
          leave: todayLeave._id,
          markedBy: 'auto'
        });
        await attendance.save();
      } else {
        // No check-in and no leave = absent (unpaid)
        attendance = {
          status: 'absent',
          leaveType: 'unpaid',
          checkInTime: null,
          checkOutTime: null
        };
      }
    }

    res.json({
      success: true,
      attendance,
      hasApprovedLeave: !!todayLeave
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance status'
    });
  }
});

// @route   GET /api/attendance/all-status
// @desc    Get all users' attendance status for today (Management only)
// @access  Private (CEO, Co-CEO, Company Manager, Manager)
router.get('/all-status', protect, authorize('ceo', 'co_ceo', 'company_manager', 'manager', 'sales_head', 'production_head'), async (req, res) => {
  try {
    const today = getStartOfDay(new Date());

    // Get all active users
    const users = await User.find({ isActive: true }).select('firstName lastName email role department profilePicture');

    // Get all attendance records for today
    const attendances = await Attendance.find({
      date: today
    }).populate('user', 'firstName lastName email role').populate('leave');

    // Get all approved leaves for today
    const todayLeaves = await Leave.find({
      status: 'approved',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).populate('employee', 'firstName lastName email');

    // Build attendance status for each user
    const attendanceStatus = users.map(user => {
      const userAttendance = attendances.find(a => a.user._id.toString() === user._id.toString());
      const userLeave = todayLeaves.find(l => l.employee._id.toString() === user._id.toString());

      let status = 'absent';
      let leaveType = 'unpaid';
      let checkInTime = null;
      let checkOutTime = null;
      let workingHours = 0;

      if (userAttendance) {
        status = userAttendance.status;
        leaveType = userAttendance.leaveType;
        checkInTime = userAttendance.checkInTime;
        checkOutTime = userAttendance.checkOutTime;
        workingHours = userAttendance.workingHours;
      } else if (userLeave) {
        // On approved leave
        status = 'on_leave';
        leaveType = userLeave.leaveType === 'uninformed' ? 'unpaid' : 'paid';
      }

      return {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          department: user.department,
          profilePicture: user.profilePicture
        },
        status,
        leaveType,
        checkInTime,
        checkOutTime,
        workingHours,
        hasApprovedLeave: !!userLeave
      };
    });

    res.json({
      success: true,
      date: today,
      attendanceStatus
    });
  } catch (error) {
    console.error('Get all status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance status'
    });
  }
});

// @route   GET /api/attendance/history
// @desc    Get attendance history for a user
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const { userId, startDate, endDate, limit = 30 } = req.query;
    const targetUserId = userId || req.user.id;

    // Check authorization
    const canViewAll = ['ceo', 'co_ceo', 'company_manager', 'manager', 'sales_head', 'production_head'].includes(req.user.role);
    
    if (targetUserId !== req.user.id && !canViewAll) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const query = { user: targetUserId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = getStartOfDay(new Date(startDate));
      if (endDate) query.date.$lte = getEndOfDay(new Date(endDate));
    }

    const attendances = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .populate('leave', 'leaveType reason status');

    // Calculate statistics
    const stats = {
      totalDays: attendances.length,
      present: attendances.filter(a => a.status === 'present').length,
      absent: attendances.filter(a => a.status === 'absent').length,
      onLeave: attendances.filter(a => a.status === 'on_leave').length,
      paidLeaves: attendances.filter(a => a.leaveType === 'paid').length,
      unpaidLeaves: attendances.filter(a => a.leaveType === 'unpaid').length,
      totalWorkingHours: attendances.reduce((sum, a) => sum + (a.workingHours || 0), 0)
    };

    res.json({
      success: true,
      attendances,
      stats
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance history'
    });
  }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance record (Management only)
// @access  Private (CEO, Co-CEO, Company Manager)
router.put('/:id', protect, authorize('ceo', 'co_ceo', 'company_manager'), async (req, res) => {
  try {
    const { status, leaveType, notes, checkInTime, checkOutTime } = req.body;

    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    if (status) attendance.status = status;
    if (leaveType !== undefined) attendance.leaveType = leaveType;
    if (notes !== undefined) attendance.notes = notes;
    if (checkInTime) attendance.checkInTime = new Date(checkInTime);
    if (checkOutTime) attendance.checkOutTime = new Date(checkOutTime);

    attendance.markedBy = 'manual';
    attendance.calculateWorkingHours();
    await attendance.save();

    res.json({
      success: true,
      message: 'Attendance updated successfully',
      attendance
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update attendance'
    });
  }
});

module.exports = router;
