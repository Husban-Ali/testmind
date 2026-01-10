const mongoose = require('mongoose');

const userLocationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  locationEnabled: {
    type: Boolean,
    default: false
  },
  permissionStatus: {
    type: String,
    enum: ['granted', 'denied', 'blocked', 'prompt'],
    default: 'prompt'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
userLocationSchema.index({ userId: 1 });
userLocationSchema.index({ isOnline: 1 });
userLocationSchema.index({ lastUpdated: 1 });

module.exports = mongoose.model('UserLocation', userLocationSchema);
