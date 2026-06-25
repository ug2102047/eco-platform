const express = require('express');
const router = express.Router();
const WasteStat = require('../models/WasteStat');
const BiodiversityStat = require('../models/BiodiversityStat');

// Mock data for Waste Management (realistic 2024-2025 estimates)
const wasteMockData = [
  {
    country: 'Bangladesh',
    plasticWaste: 876000, // tons/year
    eWaste: 45000, // tons/year
    recyclingRate: 12, // percentage
    organicWaste: 3200000,
    landfillCapacity: 35,
    wastePerCapita: 0.49, // kg/day
    year: 2024
  },
  {
    country: 'India',
    plasticWaste: 9460000,
    eWaste: 3200000,
    recyclingRate: 28,
    organicWaste: 45000000,
    landfillCapacity: 45,
    wastePerCapita: 0.45,
    year: 2024
  },
  {
    country: 'USA',
    plasticWaste: 42000000,
    eWaste: 6900000,
    recyclingRate: 35,
    organicWaste: 35000000,
    landfillCapacity: 52,
    wastePerCapita: 2.01,
    year: 2024
  },
  {
    country: 'UAE',
    plasticWaste: 980000,
    eWaste: 125000,
    recyclingRate: 42,
    organicWaste: 1800000,
    landfillCapacity: 48,
    wastePerCapita: 1.34,
    year: 2024
  },
  {
    country: 'Germany',
    plasticWaste: 5300000,
    eWaste: 1600000,
    recyclingRate: 67,
    organicWaste: 12000000,
    landfillCapacity: 68,
    wastePerCapita: 0.63,
    year: 2024
  },
  {
    country: 'United Kingdom',
    plasticWaste: 4900000,
    eWaste: 1400000,
    recyclingRate: 45,
    organicWaste: 14000000,
    landfillCapacity: 55,
    wastePerCapita: 0.74,
    year: 2024
  },
  {
    country: 'Japan',
    plasticWaste: 9100000,
    eWaste: 2100000,
    recyclingRate: 58,
    organicWaste: 18000000,
    landfillCapacity: 62,
    wastePerCapita: 0.72,
    year: 2024
  },
  {
    country: 'Brazil',
    plasticWaste: 11000000,
    eWaste: 2100000,
    recyclingRate: 18,
    organicWaste: 52000000,
    landfillCapacity: 38,
    wastePerCapita: 0.52,
    year: 2024
  },
  {
    country: 'Australia',
    plasticWaste: 1200000,
    eWaste: 580000,
    recyclingRate: 52,
    organicWaste: 7200000,
    landfillCapacity: 58,
    wastePerCapita: 1.85,
    year: 2024
  },
  {
    country: 'Canada',
    plasticWaste: 3100000,
    eWaste: 720000,
    recyclingRate: 49,
    organicWaste: 13000000,
    landfillCapacity: 61,
    wastePerCapita: 0.88,
    year: 2024
  }
];

