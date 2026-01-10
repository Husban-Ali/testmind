const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'on_leave', 'half_day', 'late'],
    default: 'absent'
  },
  leaveType: {
    type: String,
    enum: ['', 'paid', 'unpaid', 'sick', 'casual', 'emergency'],
    default: ''
  },
  checkInTime: {
    type: Date,
    default: null
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  workingHours: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  // Link to approved leave if on leave
  leave: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Leave',
    default: null
  },
  // Marked by system or manually
  markedBy: {
    type: String,
    enum: ['system', 'manual', 'auto'],
    default: 'auto'
  }
}, {
  timestamps: true
});

// Compound index to ensure one attendance record per user per day
AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

// Method to calculate working hours
AttendanceSchema.methods.calculateWorkingHours = function() {
  if (this.checkInTime && this.checkOutTime) {
    const diff = this.checkOutTime - this.checkInTime;
    this.workingHours = Math.round(diff / (1000 * 60 * 60) * 100) / 100; // Hours with 2 decimal places
  }
  return this.workingHours;
};

module.exports = mongoose.model('Attendance', AttendanceSchema);
