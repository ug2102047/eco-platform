const express = require('express');
const SavedDisasterAlert = require('../models/SavedDisasterAlert');
const auth = require('../middleware/auth');

const router = express.Router();

// ==========================================================
// SAVE DISASTER ALERT LOCATION
// ==========================================================
router.post('/save', auth, async (req, res) => {
  try {
    const { cityName, coordinates, status } = req.body;
    const userId = req.user._id;

    if (!cityName || !coordinates || !coordinates.latitude || !coordinates.longitude) {
      return res.status(400).json({ success: false, message: 'City name and coordinates are required' });
    }

    // Check if the city is already saved for this user
    const existingAlert = await SavedDisasterAlert.findOne({ userId, cityName });
    if (existingAlert) {
      return res.status(400).json({ success: false, message: 'City is already saved for this user' });
    }

    const newAlert = new SavedDisasterAlert({
      userId,
      cityName,
      coordinates,
      status: status || 'Normal'
    });

    await newAlert.save();

    res.status(201).json({ 
      success: true, 
      message: 'Alert location saved successfully',
      data: newAlert
    });
  } catch (error) {
    console.error('Error saving disaster alert:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'City is already saved for this user' });
    }
    res.status(500).json({ success: false, message: 'Failed to save alert location' });
  }
});

// ==========================================================
// GET ALL SAVED DISASTER ALERTS FOR USER
// ==========================================================
router.get('/saved', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const savedAlerts = await SavedDisasterAlert.find({ userId })
      .sort({ timestamp: -1 });

    res.json({ 
      success: true, 
      data: savedAlerts
    });
  } catch (error) {
    console.error('Error fetching saved disaster alerts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch saved alerts' });
  }
});

// ==========================================================
// DELETE SAVED DISASTER ALERT
// ==========================================================
router.delete('/saved/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const deletedAlert = await SavedDisasterAlert.findOneAndDelete({ _id: id, userId });

    if (!deletedAlert) {
      return res.status(404).json({ success: false, message: 'Alert not found or unauthorized' });
    }

    res.json({ 
      success: true, 
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting disaster alert:', error);
    res.status(500).json({ success: false, message: 'Failed to delete alert' });
  }
});

module.exports = router;
