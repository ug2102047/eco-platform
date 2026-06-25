const mongoose = require('mongoose');

const waterQualitySchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    index: true
  },
  country: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  measurements: {
    waterTemperature: {
      type: Number,
      default: null
    },
    salinity: {
      type: Number,
      default: null
    },
    waveHeight: {
      type: Number,
      default: null
    },
    waveDirection: {
      type: Number,
      default: null
    },
    wavePeriod: {
      type: Number,
      default: null
    },
    ph: {
      type: Number,
      default: null
    },
    turbidity: {
      type: Number,
      default: null
    },
    dissolvedOxygen: {
      type: Number,
      default: null
    }
  },
  waterQualityLevel: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    default: null
  },
  waterScarcityLevel: {
    type: String,
    enum: ['Safe', 'Moderate Risk', 'Critical'],
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  source: {
    type: String,
    default: 'Open-Meteo Marine'
  }
});

// Create compound index for efficient time-series queries
waterQualitySchema.index({ city: 1, timestamp: -1 });

module.exports = mongoose.model('WaterQuality', waterQualitySchema);
