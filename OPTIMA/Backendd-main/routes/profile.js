const express = require('express');
const router = express.Router();
const multer = require('multer');
const { upload: cloudinaryUpload, cloudinary } = require('../config/cloudinary');
const { protect, authorize } = require('../middleware/auth');
const axios = require('axios');
const User = require('../models/User');
const EODReport = require('../models/EODReport');
const Leave = require('../models/Leave');

// Configure multer for memory storage (images)
const storage = multer.memoryStorage();
const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// @route   GET /api/profile/my-profile
// @desc    Get current user's profile
// @access  Private
router.get('/my-profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      profile: user
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/profile/update
// @desc    Update current user's profile (RESTRICTED - employees cannot edit their own profiles)
// @access  Private
router.put('/update', protect, async (req, res) => {
  try {
    // Block all employees from updating their own profile
    return res.status(403).json({
      success: false,
      message: 'You cannot edit your own profile. Only management (CEO/Co-CEO/Company Manager) can update employee profiles.'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/profile/upload-picture
// @desc    Upload profile picture (RESTRICTED - only management can upload)
// @access  Private
router.post('/upload-picture', protect, imageUpload.single('profilePicture'), async (req, res) => {
  try {
    // Block employees from uploading their own profile picture
    return res.status(403).json({
      success: false,
      message: 'You cannot upload your own profile picture. Only management can update employee profiles.'
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture'
    });
  }
});

// @route   POST /api/profile/upload-cnic-front
// @desc    Upload CNIC front image (RESTRICTED - only management can upload)
// @access  Private
router.post('/upload-cnic-front', protect, imageUpload.single('cnicFront'), async (req, res) => {
  try {
    // Block employees from uploading their own CNIC
    return res.status(403).json({
      success: false,
      message: 'You cannot upload your own CNIC. Only management can update employee profiles.'
    });
  } catch (error) {
    console.error('Error uploading CNIC front:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload CNIC front image'
    });
  }
});

// @route   POST /api/profile/upload-cnic-back
// @desc    Upload CNIC back image (RESTRICTED - only management can upload)
// @access  Private
router.post('/upload-cnic-back', protect, imageUpload.single('cnicBack'), async (req, res) => {
  try {
    // Block employees from uploading their own CNIC
    return res.status(403).json({
      success: false,
      message: 'You cannot upload your own CNIC. Only management can update employee profiles.'
    });
  } catch (error) {
    console.error('Error uploading CNIC back:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload CNIC back image'
    });
  }
});

// ========== MANAGEMENT ROUTES (CEO/Co-CEO/Company Manager Only) ==========

// @route   PUT /api/profile/manage/:userId
// @desc    Update employee profile by management
// @access  Private (CEO, Co-CEO, Company Manager)
router.put('/manage/:userId', protect, authorize('ceo', 'co_ceo', 'company_manager'), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      personalEmail,
      phoneNumber,
      cnicNumber,
      fatherName,
      dateOfBirth,
      gender,
      currentAddress,
      permanentAddress,
      employeeId,
      designation,
      joiningDate,
      employmentType
    } = req.body;

    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update all editable profile fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (personalEmail !== undefined) user.personalEmail = personalEmail;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (cnicNumber !== undefined) user.cnicNumber = cnicNumber;
    if (fatherName !== undefined) user.fatherName = fatherName;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth || null;
    if (gender !== undefined) user.gender = gender;
    if (currentAddress !== undefined) user.currentAddress = currentAddress;
    if (permanentAddress !== undefined) user.permanentAddress = permanentAddress;
    if (employeeId !== undefined) user.employeeId = employeeId;
    if (designation !== undefined) user.designation = designation;
    if (joiningDate !== undefined) user.joiningDate = joiningDate || null;
    if (employmentType !== undefined) user.employmentType = employmentType;

    await user.save();

    res.json({
      success: true,
      message: 'Employee profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Error updating employee profile:', error);
    
    // Handle duplicate employeeId error
    if (error.code === 11000 && error.keyPattern?.employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID already exists. Please use a unique Employee ID.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update employee profile'
    });
  }
});

// ================= MANAGEMENT-UPLOAD ROUTES =================

// Management uploads CV for a user
router.post('/manage/:userId/upload-cv', protect, authorize('ceo', 'co_ceo', 'company_manager'), cloudinaryUpload.single('cv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const file = req.file;
    const url = file.path || file.secure_url || file.url;
    const publicId = file.filename || file.public_id || '';
    const originalName = file.originalname || '';

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.cv = { url: url || '', publicId: publicId || '', originalName, uploadedAt: new Date() };
    await user.save();

    res.json({ success: true, message: 'CV uploaded for user', cv: user.cv });
  } catch (error) {
    console.error('Error uploading CV for user:', error);
    res.status(500).json({ success: false, message: 'Failed to upload CV' });
  }
});

