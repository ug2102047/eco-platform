const mongoose = require('mongoose');

const airQualitySchema = new mongoose.Schema({
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
    pm25: {
      type: Number,
      default: null
    },
    pm10: {
      type: Number,
      default: null
    },
    co: {
      type: Number,
      default: null
    },
    no2: {
      type: Number,
      default: null
    },
    o3: {
      type: Number,
      default: null
    },
    so2: {
      type: Number,
      default: null
    }
  },
  aqi: {
    type: Number,
    default: null
  },
  aqiLevel: {
    type: String,
    enum: ['Good', 'Moderate', 'Unhealthy for Sensitive Groups', 'Unhealthy', 'Very Unhealthy', 'Hazardous'],
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  source: {
    type: String,
    default: 'OpenAQ'
  }
});

// Create compound index for efficient time-series queries
airQualitySchema.index({ city: 1, timestamp: -1 });

module.exports = mongoose.model('AirQuality', airQualitySchema);
