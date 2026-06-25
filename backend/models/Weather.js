const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
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
  currentMetrics: {
    temperature: {
      type: Number,
      default: null
    },
    humidity: {
      type: Number,
      default: null
    },
    windSpeed: {
      type: Number,
      default: null
    },
    precipitation: {
      type: Number,
      default: null
    },
    uvIndex: {
      type: Number,
      default: null
    },
    conditionText: {
      type: String,
      default: null
    },
    windDirection: {
      type: String,
      default: null
    }
  },
  dailyTrends: [{
    date: {
      type: String,
      required: true
    },
    maxTemp: {
      type: Number,
      required: true
    },
    minTemp: {
      type: Number,
      required: true
    },
    totalRain: {
      type: Number,
      default: 0
    },
    condition: {
      type: String,
      default: null
    }
  }],
  airQuality: {
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
    },
    usEpaIndex: {
      type: Number,
      default: null
    },
    gbDefraIndex: {
      type: Number,
      default: null
    }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  source: {
    type: String,
    default: 'WeatherAPI'
  }
});

// Create compound index for efficient time-series queries
weatherSchema.index({ city: 1, timestamp: -1 });
// Create geospatial index for location-based queries
weatherSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Weather', weatherSchema);
