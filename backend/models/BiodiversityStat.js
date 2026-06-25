const mongoose = require('mongoose');

const biodiversityStatSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
    index: true
  },
  endangeredSpeciesCount: {
    type: Number,
    required: true,
    description: 'Number of endangered species in the country'
  },
  deforestationRate: {
    type: Number,
    required: true,
    description: 'Annual deforestation rate as percentage change'
  },
  protectedAreaCoverage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    description: 'Percentage of land designated as protected areas'
  },
  totalSpeciesCount: {
    type: Number,
    default: 0,
    description: 'Total recorded species in the country'
  },
  habitatLossIndex: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
    description: 'Habitat loss index (0 = no loss, 100 = severe loss)'
  },
  biodiversityIndex: {
    type: Number,
    default: 0,
    min: 0,
    max: 1,
    description: 'Biodiversity index (0 = low diversity, 1 = high diversity)'
  },
  invasiveSpeciesCount: {
    type: Number,
    default: 0,
    description: 'Number of invasive species recorded'
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
biodiversityStatSchema.index({ country: 1, year: -1 });

module.exports = mongoose.model('BiodiversityStat', biodiversityStatSchema);
