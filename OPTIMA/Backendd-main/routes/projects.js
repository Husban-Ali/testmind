const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Channel = require('../models/Channel');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');


router.post('/', protect, authorize('ceo', 'co_ceo', 'company_manager', 'sales_head', 'manager'), [
  body('name').notEmpty().trim(),
  body('projectValue').isNumeric().withMessage('Project value must be a number'),
  body('clientName').notEmpty().trim(),
  body('profileName').notEmpty().trim(),
  body('platform').notEmpty().trim(),
  body('paidAmount').isNumeric().withMessage('Paid amount must be a number'),
  body('remainingAmount').isNumeric().withMessage('Remaining amount must be a number'),
  body('department').optional().isIn(['general', 'sales', 'production'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description, members, startDate, endDate, department, projectValue, clientName, profileName, platform, paidAmount, remainingAmount, remarks } = req.body;

    let assignedDepartment = department || 'general';
    if (req.user.role === 'sales_head') {
      assignedDepartment = 'sales';
    } else if (req.user.role === 'production_head') {
      assignedDepartment = 'production';
    }

    // Get all leadership roles (CEO, CO-CEO, Company Manager, Sales Head, Production Head)
    const leadership = await User.find({
      role: { $in: ['ceo', 'co_ceo', 'company_manager', 'sales_head', 'production_head'] },
      isActive: true
    }).select('_id');
    
    const leadershipIds = leadership.map(u => u._id);

    // Create project (no manager field)
    const project = await Project.create({
      name,
      description,
      createdBy: req.user.id,
      members: members || [],
      startDate,
      endDate,
      department: assignedDepartment,
      projectValue,
      clientName,
      profileName,
      platform,
      paidAmount,
      remainingAmount,
      remarks: remarks || ''
    });

    // Create project channel with leadership + members
    const channelMembers = [...new Set([...leadershipIds, ...members])];
    
    const channel = await Channel.create({
      name: `${name} - Project Channel`,
      description: `Project channel for ${name}`,
      type: 'project',
      createdBy: req.user.id,
      members: channelMembers,
      admins: leadershipIds,
      project: project._id
    });

    project.channel = channel._id;
    await project.save();

    // Update users - add project to assigned projects and add channel
    // Only members get assigned projects, leadership already has access
    await User.updateMany(
      { _id: { $in: members } },
      { 
        $addToSet: { 
          assignedProjects: project._id,
          channels: channel._id
        }
      }
    );

    // For sales department projects, add project value to sales employees AND sales head
    if (assignedDepartment === 'sales' && projectValue > 0) {
      // Add project value to each sales employee's projectValues
      for (const employeeId of members) {
        const employee = await User.findById(employeeId);
        if (employee && (employee.role === 'sales_employee' || employee.role === 'sales_head')) {
          // Check if this project already has a value entry
          const existingIndex = employee.projectValues.findIndex(
            pv => pv.project.toString() === project._id.toString()
          );

          if (existingIndex === -1) {
            // Add new project value entry
            employee.projectValues.push({
              project: project._id,
              value: projectValue,
              submittedAt: Date.now()
            });
            await employee.save();
          }
        }
      }
    }

    // Add channel to leadership
    await User.updateMany(
      { _id: { $in: leadershipIds } },
      { 
        $addToSet: { 
          channels: channel._id
        }
      }
    );

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'username firstName lastName')
      .populate('members', 'username firstName lastName avatar')
      .populate('channel', 'name');

    // Emit socket event to members only
    const io = req.app.get('io');
    members.forEach(userId => {
      io.to(userId.toString()).emit('project:assigned', populatedProject);
    });

    res.status(201).json({
      success: true,
      project: populatedProject
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/projects
// @desc    Get all projects
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, department } = req.query;
    let query = { isActive: true };

    // Sales employees can only see sales projects
    if (req.user.role === 'sales_employee') {
      query.department = 'sales';
      query.members = req.user.id;
    }

    // Production employees can only see production projects
    if (req.user.role === 'production_employee') {
      query.department = 'production';
      query.members = req.user.id;
    }

    // Sales Head can only see sales projects
    if (req.user.role === 'sales_head') {
      query.department = 'sales';
    }

    // Production Head can see ALL projects (no department filter)
    // No additional filter needed for production_head

    // Regular employees can only see their assigned projects
    if (req.user.role === 'employee') {
      query.members = req.user.id;
    }

    // CEO, CO-CEO, Company Manager can filter by department
    if (department && ['ceo', 'co_ceo', 'company_manager'].includes(req.user.role)) {
      query.department = department;
    }

    if (status) {
      query.status = status;
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'username firstName lastName')
      .populate('members', 'username firstName lastName avatar')
      .populate('channel', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName')
      .populate('members', 'username firstName lastName avatar email status')
      .populate('channel', 'name type');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check access - employees can only see their assigned projects
    const isEmployee = ['employee', 'sales_employee', 'production_employee'].includes(req.user.role);
    if (isEmployee && 
        !project.members.some(m => m._id.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this project'
      });
    }

    // Sales Head can only see sales projects
    if (req.user.role === 'sales_head' && project.department !== 'sales') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this project'
      });
    }

    // Production Head can see ALL projects (no restriction)

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Admin, Manager of project, Super Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization - Production Head removed (read-only access)
    const hasAuthority = ['ceo', 'co_ceo', 'company_manager'].includes(req.user.role);
    const isSalesHead = req.user.role === 'sales_head' && project.department === 'sales';

    if (!hasAuthority && !isSalesHead) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    const { name, description, status, endDate, projectValue } = req.body;

    const oldProjectValue = project.projectValue;

    if (name) project.name = name;
    if (description) project.description = description;
    if (status) project.status = status;
    if (endDate) project.endDate = endDate;
    if (projectValue !== undefined) project.projectValue = projectValue;

    await project.save();

    // If project value changed for sales project, update sales employees' and sales head's values
    if (projectValue !== undefined && projectValue !== oldProjectValue && project.department === 'sales') {
      for (const memberId of project.members) {
        const employee = await User.findById(memberId);
        if (employee && (employee.role === 'sales_employee' || employee.role === 'sales_head')) {
          // Find and update the project value entry
          const existingIndex = employee.projectValues.findIndex(
            pv => pv.project.toString() === project._id.toString()
          );

          if (existingIndex !== -1) {
            // Update existing value
            employee.projectValues[existingIndex].value = projectValue;
            employee.projectValues[existingIndex].submittedAt = Date.now();
            await employee.save();
          } else if (projectValue > 0) {
            // Add new entry if value is positive
            employee.projectValues.push({
              project: project._id,
              value: projectValue,
              submittedAt: Date.now()
            });
            await employee.save();
          }
        }
      }
    }

    const updatedProject = await Project.findById(project._id)
      .populate('members', 'username firstName lastName avatar');

    // Emit socket event
    const io = req.app.get('io');
    project.members.forEach(member => {
      io.to(member._id.toString()).emit('project:updated', updatedProject);
    });

    res.json({
      success: true,
      project: updatedProject
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/projects/:id/members
// @desc    Assign members to project
// @access  Private (CEO, CO-CEO, Company Manager, Sales Head, Manager)
router.post('/:id/members', protect, authorize('ceo', 'co_ceo', 'company_manager', 'sales_head', 'manager'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization - Production Head removed (read-only access)
    const hasAuthority = ['ceo', 'co_ceo', 'company_manager'].includes(req.user.role);
    const isSalesHead = req.user.role === 'sales_head' && project.department === 'sales';

    if (!hasAuthority && !isSalesHead) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { userIds } = req.body;

    // Add members to project
    const newMembers = userIds.filter(id => !project.members.includes(id));
    project.members.push(...newMembers);
    await project.save();

    // Add members to project channel
    if (project.channel) {
      const channel = await Channel.findById(project.channel);
      newMembers.forEach(userId => {
        if (!channel.members.includes(userId)) {
          channel.members.push(userId);
        }
      });
      await channel.save();
    }

    // Update users
    await User.updateMany(
      { _id: { $in: newMembers } },
      { 
        $addToSet: { 
          assignedProjects: project._id,
          channels: project.channel
        }
      }
    );

    // Add project value to new sales employees and sales head
    if (project.department === 'sales' && project.projectValue > 0) {
      for (const memberId of newMembers) {
        const employee = await User.findById(memberId);
        if (employee && (employee.role === 'sales_employee' || employee.role === 'sales_head')) {
          // Check if project value entry already exists
          const existingIndex = employee.projectValues.findIndex(
            pv => pv.project.toString() === project._id.toString()
          );

          if (existingIndex === -1) {
            // Add new project value entry
            employee.projectValues.push({
              project: project._id,
              value: project.projectValue,
              submittedAt: Date.now()
            });
            await employee.save();
          }
        }
      }
    }

    const updatedProject = await Project.findById(project._id)
      .populate('members', 'username firstName lastName avatar');

    // Emit socket event
    const io = req.app.get('io');
    newMembers.forEach(userId => {
      io.to(userId).emit('project:assigned', updatedProject);
    });

    res.json({
      success: true,
      project: updatedProject
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/projects/:id/members/:userId
// @desc    Remove member from project
// @access  Private (CEO, CO-CEO, Company Manager, Sales Head, Manager)
router.delete('/:id/members/:userId', protect, authorize('ceo', 'co_ceo', 'company_manager', 'sales_head', 'manager'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization - Production Head removed (read-only access)
    const hasAuthority = ['ceo', 'co_ceo', 'company_manager'].includes(req.user.role);
    const isSalesHead = req.user.role === 'sales_head' && project.department === 'sales';

    if (!hasAuthority && !isSalesHead) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    project.members = project.members.filter(m => m.toString() !== req.params.userId);
    await project.save();

    // Remove from project channel
    if (project.channel) {
      const channel = await Channel.findById(project.channel);
      channel.members = channel.members.filter(m => m.toString() !== req.params.userId);
      await channel.save();
    }

    // Update user
    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { 
        assignedProjects: project._id,
        channels: project.channel
      }
    });

    // Emit socket event
    const io = req.app.get('io');
    io.to(req.params.userId).emit('project:removed', { projectId: project._id });

    res.json({
      success: true,
      message: 'Member removed from project'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete/deactivate project
// @access  Private (Admin, Super Admin)
router.delete('/:id', protect, authorize('ceo', 'co_ceo'), async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Deactivate project channel
    if (project.channel) {
      await Channel.findByIdAndUpdate(project.channel, { isActive: false });
    }

    // Emit socket event
    const io = req.app.get('io');
    project.members.forEach(member => {
      io.to(member.toString()).emit('project:deleted', { projectId: project._id });
    });

    res.json({
      success: true,
      message: 'Project deactivated successfully'
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
