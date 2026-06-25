const express = require('express');
const Weather = require('../models/Weather');
const auth = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// ==========================================================
// � HISTORICAL WEATHER DATA (CLIMATE STRIPES)
// ==========================================================
router.post('/historical', async (req, res) => {
  try {
    const { city } = req.body;
    if (!city) return res.status(400).json({ success: false, message: 'City name required' });

    const formattedCity = city.trim();

    // প্রথমে শহরের ল্যাটিচিউড এবং লংচিচিউড পাওয়া
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(formattedCity)}&count=1&language=en&format=json`;
    const geoResponse = await axios.get(geocodingUrl);
    
    if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    const location = geoResponse.data.results[0];
    const lat = location.latitude;
    const lon = location.longitude;
    const countryName = location.country || 'Unknown';

    // Open-Meteo Historical API থেকে ৩০ বছরের তাপমাত্রা ডেটা আনা
    const historicalUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=1996-01-01&end_date=2025-12-31&daily=temperature_2m_max&timezone=auto`;
    const historicalResponse = await axios.get(historicalUrl);
    const historicalData = historicalResponse.data;

    if (!historicalData.daily || !historicalData.daily.time || !historicalData.daily.temperature_2m_max) {
      return res.status(500).json({ success: false, message: 'Failed to fetch historical data' });
    }

    // বার্ষিক গড় তাপমাত্রা গণনা করা
    const yearlyData = {};
    historicalData.daily.time.forEach((date, index) => {
      const year = date.substring(0, 4);
      const temp = historicalData.daily.temperature_2m_max[index];
      
      if (!yearlyData[year]) {
        yearlyData[year] = { sum: 0, count: 0 };
      }
      yearlyData[year].sum += temp;
      yearlyData[year].count += 1;
    });

    // বার্ষিক গড় তাপমাত্রা অ্যারে
    const annualAverages = Object.keys(yearlyData).sort().map(year => ({
      year: parseInt(year),
      avgTemp: parseFloat((yearlyData[year].sum / yearlyData[year].count).toFixed(2))
    }));

    // Calculate basic statistics from historical data
    const avgTemperature = annualAverages.reduce((sum, item) => sum + item.avgTemp, 0) / annualAverages.length;
    const firstYear = annualAverages[0].year;
    const lastYear = annualAverages[annualAverages.length - 1].year;
    const firstTemp = annualAverages[0].avgTemp;
    const lastTemp = annualAverages[annualAverages.length - 1].avgTemp;
    const yearlyChange = ((lastTemp - firstTemp) / (lastYear - firstYear)) * 10; // per decade
    const trendDirection = yearlyChange > 0 ? 'Rising' : 'Falling';

    res.status(200).json({
      success: true,
      data: {
        city: formattedCity.charAt(0).toUpperCase() + formattedCity.slice(1),
        country: countryName,
        location: {
          type: 'Point',
          coordinates: [lon, lat]
        },
        historicalData: annualAverages,
        statistics: {
          averageTemperature: avgTemperature,
          trendDirection: trendDirection,
          yearlyChange: yearlyChange,
          prediction2050: 0,
          warmingBy2050: 0
        }
      }
    });

  } catch (error) {
    console.error('Error in historical weather search:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch historical weather data' });
  }
});

