const mongoose = require('mongoose');

const naturalDisasterSchema = new mongoose.Schema({
  disasterType: {
    type: String,
    required: true,
    enum: ['earthquake', 'flood', 'cyclone', 'wildfire', 'tornado', 'tsunami', 'volcanic eruption', 'landslide', 'drought', 'storm', 'other'],
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    city: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  },
  severity: {
    type: String,
    enum: ['low', 'moderate', 'high', 'severe', 'critical'],
    default: 'moderate'
  },
  magnitude: {
    type: Number,
    default: null
  },
  affectedArea: {
    type: String,
    default: ''
  },
  casualties: {
    deaths: {
      type: Number,
      default: 0
    },
    injured: {
      type: Number,
      default: 0
    },
    missing: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['Active', 'Monitoring', 'Resolved', 'Unknown'],
    default: 'Unknown'
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    default: null
  },
  source: {
    type: String,
    default: 'Manual Entry'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Create compound index for efficient queries
naturalDisasterSchema.index({ disasterType: 1, startDate: -1 });
naturalDisasterSchema.index({ 'location.city': 1, startDate: -1 });
naturalDisasterSchema.index({ status: 1, startDate: -1 });

module.exports = mongoose.model('NaturalDisaster', naturalDisasterSchema);
