const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const EODReport = require('../models/EODReport');
const Channel = require('../models/Channel');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/eod
// @desc    Submit EOD report
// @access  Private (All employees EXCEPT CEO, CO-CEO, Company Manager, Manager)
router.post('/', protect, [
  body('date').isISO8601().withMessage('Valid date is required')
], async (req, res) => {
  try {
    // Block CEO, CO-CEO, and Managers from submitting
    // BUT allow Company Manager to submit (as per requirement)
    const cannotSubmitRoles = ['ceo', 'co_ceo', 'manager'];
    
    if (cannotSubmitRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Top management roles (CEO, CO-CEO, Manager) cannot submit EOD reports. Only employees, department heads, and Company Managers can submit.'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { date, content, tasksCompleted, tasksInProgress, blockers, hoursWorked, projects } = req.body;

    // Validate that at least one field has content
    const hasTasksCompleted = tasksCompleted && tasksCompleted.filter(t => t.trim()).length > 0;
    const hasTasksInProgress = tasksInProgress && tasksInProgress.filter(t => t.trim()).length > 0;
    const hasBlockers = blockers && blockers.filter(b => b.trim()).length > 0;
    const hasContent = content && content.trim();
    const hasHoursWorked = hoursWorked && hoursWorked > 0;

    if (!hasTasksCompleted && !hasTasksInProgress && !hasBlockers && !hasContent && !hasHoursWorked) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one of: Tasks Completed, Tasks In Progress, Blockers, Additional Notes, or Hours Worked'
      });
    }

    // Check if EOD report already exists for this date
    const existingReport = await EODReport.findOne({
      user: req.user.id,
      date: new Date(date).setHours(0, 0, 0, 0)
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'EOD report already submitted for this date'
      });
    }

    // Create EOD report
    const eodReport = await EODReport.create({
      user: req.user.id,
      date,
      content,
      tasksCompleted,
      tasksInProgress,
      blockers,
      hoursWorked,
      projects
    });

    // Find EOD channel
    const eodChannel = await Channel.findOne({ type: 'eod' });

    if (eodChannel) {
      // Create message in EOD channel
      const message = await Message.create({
        channel: eodChannel._id,
        sender: req.user.id,
        content: formatEODMessage(req.user, eodReport),
        type: 'text'
      });

      eodReport.message = message._id;
      await eodReport.save();

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'username firstName lastName avatar');

      // Emit socket event
      const io = req.app.get('io');
      io.to(eodChannel._id.toString()).emit('message:new', populatedMessage);
      io.to(eodChannel._id.toString()).emit('eod:submitted', {
        report: eodReport,
        user: req.user
      });
    }

    const populatedReport = await EODReport.findById(eodReport._id)
      .populate('user', 'username firstName lastName avatar')
      .populate('projects', 'name');

    res.status(201).json({
      success: true,
      report: populatedReport
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function to format EOD message
function formatEODMessage(user, report) {
  let message = `📊 **EOD Report - ${new Date(report.date).toLocaleDateString()}**\n\n`;
  message += `👤 **Employee:** ${user.firstName} ${user.lastName}\n\n`;
  
  if (report.tasksCompleted && report.tasksCompleted.length > 0) {
    message += `✅ **Tasks Completed:**\n`;
    report.tasksCompleted.forEach(task => {
      message += `  • ${task}\n`;
    });
    message += '\n';
  }
  
  if (report.tasksInProgress && report.tasksInProgress.length > 0) {
    message += `🔄 **Tasks In Progress:**\n`;
    report.tasksInProgress.forEach(task => {
      message += `  • ${task}\n`;
    });
    message += '\n';
  }
  
  if (report.blockers && report.blockers.length > 0) {
    message += `🚧 **Blockers:**\n`;
    report.blockers.forEach(blocker => {
      message += `  • ${blocker}\n`;
    });
    message += '\n';
  }
  
  if (report.hoursWorked) {
    message += `⏰ **Hours Worked:** ${report.hoursWorked}\n\n`;
  }
  
  if (report.content) {
    message += `📝 **Additional Notes:**\n${report.content}`;
  }
  
  return message;
}

// @route   GET /api/eod
// @desc    Get EOD reports
// @access  Private (Top management can see all, employees and heads see their own)
router.get('/', protect, async (req, res) => {
  try {
    const { userId, startDate, endDate, status } = req.query;
    let query = {};

    // Apply role-based access control for Company Manager reports
    // Only CEO, Co-CEO can see Company Manager reports
    // Normal managers and others should not see Company Manager reports
    const isCEO = req.user.role === 'ceo';
    const isCoCEO = req.user.role === 'co_ceo';
    const isCompanyManager = req.user.role === 'company_manager';
    const isNormalManager = req.user.role === 'manager';
    
    // Check if user can view Company Manager reports
    const canViewCompanyManagerReports = isCEO || isCoCEO;
    
    // For non-top management, they can only see their own reports
    const isNonManagement = !['ceo', 'co_ceo', 'company_manager', 'manager', 'sales_head', 'production_head'].includes(req.user.role);

    if (isNonManagement) {
      // Regular employees can only see their own reports
      query.user = req.user.id;
    } else if (userId) {
      // If a specific user is requested, check if current user is authorized to view that user's reports
      query.user = userId;
      
      // If requesting a Company Manager's reports, check permissions
      const targetUser = await User.findById(userId);
      if (targetUser && targetUser.role === 'company_manager' && !canViewCompanyManagerReports) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view Company Manager EOD reports'
        });
      }
    } else {
      // For management roles, apply appropriate filtering
      if (isNormalManager) {
        // Normal managers follow existing visibility rules
        // They can see their own reports and reports from their subordinates
        // But NOT Company Manager reports
        query.$and = [
          { 
            $or: [
              { user: req.user.id } // Their own reports
              // Add logic here for subordinate reports if needed
            ]
          }
        ];
      } else if (!canViewCompanyManagerReports && !isCompanyManager) {
        // Other management roles (except CEO, Co-CEO, Company Manager) cannot see Company Manager reports
        // Get all users except Company Managers
        const nonCompanyManagers = await User.find({ role: { $ne: 'company_manager' } }).select('_id');
        const nonCompanyManagerIds = nonCompanyManagers.map(user => user._id);
        
        // Filter to only show reports from non-Company Managers
        query.user = { $in: nonCompanyManagerIds };
      }
      // CEO, Co-CEO, and Company Manager can see all reports (or relevant reports), no additional filtering needed for them
      // Company Manager can see all reports as per business logic
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (status) {
      query.status = status;
    }

    const reports = await EODReport.find(query)
      .populate('user', 'username firstName lastName avatar role')
      .populate('projects', 'name status')
      .populate('reviewedBy', 'username firstName lastName')
      .sort({ date: -1 });

    // Additional filtering: Remove Company Manager reports for those not authorized
    const filteredReports = reports.filter(report => {
      const isReportFromCompanyManager = report.user && report.user.role === 'company_manager';
      
      // If the report is from a Company Manager, only CEO and Co-CEO can see it
      if (isReportFromCompanyManager && !canViewCompanyManagerReports) {
        return false;
      }
      
      return true;
    });

    res.json({
      success: true,
      count: filteredReports.length,
      reports: filteredReports
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/eod/:id
// @desc    Get EOD report by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const report = await EODReport.findById(req.params.id)
      .populate('user', 'username firstName lastName avatar email role')
      .populate('projects', 'name status manager')
      .populate('reviewedBy', 'username firstName lastName')
      .populate('message');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'EOD report not found'
      });
    }

    // Check if user still exists
    if (!report.user) {
      return res.status(404).json({
        success: false,
        message: 'User associated with this report no longer exists'
      });
    }

    // Check access based on roles
    const isCEO = req.user.role === 'ceo';
    const isCoCEO = req.user.role === 'co_ceo';
    const isCompanyManager = req.user.role === 'company_manager';
    const isNormalManager = req.user.role === 'manager';
    const isLeadership = ['ceo', 'co_ceo', 'company_manager', 'sales_head', 'production_head', 'manager'].includes(req.user.role);
    
    // Check if user can view Company Manager reports
    const canViewCompanyManagerReports = isCEO || isCoCEO;
    
    // Check if the report belongs to a Company Manager
    const isReportFromCompanyManager = report.user && report.user.role === 'company_manager';

    // Apply access control rules:
    // 1. Company Manager reports can only be viewed by CEO and Co-CEO
    if (isReportFromCompanyManager && !canViewCompanyManagerReports) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this Company Manager report'
      });
    }
    
    // 2. Regular employees can only view their own reports
    if (!isLeadership && report.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this report'
      });
    }
    
    // 3. Normal managers follow existing visibility rules and cannot see Company Manager reports
    if (isNormalManager && isReportFromCompanyManager) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view Company Manager EOD reports'
      });
    }

    // 4. Other leadership roles can view reports from their subordinates
    // (Existing logic can be extended here if needed)

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/eod/:id
// @desc    Update EOD report
// @access  Private (Employees only - before review)
router.put('/:id', protect, async (req, res) => {
  try {
    const report = await EODReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'EOD report not found'
      });
    }

    // Check if user is the owner and NOT a top management role
    const cannotSubmitRoles = ['ceo', 'co_ceo', 'company_manager', 'manager'];
    
    if (report.user.toString() !== req.user.id || cannotSubmitRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report'
      });
    }

    // Can't update if already reviewed
    if (report.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update report that has been reviewed'
      });
    }

    const { content, tasksCompleted, tasksInProgress, blockers, hoursWorked, projects } = req.body;

    if (content) report.content = content;
    if (tasksCompleted) report.tasksCompleted = tasksCompleted;
    if (tasksInProgress) report.tasksInProgress = tasksInProgress;
    if (blockers) report.blockers = blockers;
    if (hoursWorked !== undefined) report.hoursWorked = hoursWorked;
    if (projects) report.projects = projects;

    await report.save();

    // Update message in EOD channel
    if (report.message) {
      await Message.findByIdAndUpdate(report.message, {
        content: formatEODMessage(req.user, report),
        isEdited: true,
        editedAt: Date.now()
      });
    }

    const updatedReport = await EODReport.findById(report._id)
      .populate('user', 'username firstName lastName avatar')
      .populate('projects', 'name');

    res.json({
      success: true,
      report: updatedReport
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/eod/:id/review
// @desc    Review EOD report
// @access  Private (CEO, CO-CEO, Company Manager, Sales Head, Production Head, Manager)
router.put('/:id/review', protect, authorize('ceo', 'co_ceo', 'company_manager', 'sales_head', 'production_head', 'manager'), [
  body('status').isIn(['reviewed', 'approved'])
], async (req, res) => {
  try {
    const { status } = req.body;

    const report = await EODReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'EOD report not found'
      });
    }

    report.status = status;
    report.reviewedBy = req.user.id;
    report.reviewedAt = Date.now();

    await report.save();

    const updatedReport = await EODReport.findById(report._id)
      .populate('user', 'username firstName lastName avatar')
      .populate('reviewedBy', 'username firstName lastName');

    // Emit notification to user only if user exists
    if (updatedReport.user) {
      const io = req.app.get('io');
      io.to(updatedReport.user._id.toString()).emit('eod:reviewed', {
        report: updatedReport,
        status
      });
    }

    res.json({
      success: true,
      report: updatedReport
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/eod/user/:userId/stats
// @desc    Get EOD statistics for a user
// @access  Private (Leadership roles or self)
router.get('/user/:userId/stats', protect, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check authorization - leadership can view all, others can view only their own
    const isLeadership = ['ceo', 'co_ceo', 'company_manager', 'sales_head', 'production_head', 'manager'].includes(req.user.role);
    
    if (req.user.id !== userId && !isLeadership) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { startDate, endDate } = req.query;
    const query = { user: userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const reports = await EODReport.find(query);

    const stats = {
      totalReports: reports.length,
      submitted: reports.filter(r => r.status === 'submitted').length,
      reviewed: reports.filter(r => r.status === 'reviewed').length,
      approved: reports.filter(r => r.status === 'approved').length,
      totalHours: reports.reduce((sum, r) => sum + (r.hoursWorked || 0), 0),
      averageHours: reports.length > 0 ? 
        (reports.reduce((sum, r) => sum + (r.hoursWorked || 0), 0) / reports.length).toFixed(2) : 0
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/eod/reports/weekly
// @desc    Generate weekly EOD report for download (Admin/Super Admin only)
// @access  Private (Admin, Super Admin)
router.get('/reports/weekly', protect, authorize('ceo', 'co_ceo'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const reports = await EODReport.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
      .populate('user', 'username firstName lastName email')
      .populate('projects', 'name')
      .sort({ date: 1, user: 1 });

    // Group reports by user
    const userReports = {};
    const userStats = {};

    reports.forEach(report => {
      // Skip reports where user no longer exists
      if (!report.user) {
        return;
      }
      
      const userId = report.user._id.toString();
      const userName = `${report.user.firstName} ${report.user.lastName}`;

      if (!userReports[userId]) {
        userReports[userId] = {
          user: report.user,
          reports: [],
          totalTasks: 0,
          totalHours: 0
        };
      }

      userReports[userId].reports.push(report);
      userReports[userId].totalTasks += (report.tasksCompleted?.length || 0);
      userReports[userId].totalHours += (report.hoursWorked || 0);
    });

    // Generate HTML report
    const html = generateWeeklyReportHTML(userReports, startDate, endDate);

    res.json({
      success: true,
      html,
      summary: Object.values(userReports).map(ur => ({
        user: `${ur.user.firstName} ${ur.user.lastName}`,
        totalTasks: ur.totalTasks,
        totalHours: ur.totalHours,
        reportsSubmitted: ur.reports.length
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function to generate HTML report
function generateWeeklyReportHTML(userReports, startDate, endDate) {
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Weekly EOD Report</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
          .page-break { page-break-after: always; }
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          background: #fff;
          color: #333;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #b6965f;
          padding-bottom: 20px;
        }
        
        .company-name {
          font-size: 32px;
          font-weight: bold;
          color: #396068;
          margin-bottom: 5px;
        }
        
        .company-subtitle {
          font-size: 16px;
          color: #b6965f;
          letter-spacing: 2px;
          margin-bottom: 20px;
        }
        
        .report-title {
          font-size: 24px;
          color: #396068;
          margin: 20px 0 10px 0;
        }
        
        .report-period {
          font-size: 16px;
          color: #666;
          margin-bottom: 10px;
        }
        
        .report-date {
          font-size: 14px;
          color: #999;
        }
        
        .summary-section {
          margin: 30px 0;
        }
        
        .summary-title {
          font-size: 20px;
          color: #396068;
          border-left: 4px solid #b6965f;
          padding-left: 15px;
          margin-bottom: 20px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        th {
          background: linear-gradient(135deg, #396068, #2d4d54);
          color: white;
          padding: 15px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
        }
        
        td {
          padding: 12px 15px;
          border-bottom: 1px solid #eee;
        }
        
        tr:hover {
          background: rgba(182, 150, 95, 0.05);
        }
        
        .employee-name {
          font-weight: 600;
          color: #396068;
        }
        
        .total-row {
          background: rgba(182, 150, 95, 0.1);
          font-weight: bold;
        }
        
        .total-row td {
          border-top: 2px solid #b6965f;
          padding: 15px;
        }
        
        .employee-section {
          margin: 40px 0;
          page-break-inside: avoid;
        }
        
        .employee-header {
          background: linear-gradient(135deg, #396068, #2d4d54);
          color: white;
          padding: 15px 20px;
          border-radius: 8px 8px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .employee-header h3 {
          margin: 0;
          font-size: 1.3rem;
        }
        
        .employee-stats {
          display: flex;
          gap: 20px;
          font-size: 0.9rem;
        }
        
        .daily-report {
          background: white;
          border: 1px solid #e0e0e0;
          border-top: none;
          padding: 20px;
        }
        
        .daily-report:last-child {
          border-radius: 0 0 8px 8px;
        }
        
        .report-date-header {
          font-weight: 600;
          color: #b6965f;
          margin-bottom: 15px;
          font-size: 1.1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid rgba(182, 150, 95, 0.2);
          padding-bottom: 10px;
        }
        
        .tasks-section {
          margin: 15px 0;
        }
        
        .tasks-section h4 {
          color: #396068;
          font-size: 1rem;
          margin-bottom: 10px;
        }
        
        .task-list {
          list-style: none;
          padding: 0;
          margin: 0 0 15px 0;
        }
        
        .task-list li {
          padding: 8px 0 8px 25px;
          position: relative;
          color: #555;
          line-height: 1.5;
        }
        
        .task-list li:before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #2ecc71;
          font-weight: bold;
          font-size: 1.2rem;
        }
        
        .task-list.in-progress li:before {
          content: '⟳';
          color: #f39c12;
        }
        
        .task-list.blockers li:before {
          content: '⚠';
          color: #e74c3c;
        }
        
        .signature-section {
          margin-top: 80px;
          page-break-inside: avoid;
        }
        
        .signature-row {
          display: flex;
          justify-content: space-between;
          margin-top: 100px;
        }
        
        .signature-box {
          flex: 1;
          text-align: center;
          padding: 0 20px;
        }
        
        .signature-line {
          border-top: 2px solid #333;
          margin-bottom: 10px;
          padding-top: 10px;
        }
        
        .signature-title {
          font-weight: 600;
          color: #396068;
          font-size: 14px;
        }
        
        .signature-subtitle {
          color: #999;
          font-size: 12px;
          margin-top: 5px;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #999;
          font-size: 12px;
        }
        
        .print-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #b6965f, #d4b883);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          z-index: 1000;
        }
        
        .print-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.3);
        }
      </style>
    </head>
    <body>
      <button class="print-btn no-print" onclick="window.print()">🖨️ Print Report</button>
      
      <div class="header">
        <div class="company-name">Radiant Solutions RS (PVT) LTD</div>
        <div class="company-subtitle">WEEKLY EOD PERFORMANCE REPORT</div>
        <div class="report-title">End of Day Reports Summary</div>
        <div class="report-period">Period: ${formatDate(startDate)} - ${formatDate(endDate)}</div>
        <div class="report-date">Generated on: ${new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</div>
      </div>
      
      <div class="summary-section">
        <h2 class="summary-title">Team Performance Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Reports Submitted</th>
              <th>Tasks Completed</th>
              <th>Total Hours</th>
              <th>Avg Hours/Day</th>
            </tr>
          </thead>
          <tbody>
  `;

  let totalReports = 0;
  let totalTasks = 0;
  let totalHours = 0;

  Object.values(userReports).forEach(userReport => {
    const avgHours = (userReport.totalHours / (userReport.reports.length || 1)).toFixed(1);
    totalReports += userReport.reports.length;
    totalTasks += userReport.totalTasks;
    totalHours += userReport.totalHours;

    html += `
      <tr>
        <td class="employee-name">${userReport.user.firstName} ${userReport.user.lastName}</td>
        <td>${userReport.reports.length}</td>
        <td>${userReport.totalTasks}</td>
        <td>${userReport.totalHours.toFixed(1)} hrs</td>
        <td>${avgHours} hrs</td>
      </tr>
    `;
  });

  html += `
            <tr class="total-row">
              <td>TOTAL</td>
              <td>${totalReports}</td>
              <td>${totalTasks}</td>
              <td>${totalHours.toFixed(1)} hrs</td>
              <td>-</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="summary-section">
        <h2 class="summary-title">Task Summary by Employee</h2>
  `;

  // Add simplified task summary for each employee
  Object.values(userReports).forEach(userReport => {
    // Collect all tasks from all reports
    const allCompletedTasks = [];
    const allInProgressTasks = [];
    const allBlockers = [];

    userReport.reports.forEach(report => {
      if (report.tasksCompleted) {
        allCompletedTasks.push(...report.tasksCompleted);
      }
      if (report.tasksInProgress) {
        allInProgressTasks.push(...report.tasksInProgress);
      }
      if (report.blockers) {
        allBlockers.push(...report.blockers);
      }
    });

    html += `
      <div class="employee-section">
        <div class="employee-header">
          <h3>👤 ${userReport.user.firstName} ${userReport.user.lastName}</h3>
          <div class="employee-stats">
            <span>✅ ${allCompletedTasks.length} Tasks Done</span>
            <span>⏰ ${userReport.totalHours.toFixed(1)} Total Hours</span>
          </div>
        </div>
        <div class="daily-report">
    `;

    // Tasks Completed
    if (allCompletedTasks.length > 0) {
      html += `
        <div class="tasks-section">
          <h4>✅ All Completed Tasks (${allCompletedTasks.length})</h4>
          <ul class="task-list">
      `;
      allCompletedTasks.forEach(task => {
        html += `<li>${task}</li>`;
      });
      html += `
          </ul>
        </div>
      `;
    } else {
      html += `
        <div class="tasks-section">
          <p style="color: #999; font-style: italic;">No tasks completed this week.</p>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;
  });

  html += `
      </div>
      
      <div class="signature-section">
        <h2 class="summary-title">Approval & Authorization</h2>
        <p style="color: #666; margin-bottom: 60px;">This report has been reviewed and approved by the following authorities:</p>
        
        <div class="signature-row">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-title">IT Manager</div>
            <div class="signature-subtitle">Technical Review</div>
          </div>
          
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-title">Office Manager</div>
            <div class="signature-subtitle">Administrative Review</div>
          </div>
          
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-title">Chief Executive Officer</div>
            <div class="signature-subtitle">Final Approval</div>
          </div>
        </div>
      </div>
      
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Radiant Solutions RS (PVT) LTD. All rights reserved.</p>
        <p>This is a confidential document. Unauthorized distribution is prohibited.</p>
      </div>
    </body>
    </html>
  `;

  return html;
}

module.exports = router;