// Mock data for Biodiversity (realistic 2024-2025 estimates)
const biodiversityMockData = [
  {
    country: 'Bangladesh',
    endangeredSpeciesCount: 186,
    deforestationRate: 2.8, // annual percentage change
    protectedAreaCoverage: 4.6, // percentage
    totalSpeciesCount: 6900,
    habitatLossIndex: 72,
    biodiversityIndex: 0.42,
    invasiveSpeciesCount: 45,
    year: 2024
  },
  {
    country: 'India',
    endangeredSpeciesCount: 447,
    deforestationRate: 1.9,
    protectedAreaCoverage: 5.3,
    totalSpeciesCount: 91000,
    habitatLossIndex: 58,
    biodiversityIndex: 0.68,
    invasiveSpeciesCount: 180,
    year: 2024
  },
  {
    country: 'USA',
    endangeredSpeciesCount: 1289,
    deforestationRate: 0.3,
    protectedAreaCoverage: 13.8,
    totalSpeciesCount: 91000,
    habitatLossIndex: 25,
    biodiversityIndex: 0.71,
    invasiveSpeciesCount: 520,
    year: 2024
  },
  {
    country: 'UAE',
    endangeredSpeciesCount: 48,
    deforestationRate: 0.8,
    protectedAreaCoverage: 15.2,
    totalSpeciesCount: 1200,
    habitatLossIndex: 65,
    biodiversityIndex: 0.28,
    invasiveSpeciesCount: 35,
    year: 2024
  },
  {
    country: 'Germany',
    endangeredSpeciesCount: 89,
    deforestationRate: 0.1,
    protectedAreaCoverage: 37.2,
    totalSpeciesCount: 48000,
    habitatLossIndex: 18,
    biodiversityIndex: 0.62,
    invasiveSpeciesCount: 95,
    year: 2024
  },
  {
    country: 'United Kingdom',
    endangeredSpeciesCount: 165,
    deforestationRate: 0.2,
    protectedAreaCoverage: 28.4,
    totalSpeciesCount: 32000,
    habitatLossIndex: 22,
    biodiversityIndex: 0.58,
    invasiveSpeciesCount: 210,
    year: 2024
  },
  {
    country: 'Japan',
    endangeredSpeciesCount: 356,
    deforestationRate: 0.1,
    protectedAreaCoverage: 19.8,
    totalSpeciesCount: 36000,
    habitatLossIndex: 28,
    biodiversityIndex: 0.65,
    invasiveSpeciesCount: 85,
    year: 2024
  },
  {
    country: 'Brazil',
    endangeredSpeciesCount: 1245,
    deforestationRate: 4.2,
    protectedAreaCoverage: 29.6,
    totalSpeciesCount: 180000,
    habitatLossIndex: 85,
    biodiversityIndex: 0.85,
    invasiveSpeciesCount: 320,
    year: 2024
  },
  {
    country: 'Australia',
    endangeredSpeciesCount: 545,
    deforestationRate: 0.7,
    protectedAreaCoverage: 22.5,
    totalSpeciesCount: 68000,
    habitatLossIndex: 35,
    biodiversityIndex: 0.78,
    invasiveSpeciesCount: 280,
    year: 2024
  },
  {
    country: 'Canada',
    endangeredSpeciesCount: 538,
    deforestationRate: 0.2,
    protectedAreaCoverage: 11.8,
    totalSpeciesCount: 80000,
    habitatLossIndex: 15,
    biodiversityIndex: 0.72,
    invasiveSpeciesCount: 195,
    year: 2024
  }
];

// POST /api/seed/sustainability - Seed sustainability data
router.post('/sustainability', async (req, res) => {
  try {
    const { force = false } = req.body;

    // Check if data already exists
    const existingWasteData = await WasteStat.countDocuments();
    const existingBiodiversityData = await BiodiversityStat.countDocuments();

    if (!force && existingWasteData > 0 && existingBiodiversityData > 0) {
      return res.status(200).json({
        success: true,
        message: 'Sustainability data already exists. Use force=true to reseed.',
        wasteStats: existingWasteData,
        biodiversityStats: existingBiodiversityData
      });
    }

    // Clear existing data if force is true
    if (force) {
      await WasteStat.deleteMany({});
      await BiodiversityStat.deleteMany({});
      console.log('Cleared existing sustainability data');
    }

    // Insert Waste Management data
    const wasteResults = await WasteStat.insertMany(wasteMockData);
    console.log(`Inserted ${wasteResults.length} waste statistics`);

    // Insert Biodiversity data
    const biodiversityResults = await BiodiversityStat.insertMany(biodiversityMockData);
    console.log(`Inserted ${biodiversityResults.length} biodiversity statistics`);

    res.status(201).json({
      success: true,
      message: 'Sustainability data seeded successfully',
      data: {
        wasteStats: wasteResults.length,
        biodiversityStats: biodiversityResults.length,
        countries: wasteMockData.length
      }
    });
  } catch (error) {
    console.error('Error seeding sustainability data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed sustainability data',
      error: error.message
    });
  }
});

// GET /api/seed/sustainability/status - Check seeding status
router.get('/sustainability/status', async (req, res) => {
  try {
    const wasteCount = await WasteStat.countDocuments();
    const biodiversityCount = await BiodiversityStat.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        wasteStats: wasteCount,
        biodiversityStats: biodiversityCount,
        isSeeded: wasteCount > 0 && biodiversityCount > 0
      }
    });
  } catch (error) {
    console.error('Error checking seeding status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check seeding status',
      error: error.message
    });
  }
});

module.exports = router;
