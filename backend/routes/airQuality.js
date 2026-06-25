const express = require('express');
const AirQuality = require('../models/AirQuality');
const auth = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// ==========================================================
// 🚀 REAL-TIME AIR QUALITY SEARCH (WeatherAPI with aqi=yes)
// ==========================================================
router.post('/search', auth, async (req, res) => {
  try {
    const { city } = req.body;
    if (!city) return res.status(400).json({ success: false, message: 'City name required' });

    const formattedCity = city.trim();
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'WeatherAPI key is missing in .env file' });
    }

    // WeatherAPI Current Weather URL with aqi=yes for air quality data
    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(formattedCity)}&aqi=yes`;

    const response = await axios.get(apiUrl);
    const weatherData = response.data;

    // Extract location data
    const cityNameDisplay = weatherData.location.name;
    const countryName = weatherData.location.country;
    const lat = weatherData.location.lat;
    const lon = weatherData.location.lon;

    // Extract air quality data
    let airQualityData = null;
    let aqi = null;
    let aqiLevel = null;

    if (weatherData.current && weatherData.current.air_quality) {
      const aq = weatherData.current.air_quality;
      airQualityData = {
        pm25: aq.pm2_5 || null,
        pm10: aq.pm10 || null,
        co: aq.co || null,
        no2: aq.no2 || null,
        o3: aq.o3 || null,
        so2: aq.so2 || null
      };

      // Translate US-EPA Index (1-6) to standard AQI (0-500)
      const usEpaIndex = aq['us-epa-index'] || null;
      if (usEpaIndex !== null) {
        // Map US-EPA Index to standard AQI scale
        const aqiMapping = {
          1: { aqi: 30, level: 'Good' },
          2: { aqi: 60, level: 'Moderate' },
          3: { aqi: 120, level: 'Unhealthy for Sensitive Groups' },
          4: { aqi: 170, level: 'Unhealthy' },
          5: { aqi: 250, level: 'Very Unhealthy' },
          6: { aqi: 350, level: 'Hazardous' }
        };
        const mapped = aqiMapping[usEpaIndex] || { aqi: 50, level: 'Moderate' };
        aqi = mapped.aqi;
        aqiLevel = mapped.level;
      }
    }

    // Save to MongoDB
    const newAirQualityData = new AirQuality({
      city: cityNameDisplay,
      country: countryName,
      location: {
        type: 'Point',
        coordinates: [lon, lat]
      },
      measurements: airQualityData,
      aqi,
      aqiLevel,
      source: 'WeatherAPI'
    });

    await newAirQualityData.save();

    res.status(201).json({
      success: true,
      data: newAirQualityData,
      extra: {
        usEpaIndex: weatherData.current?.air_quality?.['us-epa-index'] || null,
        gbDefraIndex: weatherData.current?.air_quality?.['gb-defra-index'] || null
      }
    });

  } catch (error) {
    console.error('Error in Air Quality search:', error.message);
    const statusCode = error.response ? error.response.status : 500;
    let errMsg = 'Failed to fetch air quality data';

    if (statusCode === 400 || statusCode === 404) {
      errMsg = 'City not found! Please check the spelling.';
    } else if (statusCode === 401 || statusCode === 403) {
      errMsg = 'Invalid API Key. Please check your .env file.';
    }

    res.status(statusCode).json({ success: false, message: errMsg });
  }
});

// Get all air quality data for a city
router.get('/city/:city', auth, async (req, res) => {
  try {
    const { city } = req.params;
    const { limit = 100 } = req.query;

    const data = await AirQuality.find({ city: new RegExp(city, 'i') })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get latest air quality data for all cities
router.get('/latest', auth, async (req, res) => {
  try {
    const data = await AirQuality.aggregate([
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: '$city',
          latestData: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$latestData' }
      }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get air quality trends for a city (time-series)
router.get('/trends/:city', auth, async (req, res) => {
  try {
    const { city } = req.params;
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const data = await AirQuality.find({
      city: new RegExp(city, 'i'),
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get air quality statistics for a city
router.get('/stats/:city', auth, async (req, res) => {
  try {
    const { city } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await AirQuality.aggregate([
      {
        $match: {
          city: new RegExp(city, 'i'),
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          avgPM25: { $avg: '$measurements.pm25' },
          avgPM10: { $avg: '$measurements.pm10' },
          avgCO: { $avg: '$measurements.co' },
          avgNO2: { $avg: '$measurements.no2' },
          avgO3: { $avg: '$measurements.o3' },
          maxAQI: { $max: '$aqi' },
          minAQI: { $min: '$aqi' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(stats[0] || {});
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all available cities
router.get('/cities', auth, async (req, res) => {
  try {
    const cities = await AirQuality.distinct('city');
    res.json(cities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Save air quality data from search
router.post('/save', auth, async (req, res) => {
  try {
    const {
      city,
      country,
      latitude,
      longitude,
      aqi,
      aqiLevel,
      measurements
    } = req.body;

    // Create new air quality record
    const newAirQuality = new AirQuality({
      city,
      country,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      measurements: {
        pm25: measurements.pm25,
        pm10: measurements.pm10,
        co: measurements.co,
        no2: measurements.no2,
        o3: measurements.o3,
        so2: measurements.so2
      },
      aqi,
      aqiLevel,
      source: 'Open-Meteo'
    });

    const savedData = await newAirQuality.save();
    res.status(201).json(savedData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
