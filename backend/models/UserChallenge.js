const mongoose = require('mongoose');

const userChallengeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  challengeId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active',
    required: true
  },
  acceptedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Create compound index for efficient user-challenge queries
userChallengeSchema.index({ user: 1, challengeId: 1 }, { unique: true });

module.exports = mongoose.model('UserChallenge', userChallengeSchema);