// Management uploads multiple documents for a user
router.post('/manage/:userId/upload-documents', protect, authorize('ceo', 'co_ceo', 'company_manager'), cloudinaryUpload.array('documents', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: 'No files uploaded' });

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const added = [];
    for (const file of req.files) {
      const url = file.path || file.secure_url || file.url;
      const publicId = file.filename || file.public_id || '';
      const originalName = file.originalname || '';
      const doc = { url: url || '', publicId: publicId || '', originalName, uploadedAt: new Date() };
      user.documents.push(doc);
      added.push(doc);
    }

    await user.save();
    res.json({ success: true, message: 'Documents uploaded for user', added });
  } catch (error) {
    console.error('Error uploading documents for user:', error);
    res.status(500).json({ success: false, message: 'Failed to upload documents' });
  }
});

// Management fetches CV and documents for a user
router.get('/manage/:userId/documents', protect, authorize('ceo', 'co_ceo', 'company_manager'), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('cv documents');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, cv: user.cv, documents: user.documents });
  } catch (error) {
    console.error('Error fetching user documents:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/profile/document/:publicId
// @desc    Delete a document (or CV) by publicId for current user
// @access  Private
// Management deletes a document for a specific user
router.delete('/manage/:userId/document/:publicId', protect, authorize('ceo', 'co_ceo', 'company_manager'), async (req, res) => {
  try {
    const { publicId } = req.params;
    const { userId } = req.params;
    if (!publicId) return res.status(400).json({ success: false, message: 'publicId is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let removed = false;
    if (user.cv && user.cv.publicId === publicId) {
      user.cv = { url: '', publicId: '', originalName: '', uploadedAt: null };
      removed = true;
    }

    const beforeCount = user.documents.length;
    user.documents = user.documents.filter(d => d.publicId !== publicId);
    if (user.documents.length !== beforeCount) removed = true;

    if (!removed) return res.status(404).json({ success: false, message: 'Document not found for user' });

    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    } catch (err) {
      try { await cloudinary.uploader.destroy(publicId, { resource_type: 'image' }); } catch (e) { /* ignore */ }
    }

    await user.save();
    res.json({ success: true, message: 'Document removed for user' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Alternate delete route that accepts `publicId` as a query param to support publicIds with slashes
router.delete('/manage/:userId/document/delete', protect, authorize('ceo', 'co_ceo', 'company_manager'), async (req, res) => {
  try {
    const { userId } = req.params;
    const publicId = req.query.publicId;
    if (!publicId) return res.status(400).json({ success: false, message: 'publicId query parameter is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let removed = false;
    if (user.cv && user.cv.publicId === publicId) {
      user.cv = { url: '', publicId: '', originalName: '', uploadedAt: null };
      removed = true;
    }

    const beforeCount = user.documents.length;
    user.documents = user.documents.filter(d => d.publicId !== publicId);
    if (user.documents.length !== beforeCount) removed = true;

    if (!removed) return res.status(404).json({ success: false, message: 'Document not found for user' });

    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    } catch (err) {
      try { await cloudinary.uploader.destroy(publicId, { resource_type: 'image' }); } catch (e) { /* ignore */ }
    }

    await user.save();
    res.json({ success: true, message: 'Document removed for user' });
  } catch (error) {
    console.error('Error deleting document (query):', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Management: Download (or view inline) a user's document by publicId
router.get('/manage/:userId/document/:publicId/download', protect, authorize('ceo', 'co_ceo', 'company_manager'), async (req, res) => {
  try {
    const { userId, publicId } = req.params;
    const user = await User.findById(userId).select('cv documents');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // find document (cv or other)
    let found = null;
    if (user.cv && user.cv.publicId === publicId) found = user.cv;
    if (!found) found = user.documents.find(d => d.publicId === publicId);
    if (!found) return res.status(404).json({ success: false, message: 'Document not found' });

    const fileUrl = found.url;
    const originalName = found.originalName || `${publicId}`;

    // stream file from remote (Cloudinary) and set inline disposition so browser can open PDFs/images
    const response = await axios({ url: fileUrl, method: 'GET', responseType: 'stream' });

    const contentType = response.headers['content-type'] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    // Use inline so browser will attempt to open in new tab if it can (PDF/image)
    res.setHeader('Content-Disposition', `inline; filename="${originalName.replace(/\"/g, '')}"`);

    response.data.pipe(res);
  } catch (error) {
    console.error('Error proxying document download:', error);
    res.status(500).json({ success: false, message: 'Failed to download document' });
  }
});

// Alternate download route that accepts `publicId` as a query param to support publicIds with slashes
router.get('/manage/:userId/document/download', protect, authorize('ceo', 'co_ceo', 'company_manager'), async (req, res) => {
  try {
    const { userId } = req.params;
    const publicId = req.query.publicId;
    if (!publicId) return res.status(400).json({ success: false, message: 'publicId query parameter is required' });

    const user = await User.findById(userId).select('cv documents');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let found = null;
    if (user.cv && user.cv.publicId === publicId) found = user.cv;
    if (!found) found = user.documents.find(d => d.publicId === publicId);
    if (!found) return res.status(404).json({ success: false, message: 'Document not found' });

    const fileUrl = found.url;
    const originalName = found.originalName || `${publicId}`;

    const response = await axios({ url: fileUrl, method: 'GET', responseType: 'stream' });
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${originalName.replace(/\"/g, '')}"`);
    response.data.pipe(res);
  } catch (error) {
    console.error('Error proxying document download (query):', error);
    res.status(500).json({ success: false, message: 'Failed to download document' });
  }
});

// @route   POST /api/profile/manage/:userId/upload-picture
// @desc    Upload employee profile picture by management
// @access  Private (CEO, Co-CEO, Company Manager)
router.post('/manage/:userId/upload-picture', protect, authorize('ceo', 'co_ceo', 'company_manager'), imageUpload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'user-profiles');

    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.profilePicture = result.secure_url;
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      url: result.secure_url
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture'
    });
  }
});

// @route   POST /api/profile/manage/:userId/upload-cnic-front
// @desc    Upload employee CNIC front by management
// @access  Private (CEO, Co-CEO, Company Manager)
router.post('/manage/:userId/upload-cnic-front', protect, authorize('ceo', 'co_ceo', 'company_manager'), imageUpload.single('cnicFront'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'user-cnic');

    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.cnicFrontImage = result.secure_url;
    await user.save();

    res.json({
      success: true,
      message: 'CNIC front image uploaded successfully',
      url: result.secure_url
    });
  } catch (error) {
    console.error('Error uploading CNIC front:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload CNIC front image'
    });
  }
});

// @route   POST /api/profile/manage/:userId/upload-cnic-back
// @desc    Upload employee CNIC back by management
// @access  Private (CEO, Co-CEO, Company Manager)
router.post('/manage/:userId/upload-cnic-back', protect, authorize('ceo', 'co_ceo', 'company_manager'), imageUpload.single('cnicBack'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'user-cnic');

    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.cnicBackImage = result.secure_url;
    await user.save();

    res.json({
      success: true,
      message: 'CNIC back image uploaded successfully',
      url: result.secure_url
    });
  } catch (error) {
    console.error('Error uploading CNIC back:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload CNIC back image'
    });
  }
});

// @route   GET /api/profile/user/:userId
// @desc    Get individual user complete details (Admin only)
// @access  Private (Admin)
router.get('/user/:userId', protect, authorize('ceo', 'co_ceo', 'company_manager'), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Fetch user's EOD reports
    const eodReports = await EODReport.find({ user: req.params.userId })
      .sort({ date: -1 })
      .populate('reviewedBy', 'firstName lastName')
      .limit(50);

    // Fetch user's leave summary
    const approvedLeaves = await Leave.find({
      employee: req.params.userId,
      status: 'approved'
    });

    // Calculate leave statistics
    const leaveStats = {
      totalLeaves: 0,
      sick: 0,
      casual: 0,
      emergency: 0,
      informed: 0,
      uninformed: 0,
      other: 0
    };

    approvedLeaves.forEach(leave => {
      leaveStats.totalLeaves += leave.leaveCount;
      leaveStats[leave.leaveType] += leave.leaveCount;
    });

    // Get all leave requests (for history)
    const allLeaves = await Leave.find({ employee: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('reviewedBy', 'firstName lastName');

    res.json({
      success: true,
      data: {
        user,
        eodReports,
        leaveStats,
        leaveHistory: allLeaves,
        joiningDate: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
