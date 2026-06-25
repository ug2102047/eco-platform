const mongoose = require('mongoose');

const carbonSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  electricityKwh: {
    type: Number,
    required: true,
    default: 0
  },
  carKm: {
    type: Number,
    required: true,
    default: 0
  },
  publicTransportKm: {
    type: Number,
    required: true,
    default: 0
  },
  dietType: {
    type: String,
    enum: ['heavy-meat', 'balanced', 'vegetarian'],
    required: true
  },
  totalCarbonFootprint: {
    type: Number,
    required: true
  },
  breakdown: {
    electricity: {
      type: Number,
      required: true
    },
    car: {
      type: Number,
      required: true
    },
    publicTransport: {
      type: Number,
      required: true
    },
    diet: {
      type: Number,
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Create compound index for efficient user-based queries
carbonSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Carbon', carbonSchema);
