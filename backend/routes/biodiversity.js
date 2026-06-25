const express = require('express');
const router = express.Router();
const BiodiversityStat = require('../models/BiodiversityStat');

// GET /api/biodiversity - Get all biodiversity statistics
router.get('/', async (req, res) => {
  try {
    const biodiversityStats = await BiodiversityStat.find().sort({ country: 1 });
    res.status(200).json({
      success: true,
      data: biodiversityStats
    });
  } catch (error) {
    console.error('Error fetching biodiversity statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch biodiversity statistics',
      error: error.message
    });
  }
});

// GET /api/biodiversity/country/:country - Get biodiversity statistics for a specific country
router.get('/country/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const biodiversityStats = await BiodiversityStat.find({ country }).sort({ year: -1 });
    
    if (biodiversityStats.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No biodiversity statistics found for this country'
      });
    }

    res.status(200).json({
      success: true,
      data: biodiversityStats
    });
  } catch (error) {
    console.error('Error fetching biodiversity statistics by country:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch biodiversity statistics',
      error: error.message
    });
  }
});

// GET /api/biodiversity/latest - Get latest biodiversity statistics
router.get('/latest', async (req, res) => {
  try {
    const latestStats = await BiodiversityStat.find().sort({ year: -1, timestamp: -1 });
    res.status(200).json({
      success: true,
      data: latestStats
    });
  } catch (error) {
    console.error('Error fetching latest biodiversity statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest biodiversity statistics',
      error: error.message
    });
  }
});

module.exports = router;
