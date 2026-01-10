const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  leaveType: {
    type: String,
    enum: ['sick', 'casual', 'emergency', 'informed', 'uninformed', 'other'],
    required: true
  },
  leaveCount: {
    type: Number,
    required: true,
    min: 1
  },
  leaveDates: {
    type: [Date],
    default: []
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  leavePaymentStatus: {
    type: String,
    enum: ['paid', 'unpaid', 'pending'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for faster queries
LeaveSchema.index({ employee: 1, status: 1 });
LeaveSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Leave', LeaveSchema);
