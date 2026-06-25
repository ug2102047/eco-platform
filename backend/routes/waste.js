const express = require('express');
const router = express.Router();
const WasteStat = require('../models/WasteStat');

// GET /api/waste - Get all waste statistics
router.get('/', async (req, res) => {
  try {
    const wasteStats = await WasteStat.find().sort({ country: 1 });
    res.status(200).json({
      success: true,
      data: wasteStats
    });
  } catch (error) {
    console.error('Error fetching waste statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch waste statistics',
      error: error.message
    });
  }
});

// GET /api/waste/country/:country - Get waste statistics for a specific country
router.get('/country/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const wasteStats = await WasteStat.find({ country }).sort({ year: -1 });
    
    if (wasteStats.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No waste statistics found for this country'
      });
    }

    res.status(200).json({
      success: true,
      data: wasteStats
    });
  } catch (error) {
    console.error('Error fetching waste statistics by country:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch waste statistics',
      error: error.message
    });
  }
});

// GET /api/waste/latest - Get latest waste statistics
router.get('/latest', async (req, res) => {
  try {
    const latestStats = await WasteStat.find().sort({ year: -1, timestamp: -1 });
    res.status(200).json({
      success: true,
      data: latestStats
    });
  } catch (error) {
    console.error('Error fetching latest waste statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest waste statistics',
      error: error.message
    });
  }
});

module.exports = router;