// ==========================================================
// �🚀 ADVANCED REAL-TIME WEATHER SEARCH (7-DAY REAL FORECAST)
// ==========================================================
router.post('/search', auth, async (req, res) => {
  try {
    const { city } = req.body;
    if (!city) return res.status(400).json({ success: false, message: 'City name required' });

    const formattedCity = city.trim();
    // .env ফাইল থেকে WeatherAPI Key রিড করা হচ্ছে
    const apiKey = process.env.WEATHER_API_KEY; 

    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'WeatherAPI key is missing in .env file' });
    }

    // WeatherAPI Forecast URL - ৭ দিনের আসল ডেটা এবং এক্সট্রা ফিচারসহ
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(formattedCity)}&days=7&aqi=yes&alerts=no`;
    
    const response = await axios.get(apiUrl);
    const weatherData = response.data;

    // এপিআই থেকে আসল ডেটা এক্সট্রাক্ট
    const cityNameDisplay = weatherData.location.name;
    const countryName = weatherData.location.country;
    const lat = weatherData.location.lat;
    const lon = weatherData.location.lon;

    // কারেন্ট মেট্রিকস ও নতুন অ্যাডভান্সড ফিচারসমূহ
    const temperature = weatherData.current.temp_c; 
    const humidity = weatherData.current.humidity;
    const windSpeed = weatherData.current.wind_kph;
    const precipitation = weatherData.current.precip_mm;
    const uvIndex = Math.round(weatherData.current.uv);
    
    // 🌟 নতুন বোনাস ফিচার (ফ্রন্টএন্ডে পরে কাজে লাগাতে পারবেন)
    const conditionText = weatherData.current.condition.text; // যেমন: "Partly cloudy"
    const conditionIcon = weatherData.current.condition.icon; // আবহাওয়ার লাইভ আইকন URL
    const windDirection = weatherData.current.wind_dir;       // বাতাসের দিক (যেমন: NNW, SE)

    // 🌬️ এয়ার কোয়ালিটি ডেটা এক্সট্রাক্ট করা হচ্ছে (WeatherAPI থেকে aqi=yes প্যারামিটারের মাধ্যমে)
    let airQualityData = null;
    if (weatherData.current && weatherData.current.air_quality) {
      const aq = weatherData.current.air_quality;
      airQualityData = {
        pm25: aq.pm2_5 || null,
        pm10: aq.pm10 || null,
        co: aq.co || null,
        no2: aq.no2 || null,
        o3: aq.o3 || null,
        so2: aq.so2 || null,
        usEpaIndex: aq['us-epa-index'] || null,
        gbDefraIndex: aq['gb-defra-index'] || null
      };
    }

    // 📊 রিয়েল ৭-দিনের ডেইলি ফোরকাস্ট ট্রেন্ড (নো ডামি ডেটা!)
    const dailyTrends = weatherData.forecast.forecastday.map(day => ({
      date: day.date,
      maxTemp: day.day.maxtemp_c,
      minTemp: day.day.mintemp_c,
      totalRain: day.day.totalprecip_mm,
      condition: day.day.condition.text
    }));

    // ৩. MongoDB-তে লাইভ রিয়েল ডেটা সেভ করা
    const newWeatherData = new Weather({
      city: cityNameDisplay,
      country: countryName,
      location: {
        type: 'Point',
        coordinates: [lon, lat]
      },
      currentMetrics: {
        temperature,
        humidity,
        windSpeed,
        precipitation,
        uvIndex,
        conditionText,
        windDirection
      },
      dailyTrends,
      airQuality: airQualityData,
      source: 'WeatherAPI Advanced Service'
    });

    await newWeatherData.save();

    // ফ্রন্টএন্ড চার্ট রিড করার জন্য অবজেক্ট ফরম্যাটিং (WeatherForecastChart component এর প্রয়োজনীয় ফরম্যাট)
    const formattedDaily = {
      time: dailyTrends.map(t => t.date),
      maxTemperature: dailyTrends.map(t => t.maxTemp),
      minTemperature: dailyTrends.map(t => t.minTemp),
      totalPrecipitation: dailyTrends.map(t => t.totalRain)
    };

    res.status(201).json({
      success: true,
      data: newWeatherData,
      daily: formattedDaily,
      extra: {
        conditionText,
        conditionIcon,
        windDirection,
        airQuality: airQualityData
      }
    });

  } catch (error) {
    console.error('Error in Advanced Weather search:', error.message);
    const statusCode = error.response ? error.response.status : 500;
    let errMsg = 'Failed to fetch accurate weather data';
    
    if (statusCode === 400 || statusCode === 404) {
      errMsg = 'City not found! Please check the spelling.';
    } else if (statusCode === 401 || statusCode === 403) {
      errMsg = 'Invalid API Key. Please check your .env file.';
    }

    res.status(statusCode).json({ success: false, message: errMsg });
  }
});

// ==========================================================
// PRE-EXISTING CASCADE ROUTES (PRESERVED PERFECTLY)
// ==========================================================

router.get('/city/:city', auth, async (req, res) => {
  try {
    const { city } = req.params;
    const { limit = 100 } = req.query;
    const data = await Weather.find({ city: new RegExp(city, 'i') })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/latest', auth, async (req, res) => {
  try {
    const data = await Weather.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$city',
          latestData: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$latestData' } }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/trends/:city', auth, async (req, res) => {
  try {
    const { city } = req.params;
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const data = await Weather.find({
      city: new RegExp(city, 'i'),
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/stats/:city', auth, async (req, res) => {
  try {
    const { city } = req.params;
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const stats = await Weather.aggregate([
      {
        $match: {
          city: new RegExp(city, 'i'),
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          avgTemperature: { $avg: '$currentMetrics.temperature' },
          avgHumidity: { $avg: '$currentMetrics.humidity' },
          avgWindSpeed: { $avg: '$currentMetrics.windSpeed' },
          avgPrecipitation: { $avg: '$currentMetrics.precipitation' },
          avgUVIndex: { $avg: '$currentMetrics.uvIndex' },
          maxTemperature: { $max: '$currentMetrics.temperature' },
          minTemperature: { $min: '$currentMetrics.temperature' },
          maxPrecipitation: { $max: '$currentMetrics.precipitation' },
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(stats[0] || {});
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/cities', auth, async (req, res) => {
  try {
    const cities = await Weather.distinct('city');
    res.json(cities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/save', auth, async (req, res) => {
  try {
    const {
      city, country, latitude, longitude,
      temperature, humidity, windSpeed,
      precipitation, uvIndex, dailyTrends
    } = req.body;

    const newWeather = new Weather({
      city, country,
      location: { type: 'Point', coordinates: [longitude, latitude] },
      currentMetrics: { temperature, humidity, windSpeed, precipitation, uvIndex },
      dailyTrends,
      source: 'Manual Entry'
    });

    const savedData = await newWeather.save();
    res.status(201).json(savedData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;