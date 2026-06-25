const express = require('express');
const axios = require('axios');
const NaturalDisaster = require('../models/NaturalDisaster');
const auth = require('../middleware/auth');
const xml2js = require('xml2js');

const router = express.Router();

// GDACS API endpoint - using RSS feed which is more reliable
const GDACS_API_URL = 'https://www.gdacs.org/xml/rss.xml';

// Helper function to map GDACS event type to our disaster type
function mapGDACSEventType(gdacsType) {
  const typeMap = {
    'TC': 'cyclone',
    'FL': 'flood',
    'EQ': 'earthquake',
    'VO': 'volcanic eruption',
    'TS': 'tsunami',
    'DR': 'drought',
    'WF': 'wildfire',
    'ST': 'storm'
  };
  return typeMap[gdacsType] || 'other';
}

// Helper function to map GDACS alert level to our severity
function mapGDACSAlertLevel(alertLevel) {
  const levelMap = {
    'Red': 'critical',
    'Orange': 'severe',
    'Green': 'low',
    'Yellow': 'moderate'
  };
  const mapped = levelMap[alertLevel] || 'moderate';
  console.log(`Mapping alert level: ${alertLevel} -> ${mapped}`);
  return mapped;
}

// Helper function to fetch and parse GDACS data
async function fetchGDACSData() {
  try {
    console.log('Fetching GDACS data from:', GDACS_API_URL);
    const response = await axios.get(GDACS_API_URL, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log('GDACS response status:', response.status);
    console.log('GDACS response content-type:', response.headers['content-type']);
    
    // Parse RSS XML
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);
    console.log('RSS parsed successfully');
    
    return result;
  } catch (error) {
    console.error('Error fetching GDACS data:', error.message);
    throw error;
  }
}

