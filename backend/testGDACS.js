const mongoose = require('mongoose');
const NaturalDisaster = require('./models/NaturalDisaster');
require('dotenv').config();

// Import the sync function from the routes file
const axios = require('axios');

const GDACS_API_URL = 'https://www.gdacs.org/xml/gdacs.geojson';

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

async function fetchGDACSData() {
  try {
    console.log('Fetching GDACS data from:', GDACS_API_URL);
    const response = await axios.get(GDACS_API_URL, {
      timeout: 30000,
      maxContentLength: 50 * 1024 * 1024, // 50MB
      maxBodyLength: 50 * 1024 * 1024, // 50MB
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log('GDACS response status:', response.status);
    console.log('GDACS response content-type:', response.headers['content-type']);
    console.log('Response data type:', typeof response.data);
    console.log('Response has features:', response.data && response.data.features ? response.data.features.length : 'N/A');
    return response.data;
  } catch (error) {
    console.error('Error fetching GDACS data:', error.message);
    throw error;
  }
}

function mapGDACSFeature(feature) {
  const props = feature.properties;
  const coords = feature.geometry?.coordinates || [0, 0];
  
  return {
    disasterType: mapGDACSEventType(props.eventtype || props.type),
    title: props.name || props.description || 'Unknown Disaster',
    description: props.description || '',
    location: {
      city: props.city || 'Unknown',
      country: props.country || 'Unknown',
      coordinates: {
        type: 'Point',
        coordinates: coords.length === 2 ? [coords[0], coords[1]] : [0, 0]
      }
    },
    severity: mapGDACSAlertLevel(props.alertlevel || 'Green'),
    magnitude: props.magnitude || null,
    affectedArea: props.affectedarea || '',
    casualties: {
      deaths: props.deaths || 0,
      injured: props.injured || 0,
      missing: props.missing || 0
    },
    status: 'Active',
    startDate: props.fromdate ? new Date(props.fromdate) : new Date(),
    endDate: props.todate ? new Date(props.todate) : null,
    source: 'GDACS',
    imageUrl: props.icon || ''
  };
}

async function testGDACSSync() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Fetch GDACS data
    const gdacsData = await fetchGDACSData();
    
    if (!gdacsData || !gdacsData.features) {
      console.warn('Invalid GDACS data format');
      console.log('GDACS data:', gdacsData);
      return;
    }

    console.log(`GDACS returned ${gdacsData.features.length} features`);
    
    // Log first feature for debugging
    if (gdacsData.features.length > 0) {
      console.log('First feature properties:', gdacsData.features[0].properties);
    }

    const syncedDisasters = [];
    
    for (const feature of gdacsData.features) {
      try {
        const disasterData = mapGDACSFeature(feature);
        console.log('Mapped item:', JSON.stringify(disasterData, null, 2));
        
        // Check if disaster already exists
        const existingDisaster = await NaturalDisaster.findOne({
          title: disasterData.title,
          startDate: disasterData.startDate,
          source: 'GDACS'
        });

        if (existingDisaster) {
          console.log(`Updating existing disaster: ${disasterData.title}`);
          await NaturalDisaster.findByIdAndUpdate(existingDisaster._id, disasterData);
          syncedDisasters.push(await NaturalDisaster.findById(existingDisaster._id));
        } else {
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

    console.log(`Synced ${syncedDisasters.length} disasters to MongoDB`);
    
    // Query all active disasters
    const allActive = await NaturalDisaster.find({ status: 'Active' });
    console.log(`Total active disasters in DB: ${allActive.length}`);
    
  } catch (error) {
    console.error('Error in test:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

testGDACSSync();
