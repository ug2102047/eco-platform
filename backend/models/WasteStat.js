const mongoose = require('mongoose');

const wasteStatSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
    index: true
  },
  plasticWaste: {
    type: Number,
    required: true,
    description: 'Plastic waste generated in tons per year'
  },
  eWaste: {
    type: Number,
    required: true,
    description: 'Electronic waste generated in tons per year'
  },
  recyclingRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    description: 'Overall recycling rate as percentage'
  },
  organicWaste: {
    type: Number,
    default: 0,
    description: 'Organic/biodegradable waste in tons per year'
  },
  landfillCapacity: {
    type: Number,
    default: 0,
    description: 'Available landfill capacity in percentage'
  },
  wastePerCapita: {
    type: Number,
    default: 0,
    description: 'Waste generated per person in kg per day'
  },
  year: {
    type: Number,
    required: true,
    default: 2024
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  source: {
    type: String,
    default: 'Mock Data'
  }
});

// Create compound index for efficient queries
wasteStatSchema.index({ country: 1, year: -1 });

module.exports = mongoose.model('WasteStat', wasteStatSchema);