// Helper function to map GDACS RSS item to our disaster format
function mapGDACSFeature(item) {
  const props = item;
  const title = props.title?.[0] || 'Unknown Disaster';
  const description = props.description?.[0] || '';
  const link = props.link?.[0] || '';
  
  // Parse GDACS-specific fields from description or title
  // RSS format: "TC - Cyclone Name - Country (Alert Level)"
  const alertLevelMatch = title.match(/\((Red|Orange|Green|Yellow)\)/i);
  const alertLevel = alertLevelMatch ? alertLevelMatch[1] : 'Green';
  
  // Extract disaster type from title
  const typeMatch = title.match(/^(TC|FL|EQ|VO|TS|DR|WF|ST)/);
  const eventType = typeMatch ? typeMatch[1] : 'OT';
  
  // Extract country from title
  const countryMatch = title.match(/- ([^-]+) \(/);
  const country = countryMatch ? countryMatch[1].trim() : 'Unknown';
  
  // Try to extract coordinates from gdacs: namespace if available
  let lat = 0, lon = 0;
  if (props['gdacs:lat']) lat = parseFloat(props['gdacs:lat'][0]);
  if (props['gdacs:lon']) lon = parseFloat(props['gdacs:lon'][0]);
  
  return {
    disasterType: mapGDACSEventType(eventType),
    title: title,
    description: description,
    location: {
      city: 'Unknown', // RSS doesn't always provide city
      country: country,
      coordinates: {
        type: 'Point',
        coordinates: [lon, lat]
      }
    },
    severity: mapGDACSAlertLevel(alertLevel),
    magnitude: null, // RSS doesn't always provide magnitude
    affectedArea: country,
    casualties: {
      deaths: 0,
      injured: 0,
      missing: 0
    },
    status: 'Active',
    startDate: props.pubDate ? new Date(props.pubDate[0]) : new Date(),
    endDate: null,
    source: 'GDACS',
    imageUrl: link
  };
}

// Helper function to sync GDACS data to MongoDB
async function syncGDACSDataToMongoDB() {
  try {
    console.log('Fetching GDACS data...');
    const gdacsData = await fetchGDACSData();
    
    // RSS structure: rss.channel.item
    const items = gdacsData?.rss?.channel?.[0]?.item;
    if (!gdacsData || !items) {
      console.warn('Invalid GDACS RSS data format');
      console.log('GDACS data structure:', JSON.stringify(gdacsData, null, 2).substring(0, 500));
      return [];
    }

    console.log(`GDACS returned ${items.length} RSS items`);

    const syncedDisasters = [];
    
    for (const item of items) {
      try {
        const disasterData = mapGDACSFeature(item);
        console.log('Mapped item:', disasterData);
        
        // Check if disaster already exists (by title and date)
        const existingDisaster = await NaturalDisaster.findOne({
          title: disasterData.title,
          startDate: disasterData.startDate,
          source: 'GDACS'
        });

        if (existingDisaster) {
          // Update existing disaster
          console.log(`Updating existing disaster: ${disasterData.title}`);
          await NaturalDisaster.findByIdAndUpdate(existingDisaster._id, disasterData);
          syncedDisasters.push(await NaturalDisaster.findById(existingDisaster._id));
        } else {
          // Create new disaster
          console.log(`Creating new disaster: ${disasterData.title}`);
          const newDisaster = new NaturalDisaster(disasterData);
          await newDisaster.save();
          console.log(`Successfully saved: ${disasterData.title}`);
          syncedDisasters.push(newDisaster);
        }
      } catch (error) {
        console.error('Error syncing individual disaster:', error.message);
        console.error('Full error:', error);
      }
    }

    // Mark old GDACS disasters as resolved (older than 7 days and not in current feed)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const currentTitles = items.map(i => i.title?.[0] || i.description?.[0]);
    
    await NaturalDisaster.updateMany(
      {
        source: 'GDACS',
        status: 'Active',
        startDate: { $lt: sevenDaysAgo },
        title: { $nin: currentTitles }
      },
      { status: 'Resolved' }
    );

    console.log(`Synced ${syncedDisasters.length} disasters to MongoDB`);
    return syncedDisasters;
  } catch (error) {
    console.error('Error syncing GDACS data:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

// Create a new natural disaster record
router.post('/create', auth, async (req, res) => {
  try {
    const {
      disasterType,
      title,
      description,
      city,
      country,
      latitude,
      longitude,
      severity,
      magnitude,
      affectedArea,
      casualties,
      status,
      startDate,
      endDate,
      source,
      imageUrl
    } = req.body;

    // Validate required fields
    if (!disasterType || !title || !city || !country || !latitude || !longitude || !startDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Validate disaster type
    const validDisasterTypes = ['earthquake', 'flood', 'cyclone', 'wildfire', 'tornado', 'tsunami', 'volcanic eruption', 'landslide', 'drought', 'storm', 'other'];
    if (!validDisasterTypes.includes(disasterType)) {
      return res.status(400).json({ success: false, message: 'Invalid disaster type' });
    }

    // Validate severity
    const validSeverities = ['low', 'moderate', 'high', 'severe', 'critical'];
    if (severity && !validSeverities.includes(severity)) {
      return res.status(400).json({ success: false, message: 'Invalid severity level' });
    }

    // Validate status
    const validStatuses = ['Active', 'Monitoring', 'Resolved', 'Unknown'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Create new natural disaster record
    const newDisaster = new NaturalDisaster({
      disasterType,
      title,
      description,
      location: {
        city,
        country,
        coordinates: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      },
      severity: severity || 'Moderate',
      magnitude,
      affectedArea,
      casualties: casualties || { deaths: 0, injured: 0, missing: 0 },
      status: status || 'Unknown',
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      source: source || 'Manual Entry',
      imageUrl
    });

    await newDisaster.save();

    res.status(201).json({
      success: true,
      data: newDisaster
    });

  } catch (error) {
    console.error('Error creating natural disaster:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get all natural disasters
router.get('/all', auth, async (req, res) => {
  try {
    const { limit = 50, disasterType, status, city } = req.query;

    const query = {};
    if (disasterType) query.disasterType = disasterType;
    if (status) query.status = status;
    if (city) query['location.city'] = new RegExp(city, 'i');

    const disasters = await NaturalDisaster.find(query)
      .sort({ startDate: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: disasters
    });

  } catch (error) {
    console.error('Error fetching natural disasters:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get active natural disasters with live GDACS data
router.get('/active/list', auth, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // Try to fetch and sync live GDACS data
    let disasters;
    try {
      const syncedDisasters = await syncGDACSDataToMongoDB();
      disasters = syncedDisasters.filter(d => d.status === 'Active');
      console.log(`Successfully synced ${disasters.length} active disasters from GDACS`);
    } catch (gdacsError) {
      console.warn('GDACS API unavailable, falling back to MongoDB cache:', gdacsError.message);
      // Fallback to MongoDB cache
      disasters = await NaturalDisaster.find({ status: 'Active' })
        .sort({ startDate: -1 })
        .limit(parseInt(limit));
    }

    // Apply limit if needed
    if (disasters.length > parseInt(limit)) {
      disasters = disasters.slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      data: disasters,
      source: disasters.length > 0 && disasters[0].source === 'GDACS' ? 'Live GDACS' : 'MongoDB Cache'
    });

  } catch (error) {
    console.error('Error fetching active disasters:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get natural disasters by city
router.get('/city/:city', auth, async (req, res) => {
  try {
    const { city } = req.params;
    const { limit = 50 } = req.query;

    const disasters = await NaturalDisaster.find({
      'location.city': new RegExp(city, 'i')
    })
      .sort({ startDate: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: disasters
    });

  } catch (error) {
    console.error('Error fetching disasters by city:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get natural disasters by type
router.get('/type/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 50 } = req.query;

    const disasters = await NaturalDisaster.find({ disasterType: type })
      .sort({ startDate: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: disasters
    });

  } catch (error) {
    console.error('Error fetching disasters by type:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get natural disaster statistics with live GDACS data
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // Try to sync live GDACS data first
    try {
      await syncGDACSDataToMongoDB();
      console.log('Successfully synced GDACS data for statistics');
    } catch (gdacsError) {
      console.warn('GDACS API unavailable for statistics, using cached data:', gdacsError.message);
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await NaturalDisaster.aggregate([
      {
        $match: {
          startDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$disasterType',
          count: { $sum: 1 },
          totalDeaths: { $sum: '$casualties.deaths' },
          totalInjured: { $sum: '$casualties.injured' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const activeCount = await NaturalDisaster.countDocuments({ status: 'Active' });
    const totalCount = await NaturalDisaster.countDocuments({ startDate: { $gte: startDate } });

    res.json({
      success: true,
      data: {
        byType: stats,
        activeCount,
        totalCount
      },
      source: 'Live GDACS with MongoDB Cache'
    });

  } catch (error) {
    console.error('Error fetching disaster statistics:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get natural disaster by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const disaster = await NaturalDisaster.findById(req.params.id);

    if (!disaster) {
      return res.status(404).json({ success: false, message: 'Natural disaster not found' });
    }

    res.json({
      success: true,
      data: disaster
    });

  } catch (error) {
    console.error('Error fetching natural disaster:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update natural disaster
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;
    
    // Prevent updating certain fields
    delete updates._id;
    delete updates.createdAt;

    const disaster = await NaturalDisaster.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!disaster) {
      return res.status(404).json({ success: false, message: 'Natural disaster not found' });
    }

    res.json({
      success: true,
      data: disaster
    });

  } catch (error) {
    console.error('Error updating natural disaster:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Delete natural disaster
router.delete('/:id', auth, async (req, res) => {
  try {
    const disaster = await NaturalDisaster.findByIdAndDelete(req.params.id);

    if (!disaster) {
      return res.status(404).json({ success: false, message: 'Natural disaster not found' });
    }

    res.json({
      success: true,
      message: 'Natural disaster deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting natural disaster:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
