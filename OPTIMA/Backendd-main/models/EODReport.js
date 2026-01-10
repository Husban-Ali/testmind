const mongoose = require('mongoose');

const EODReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  tasksCompleted: [{
    type: String
  }],
  tasksInProgress: [{
    type: String
  }],
  blockers: [{
    type: String
  }],
  hoursWorked: {
    type: Number,
    default: 0
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  message: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  status: {
    type: String,
    enum: ['submitted', 'reviewed', 'approved'],
    default: 'submitted'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date
}, {
  timestamps: true
});

// Index for faster queries
EODReportSchema.index({ user: 1, date: -1 });
EODReportSchema.index({ date: -1 });

module.exports = mongoose.model('EODReport', EODReportSchema);
