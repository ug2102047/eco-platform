const mongoose = require('mongoose');

const savedDisasterAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cityName: {
    type: String,
    required: true
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['Critical', 'Warning', 'Normal'],
    default: 'Normal'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index to prevent duplicate city saves for the same user
savedDisasterAlertSchema.index({ userId: 1, cityName: 1 }, { unique: true });

module.exports = mongoose.model('SavedDisasterAlert', savedDisasterAlertSchema);
