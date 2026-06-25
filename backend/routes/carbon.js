const express = require('express');
const Carbon = require('../models/Carbon');
const auth = require('../middleware/auth');

const router = express.Router();

// Emission coefficients (kg CO2)
const EMISSION_COEFFICIENTS = {
  electricity: 0.47, // kg CO2 per kWh
  car: 0.18, // kg CO2 per KM
  publicTransport: 0.06, // kg CO2 per KM
  diet: {
    'heavy-meat': 5, // kg CO2 per day
    'balanced': 2.5, // kg CO2 per day
    'vegetarian': 1.2 // kg CO2 per day
  }
};

// Calculate carbon footprint
router.post('/calculate', auth, async (req, res) => {
  try {
    const { electricityKwh, carKm, publicTransportKm, dietType } = req.body;

    // Validate input
    if (!electricityKwh && electricityKwh !== 0) {
      return res.status(400).json({ success: false, message: 'Electricity usage is required' });
    }
    if (!carKm && carKm !== 0) {
      return res.status(400).json({ success: false, message: 'Car mileage is required' });
    }
    if (!publicTransportKm && publicTransportKm !== 0) {
      return res.status(400).json({ success: false, message: 'Public transport usage is required' });
    }
    if (!dietType || !['heavy-meat', 'balanced', 'vegetarian'].includes(dietType)) {
      return res.status(400).json({ success: false, message: 'Valid diet type is required' });
    }

    // Calculate emissions for each category
    const electricityEmission = electricityKwh * EMISSION_COEFFICIENTS.electricity;
    const carEmission = carKm * EMISSION_COEFFICIENTS.car;
    const publicTransportEmission = publicTransportKm * EMISSION_COEFFICIENTS.publicTransport;
    const dietEmission = EMISSION_COEFFICIENTS.diet[dietType] * 30; // Monthly (30 days)

    // Calculate total carbon footprint
    const totalCarbonFootprint = electricityEmission + carEmission + publicTransportEmission + dietEmission;

    // Create new carbon record
    const newCarbon = new Carbon({
      userId: req.user.userId,
      electricityKwh,
      carKm,
      publicTransportKm,
      dietType,
      totalCarbonFootprint,
      breakdown: {
        electricity: electricityEmission,
        car: carEmission,
        publicTransport: publicTransportEmission,
        diet: dietEmission
      }
    });

    await newCarbon.save();

    res.status(201).json({
      success: true,
      data: newCarbon
    });

  } catch (error) {
    console.error('Error in carbon calculation:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get user's carbon history
router.get('/history', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const carbonHistory = await Carbon.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: carbonHistory
    });

  } catch (error) {
    console.error('Error fetching carbon history:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get latest carbon footprint
router.get('/latest', auth, async (req, res) => {
  try {
    const latestCarbon = await Carbon.findOne({ userId: req.user.userId })
      .sort({ createdAt: -1 });

    if (!latestCarbon) {
      return res.status(404).json({ success: false, message: 'No carbon footprint data found' });
    }

    res.json({
      success: true,
      data: latestCarbon
    });

  } catch (error) {
    console.error('Error fetching latest carbon data:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get carbon statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await Carbon.aggregate([
      {
        $match: {
          userId: req.user.userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          avgTotalFootprint: { $avg: '$totalCarbonFootprint' },
          avgElectricity: { $avg: '$breakdown.electricity' },
          avgCar: { $avg: '$breakdown.car' },
          avgPublicTransport: { $avg: '$breakdown.publicTransport' },
          avgDiet: { $avg: '$breakdown.diet' },
          maxFootprint: { $max: '$totalCarbonFootprint' },
          minFootprint: { $min: '$totalCarbonFootprint' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(stats[0] || {
      avgTotalFootprint: 0,
      avgElectricity: 0,
      avgCar: 0,
      avgPublicTransport: 0,
      avgDiet: 0,
      maxFootprint: 0,
      minFootprint: 0,
      count: 0
    });

  } catch (error) {
    console.error('Error fetching carbon stats:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
