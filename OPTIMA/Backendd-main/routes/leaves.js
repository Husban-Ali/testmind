const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/leaves
// @desc    Submit leave request
// @access  Private
router.post('/', protect, [
  body('leaveType').isIn(['sick', 'casual', 'emergency', 'informed', 'uninformed', 'other']),
  body('leaveCount').isInt({ min: 1 }),
  body('leaveDates').optional().isArray(),
  body('reason').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { leaveType, leaveCount, leaveDates, reason } = req.body;

    // Convert leaveDates strings to Date objects if provided
    const parsedDates = leaveDates && leaveDates.length > 0 
      ? leaveDates.map(date => new Date(date))
      : [];

    const leave = await Leave.create({
      employee: req.user.id,
      leaveType,
      leaveCount: parsedDates.length > 0 ? parsedDates.length : leaveCount,
      leaveDates: parsedDates,
      reason
    });

    const populatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'username firstName lastName email');

    res.status(201).json({
      success: true,
      leave: populatedLeave
    });
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/leaves/add-by-management
// @desc    Management adds leave for employee (auto-approved)
// @access  Private (Manager, Company Manager, CEO, Co-CEO, Sales Head, Production Head)
router.post('/add-by-management', protect, authorize('ceo', 'co_ceo', 'company_manager', 'sales_head', 'production_head', 'manager'), [
  body('employeeId').notEmpty(),
  body('leaveType').isIn(['sick', 'casual', 'emergency', 'informed', 'uninformed', 'other']),
  body('leaveCount').isInt({ min: 1 }),
  body('leaveDates').optional().isArray(),
  body('reason').notEmpty().trim(),
  body('leavePaymentStatus').optional().isIn(['paid', 'unpaid'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { employeeId, leaveType, leaveCount, leaveDates, reason, leavePaymentStatus } = req.body;

    // Verify employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Convert leaveDates strings to Date objects if provided
    const parsedDates = leaveDates && leaveDates.length > 0 
      ? leaveDates.map(date => new Date(date))
      : [];

    const leave = await Leave.create({
      employee: employeeId,
      leaveType,
      leaveCount: parsedDates.length > 0 ? parsedDates.length : leaveCount,
      leaveDates: parsedDates,
      reason,
      status: 'approved', // Auto-approved by management
      reviewedBy: req.user.id,
      reviewedAt: Date.now(),
      leavePaymentStatus: leavePaymentStatus || 'paid'
    });

    const populatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'username firstName lastName email')
      .populate('reviewedBy', 'username firstName lastName');

    res.status(201).json({
      success: true,
      message: `Leave added successfully for ${employee.firstName} ${employee.lastName}`,
      leave: populatedLeave
    });
  } catch (error) {
    console.error('Error adding leave by management:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/leaves/my-requests
// @desc    Get logged-in employee's leave requests
// @access  Private
router.get('/my-requests', protect, async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user.id })
      .populate('reviewedBy', 'username firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      leaves
    });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/leaves/my-stats
// @desc    Get logged-in employee's leave statistics
// @access  Private
router.get('/my-stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get all approved leaves
    const approvedLeaves = await Leave.find({
      employee: req.user.id,
      status: 'approved'
    });

    // Calculate stats
    const stats = {
      joiningDate: user.joiningDate || user.createdAt,
      totalLeaves: 0,
      sick: 0,
      casual: 0,
      emergency: 0,
      informed: 0,
      uninformed: 0,
      other: 0
    };

    approvedLeaves.forEach(leave => {
      // Use leaveDates.length if available, otherwise leaveCount
      const count = leave.leaveDates && leave.leaveDates.length > 0 
        ? leave.leaveDates.length 
        : leave.leaveCount;
      stats.totalLeaves += count;
      stats[leave.leaveType] += count;
    });

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching leave stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/leaves/all-requests
// @desc    Get all leave requests (for managers)
// @access  Private (Manager, Company Manager, CEO, Co-CEO)
router.get('/all-requests', protect, authorize('ceo', 'co_ceo', 'company_manager', 'sales_head', 'production_head', 'manager'), async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    const leaves = await Leave.find(query)
      .populate('employee', 'username firstName lastName email createdAt')
      .populate('reviewedBy', 'username firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      leaves
    });
  } catch (error) {
    console.error('Error fetching all leave requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/leaves/employee-stats
// @desc    Get all employees leave statistics (for managers)
// @access  Private (Manager, Company Manager, CEO, Co-CEO)
router.get('/employee-stats', protect, authorize('ceo', 'co_ceo', 'company_manager', 'sales_head', 'production_head', 'manager'), async (req, res) => {
  try {
    // Get all employees
    const employees = await User.find({ isActive: true })
      .select('username firstName lastName email joiningDate createdAt')
      .sort({ firstName: 1 });

    // Get all approved leaves
    const approvedLeaves = await Leave.find({ status: 'approved' });

    // Build stats for each employee
    const employeeStats = employees.map(employee => {
      const employeeLeaves = approvedLeaves.filter(
        leave => leave.employee.toString() === employee._id.toString()
      );

      const stats = {
        employeeId: employee._id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        username: employee.username,
        email: employee.email,
        joiningDate: employee.joiningDate || employee.createdAt,
        totalLeaves: 0,
        sick: 0,
        casual: 0,
        emergency: 0,
        informed: 0,
        uninformed: 0,
        other: 0,
        paidLeaves: 0,
        unpaidLeaves: 0
      };

      employeeLeaves.forEach(leave => {
        // Use leaveDates.length if available, otherwise leaveCount
        const count = leave.leaveDates && leave.leaveDates.length > 0 
          ? leave.leaveDates.length 
          : leave.leaveCount;
        stats.totalLeaves += count;
        stats[leave.leaveType] += count;

        // Track paid/unpaid counts based on leavePaymentStatus
        if (leave.leavePaymentStatus === 'paid') {
          stats.paidLeaves += count;
        } else if (leave.leavePaymentStatus === 'unpaid') {
          stats.unpaidLeaves += count;
        }
      });

      // Ensure Paid = Total - Unpaid (treat remaining as paid)
      stats.paidLeaves = Math.max(0, (stats.totalLeaves || 0) - (stats.unpaidLeaves || 0));

      return stats;
    });

    res.json({
      success: true,
      stats: employeeStats
    });
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/leaves/employee-details/:employeeId
// @desc    Get date-wise leave details for a specific employee
// @access  Private (Employee can see own, Manager can see all)
router.get('/employee-details/:employeeId', protect, async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Check authorization
    const isManager = ['ceo', 'co_ceo', 'company_manager', 'sales_head', 'production_head', 'manager'].includes(req.user.role);
    const isOwnDetails = req.user.id === employeeId;
    
    if (!isManager && !isOwnDetails) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this data'
      });
    }

    // Get employee info
    const employee = await User.findById(employeeId).select('firstName lastName email username joiningDate createdAt');
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Get all leaves for this employee
    const leaves = await Leave.find({ employee: employeeId })
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Build date-wise details
    const dateWiseDetails = [];
    leaves.forEach(leave => {
      if (leave.leaveDates && leave.leaveDates.length > 0) {
        // Date-wise leaves
        leave.leaveDates.forEach(date => {
          dateWiseDetails.push({
            leaveId: leave._id,
            leaveDate: date,
            leaveType: leave.leaveType,
            reason: leave.reason,
            status: leave.status,
            leavePaymentStatus: leave.leavePaymentStatus || 'pending',
            approvedBy: leave.reviewedBy ? `${leave.reviewedBy.firstName} ${leave.reviewedBy.lastName}` : null,
            reviewedAt: leave.reviewedAt,
            submittedAt: leave.createdAt
          });
        });
      } else {
        // Old format: single entry with count
        dateWiseDetails.push({
          leaveId: leave._id,
          leaveDate: null,
          leaveCount: leave.leaveCount,
          leaveType: leave.leaveType,
          reason: leave.reason,
          status: leave.status,
          leavePaymentStatus: leave.leavePaymentStatus || 'pending',
          approvedBy: leave.reviewedBy ? `${leave.reviewedBy.firstName} ${leave.reviewedBy.lastName}` : null,
          reviewedAt: leave.reviewedAt,
          submittedAt: leave.createdAt
        });
      }
    });

    res.json({
      success: true,
      employee: {
        id: employee._id,
        name: `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
        username: employee.username,
        joiningDate: employee.joiningDate || employee.createdAt
      },
      details: dateWiseDetails
    });
  } catch (error) {
    console.error('Error fetching employee leave details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.put('/:id/review', protect, authorize('ceo', 'co_ceo', 'company_manager', 'sales_head', 'production_head', 'manager'), [
  body('status').isIn(['approved', 'rejected']),
  body('rejectionReason').optional(),
  body('leavePaymentStatus').optional().isIn(['paid', 'unpaid'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { status, rejectionReason, leavePaymentStatus } = req.body;

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave request already reviewed'
      });
    }

    leave.status = status;
    leave.reviewedBy = req.user.id;
    leave.reviewedAt = Date.now();
    
    // Set payment status if provided (only when approving)
    if (status === 'approved' && leavePaymentStatus) {
      leave.leavePaymentStatus = leavePaymentStatus;
    } else if (status === 'approved' && !leavePaymentStatus) {
      // Default to 'paid' if not specified
      leave.leavePaymentStatus = 'paid';
    }
    
    if (status === 'rejected' && rejectionReason) {
      leave.rejectionReason = rejectionReason;
    }

    await leave.save();

    const updatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'username firstName lastName email')
      .populate('reviewedBy', 'username firstName lastName');

    // AUTO-UPDATE ATTENDANCE based on leave status
    // Helper to get start/end of day
    const getStartOfDay = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    // Update attendance for each day of the leave period
    if (updatedLeave.startDate && updatedLeave.endDate) {
      const startDate = new Date(updatedLeave.startDate);
      const endDate = new Date(updatedLeave.endDate);
      
      // Loop through each day in the leave period
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dayStart = getStartOfDay(date);
        
        try {
          if (status === 'approved') {
            // Mark as on_leave with paid/unpaid based on leave type
            const leaveType = ['uninformed', 'other'].includes(updatedLeave.leaveType) ? 'unpaid' : 'paid';
            
            await Attendance.findOneAndUpdate(
              { user: updatedLeave.employee._id, date: dayStart },
              {
                user: updatedLeave.employee._id,
                date: dayStart,
                status: 'on_leave',
                leaveType: leaveType,
                leave: updatedLeave._id,
                markedBy: 'auto'
              },
              { upsert: true, new: true }
            );
          } else if (status === 'rejected') {
            // Leave rejected = absent (unpaid) if no check-in
            const existingAttendance = await Attendance.findOne({
              user: updatedLeave.employee._id,
              date: dayStart
            });
            
            // Only mark as absent if they didn't check in
            if (!existingAttendance || !existingAttendance.checkInTime) {
              await Attendance.findOneAndUpdate(
                { user: updatedLeave.employee._id, date: dayStart },
                {
                  user: updatedLeave.employee._id,
                  date: dayStart,
                  status: 'absent',
                  leaveType: 'unpaid',
                  leave: null,
                  markedBy: 'auto'
                },
                { upsert: true, new: true }
              );
            }
          }
        } catch (attendanceError) {
          console.error('Error updating attendance for date:', dayStart, attendanceError);
        }
      }
    }

    // Emit notification via socket
    const io = req.app.get('io');
    if (io && updatedLeave.employee) {
      io.to(updatedLeave.employee._id.toString()).emit('leave:reviewed', {
        leave: updatedLeave,
        status
      });
    }

    res.json({
      success: true,
      leave: updatedLeave
    });
  } catch (error) {
    console.error('Error reviewing leave request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/leaves/:id/payment-status
// @desc    Update payment status of approved leave
// @access  Private (Manager, Company Manager, CEO, Co-CEO)
router.put('/:id/payment-status', protect, authorize('ceo', 'co_ceo', 'company_manager', 'sales_head', 'production_head', 'manager'), [
  body('leavePaymentStatus').isIn(['paid', 'unpaid'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { leavePaymentStatus } = req.body;

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (leave.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Can only update payment status for approved leaves'
      });
    }

    leave.leavePaymentStatus = leavePaymentStatus;
    await leave.save();

    const updatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'username firstName lastName email')
      .populate('reviewedBy', 'username firstName lastName');

    res.json({
      success: true,
      leave: updatedLeave,
      message: `Payment status updated to ${leavePaymentStatus}`
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/leaves/:id
// @desc    Delete leave request (only if pending)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Only allow employee to delete their own pending requests
    if (leave.employee.toString() !== req.user.id || leave.status !== 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this leave request'
      });
    }

    await leave.deleteOne();

    res.json({
      success: true,
      message: 'Leave request deleted'
    });
  } catch (error) {
    console.error('Error deleting leave request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
