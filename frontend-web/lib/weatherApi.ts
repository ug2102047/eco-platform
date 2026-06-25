// Weather API integration with backend

export interface WeatherData {
  city: string;
  country: string;
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    uvIndex: number;
  };
  daily: {
    time: string[];
    maxTemperature: number[];
    minTemperature: number[];
    totalPrecipitation: number[];
  };
}

const API_BASE_URL = 'https://eco-platform-backend.onrender.com/api/weather';

export async function searchWeather(city: string): Promise<WeatherData> {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify({ city }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch weather data');
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch weather data');
  }

  return result.data;
}

export async function getLatestWeathers(): Promise<WeatherData[]> {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/latest`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch saved weather data');
  }

  const result = await response.json();
  return Array.isArray(result) ? result : result.data || [];
}