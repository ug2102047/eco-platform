'use client';

import { useState, useEffect } from 'react';
import { Wind } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import CitySearchBar from '@/components/CitySearchBar';
import AQIGaugeChart from '@/components/AQIGaugeChart';
import AQILineChart from '@/components/AQILineChart';
import PollutantBarChart from '@/components/PollutantBarChart';
import { airQualityAPI } from '@/lib/api';

interface AirQualityData {
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

export default function AirQualityPage() {
  const [searchResult, setSearchResult] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedCities, setSavedCities] = useState<any[]>([]);

  const fetchSavedCities = async () => {
    try {
      const response = await airQualityAPI.getLatest();
      setSavedCities(response.data);
    } catch (err) {
      console.error('Failed to fetch saved cities:', err);
    }
  };

  useEffect(() => {
    fetchSavedCities();
  }, []);

  const handleSearch = async (city: string) => {
    try {
      setLoading(true);
      setError('');
      setSearchResult(null);

      const token = localStorage.getItem('token');

      // Fetch air quality data from backend (WeatherAPI with aqi=yes)
      const response = await fetch('http://localhost:5000/api/air-quality/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ city }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const formattedData = {
          city: result.data?.city || city,
          country: result.data?.country || 'Unknown',
          latitude: result.data?.location?.coordinates[1] || 0,
          longitude: result.data?.location?.coordinates[0] || 0,
          aqi: result.data?.aqi || 0,
          aqiLevel: result.data?.aqiLevel || 'Unknown',
          measurements: {
            pm25: result.data?.measurements?.pm25 || 0,
            pm10: result.data?.measurements?.pm10 || 0,
            co: result.data?.measurements?.co || 0,
            no2: result.data?.measurements?.no2 || 0,
            o3: result.data?.measurements?.o3 || 0,
            so2: result.data?.measurements?.so2 || 0,
          },
          hourly: undefined // WeatherAPI doesn't provide hourly AQI in current endpoint
        };

        setSearchResult(formattedData);
        await fetchSavedCities();
      } else {
        setError(result.message || 'Failed to fetch air quality data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-green-500';
    if (aqi <= 100) return 'bg-yellow-500';
    if (aqi <= 150) return 'bg-orange-500';
    if (aqi <= 200) return 'bg-red-500';
    if (aqi <= 300) return 'bg-purple-500';
    return 'bg-red-900';
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6 overflow-y-auto">
          <div className="flex items-center space-x-3">
            <Wind className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Air Quality</h1>
          </div>

          {/* Search Bar */}
          <CitySearchBar onSearch={handleSearch} loading={loading} />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Search Result */}
          {searchResult && (
            <div className="space-y-6">
              {/* Main Result Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{searchResult.city}</h2>
                    <p className="text-gray-600">{searchResult.country}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-white font-medium ${getAQIColor(searchResult.aqi)}`}>
                    {searchResult.aqiLevel}
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gauge Chart */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Current AQI</h3>
                    <AQIGaugeChart aqi={searchResult.aqi} />
                  </div>

                  {/* Pollutant Bar Chart */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Pollutant Levels</h3>
                    <PollutantBarChart measurements={searchResult.measurements} />
                  </div>
                </div>

                {/* Line Chart for 24-hour trend */}
                {searchResult.hourly && (
                  <div className="bg-gray-50 rounded-lg p-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">24-Hour AQI Trend</h3>
                    <AQILineChart hourlyData={searchResult.hourly} />
                  </div>
                )}

                {/* Search History / Saved Cities */}
                <div className="mt-8 mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">### Search History / Saved Cities</h3>
                </div>

                {savedCities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedCities.map((city) => (
                      <div key={city._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-800">{city.city}</h4>
                            <p className="text-sm text-gray-600">{city.country}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-800">{city.aqi ? Math.round(city.aqi) : 'N/A'}</p>
                            <p className="text-xs text-gray-600">AQI</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Saved: {new Date(city.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No history yet. Search for a city above to save it!
                  </div>
                )}

                {/* Detailed Measurements */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">PM2.5</p>
                    <p className="text-2xl font-bold text-gray-900">{searchResult.measurements.pm25.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">µg/m³</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">PM10</p>
                    <p className="text-2xl font-bold text-gray-900">{searchResult.measurements.pm10.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">µg/m³</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">CO</p>
                    <p className="text-2xl font-bold text-gray-900">{searchResult.measurements.co.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">mg/m³</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">NO2</p>
                    <p className="text-2xl font-bold text-gray-900">{searchResult.measurements.no2.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">µg/m³</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">O3</p>
                    <p className="text-2xl font-bold text-gray-900">{searchResult.measurements.o3.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">µg/m³</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">SO2</p>
                    <p className="text-2xl font-bold text-gray-900">{searchResult.measurements.so2.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">µg/m³</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
