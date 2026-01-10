const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  plainPassword: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['ceo', 'co_ceo', 'company_manager', 'sales_head', 'sales_employee', 'production_head', 'production_employee', 'manager', 'employee'],
    default: 'employee'
  },
  department: {
    type: String,
    enum: ['general', 'sales', 'production'],
    default: 'general'
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  // Profile Management Fields (Optional - Non-Breaking)
  phoneNumber: {
    type: String,
    default: ''
  },
  personalEmail: {
    type: String,
    default: ''
  },
  cnicNumber: {
    type: String,
    default: ''
  },
  cnicFrontImage: {
    type: String,
    default: ''
  },
  cnicBackImage: {
    type: String,
    default: ''
  },
  profilePicture: {
    type: String,
    default: ''
  },
  cv: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    originalName: { type: String, default: '' },
    uploadedAt: { type: Date, default: null }
  },
  documents: [
    {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      originalName: { type: String, default: '' },
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  // Additional Employee Profile Fields (Managed by CEO/Co-CEO/Company Manager)
  fatherName: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ['', 'male', 'female', 'other'],
    default: ''
  },
  currentAddress: {
    type: String,
    default: ''
  },
  permanentAddress: {
    type: String,
    default: ''
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true, // Allows null/undefined values to not violate uniqueness
    default: undefined // Changed from '' to undefined for sparse index compatibility
  },
  designation: {
    type: String,
    default: ''
  },
  joiningDate: {
    type: Date,
    default: null
  },
  employmentType: {
    type: String,
    enum: ['', 'full-time', 'part-time', 'contract', 'internship'],
    default: ''
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  assignedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  channels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  projectValues: [{
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    value: {
      type: Number,
      default: 0
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  pushSubscriptions: [{
    endpoint: String,
    keys: {
      p256dh: String,
      auth: String
    },
    userAgent: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  // Store plain password before hashing (for CEO access only)
  this.plainPassword = this.password;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
UserSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', UserSchema);
