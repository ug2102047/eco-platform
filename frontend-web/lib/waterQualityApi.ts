// Open-Meteo Marine API integration

export interface WaterQualityData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  waterTemperature: number;
  salinity: number;
  waveHeight: number;
  waveDirection: number;
  wavePeriod: number;
  waterQualityLevel: string;
  ph: number;
  turbidity: number;
  dissolvedOxygen: number;
  waterScarcityLevel: string;
  hourly?: {
    time: string[];
    waterTemperature: number[];
    salinity: number[];
    waveHeight: number[];
  };
}

const getWaterQualityLevel = (temperature: number, salinity: number): string => {
  // Simple water quality assessment based on temperature and salinity
  // This is a basic classification - in production, you'd use more sophisticated metrics
  if (temperature >= 18 && temperature <= 30 && salinity >= 30 && salinity <= 40) {
    return 'Excellent';
  } else if (temperature >= 15 && temperature <= 35 && salinity >= 25 && salinity <= 45) {
    return 'Good';
  } else if (temperature >= 10 && temperature <= 40 && salinity >= 20 && salinity <= 50) {
    return 'Fair';
  } else {
    return 'Poor';
  }
};

export async function getCityCoordinates(city: string): Promise<{ lat: number; lon: number; country: string }> {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=en&format=json`
  );
  
  if (!response.ok) {
    console.error('Geocoding API error:', response.status, response.statusText);
    throw new Error('Failed to geocode city');
  }
  
  const data = await response.json();
  
  console.log('Geocoding response:', data);
  
  if (!data.results || data.results.length === 0) {
    throw new Error(`City "${city}" not found. Please check the spelling and try again.`);
  }
  
  const result = data.results[0];
  console.log('Selected city:', result.name, result.country);
  
  return {
    lat: result.latitude,
    lon: result.longitude,
    country: result.country || result.name || ''
  };
}

export async function getWaterQualityData(city: string): Promise<WaterQualityData> {
  // Get city coordinates
  const { lat, lon, country } = await getCityCoordinates(city);
  
  // Fetch marine data from Open-Meteo Marine API
  const response = await fetch(
    `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=water_temperature,sea_surface_temperature,sea_surface_salinity,wave_height,wave_direction,wave_period&hourly=water_temperature,sea_surface_salinity,wave_height&timezone=auto`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch water quality data');
  }
  
  const data = await response.json();
  const current = data.current;
  
  // Use water_temperature if available, otherwise sea_surface_temperature
  const waterTemp = current.water_temperature || current.sea_surface_temperature || 0;
  const salinity = current.sea_surface_salinity || 35; // Default ocean salinity
  
  return {
    city: city.charAt(0).toUpperCase() + city.slice(1),
    country,
    latitude: lat,
    longitude: lon,
    waterTemperature: waterTemp,
    salinity: salinity,
    waveHeight: current.wave_height || 0,
    waveDirection: current.wave_direction || 0,
    wavePeriod: current.wave_period || 0,
    waterQualityLevel: getWaterQualityLevel(waterTemp, salinity),
    hourly: data.hourly ? {
      time: data.hourly.time.slice(-24), // Last 24 hours
      waterTemperature: (data.hourly.water_temperature || data.hourly.sea_surface_temperature || []).slice(-24),
      salinity: (data.hourly.sea_surface_salinity || []).slice(-24),
      waveHeight: (data.hourly.wave_height || []).slice(-24),
    } : undefined,
  };
}
