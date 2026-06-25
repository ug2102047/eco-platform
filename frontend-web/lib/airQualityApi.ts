// Open-Meteo Air Quality API integration

export interface AirQualityData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  aqi: number;
  aqiLevel: string;
  measurements: {
    pm25: number;
    pm10: number;
    co: number;
    no2: number;
    o3: number;
    so2: number;
  };
  hourly?: {
    time: string[];
    aqi: number[];
  };
}

const getAQILevel = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
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

export async function getAirQualityData(city: string): Promise<AirQualityData> {
  // Get city coordinates
  const { lat, lon, country } = await getCityCoordinates(city);
  
  // Fetch air quality data
  const response = await fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide,us_aqi&hourly=us_aqi&timezone=auto`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch air quality data');
  }
  
  const data = await response.json();
  const current = data.current;
  const aqi = current.us_aqi;
  
  return {
    city: city.charAt(0).toUpperCase() + city.slice(1),
    country,
    latitude: lat,
    longitude: lon,
    aqi,
    aqiLevel: getAQILevel(aqi),
    measurements: {
      pm25: current.pm2_5 || 0,
      pm10: current.pm10 || 0,
      co: current.carbon_monoxide || 0,
      no2: current.nitrogen_dioxide || 0,
      o3: current.ozone || 0,
      so2: current.sulphur_dioxide || 0,
    },
    hourly: data.hourly ? {
      time: data.hourly.time.slice(-24), // Last 24 hours
      aqi: data.hourly.us_aqi.slice(-24),
    } : undefined,
  };
}
