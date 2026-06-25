'use client';

import { useState, useEffect } from 'react';
import { Cloud, Thermometer, Droplets, Wind, Umbrella, Sun, Search, Navigation } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import CitySearchBar from '@/components/CitySearchBar';
import WeatherForecastChart from '@/components/WeatherForecastChart';

export default function WeatherPage() {
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedWeathers, setSavedWeathers] = useState<any[]>([]);

  // Fetch saved history records from our backend server
  const fetchSavedWeathers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://eco-platform-d71a.onrender.com/api/weather/latest', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (response.ok) {
        const result = await response.json();
        setSavedWeathers(Array.isArray(result) ? result : result.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch saved weathers:', err);
    }
  };

  useEffect(() => {
    fetchSavedWeathers();
  }, []);

  const handleSearch = async (city: string) => {
    if (!city.trim()) return;

    try {
      setLoading(true);
      setError('');
      setSearchResult(null);

      const token = localStorage.getItem('token');

      const response = await fetch('https://eco-platform-d71a.onrender.com/api/weather/search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ city }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const trends = Array.isArray(result.data?.dailyTrends) ? result.data.dailyTrends : [];

        // ব্যাকঅ্যান্ডের অ্যারে ডেটাকে চার্ট কম্পোনেন্টের অবজেক্ট ফরম্যাটে ম্যাপ করা হলো
        const formattedData = {
          city: result.data?.city || city,
          country: result.data?.country || 'Unknown',
          temperature: result.data?.currentMetrics?.temperature ?? 0,
          humidity: result.data?.currentMetrics?.humidity ?? 0,
          windSpeed: result.data?.currentMetrics?.windSpeed ?? 0,
          precipitation: result.data?.currentMetrics?.precipitation ?? 0,
          uvIndex: result.data?.currentMetrics?.uvIndex ?? 0,

          // লাইভ কন্ডিশন আইকন, টেক্সট এবং বাতাসের দিক
          conditionText: result.extra?.conditionText || result.data?.currentMetrics?.conditionText || 'Clear',
          conditionIcon: result.extra?.conditionIcon || null,
          windDirection: result.extra?.windDirection || result.data?.currentMetrics?.windDirection || 'N/A',

          // এয়ার কোয়ালিটি ডেটা (WeatherAPI থেকে)
          airQuality: result.extra?.airQuality || result.data?.airQuality || null,

          // চার্ট কম্পোনেন্ট যেভাবে time, maxTemperature, minTemperature, totalPrecipitation অবজেক্ট আলাদা চায়
          daily: result.daily || null,

          // সরাসরি dailyTrends ম্যাপিং করা
          dailyTrends: result.data?.dailyTrends || null
        };

        console.log('Weather search result:', result);
        console.log('Formatted daily data:', result.daily);
        console.log('Daily data from result.data.dailyTrends:', result.data?.dailyTrends);
        setSearchResult(formattedData);
        await fetchSavedWeathers();
      } else {
        setError(result.message || 'Failed to fetch weather data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const getUVIndexColor = (uvIndex: number) => {
    if (uvIndex <= 2) return 'bg-green-500';
    if (uvIndex <= 5) return 'bg-yellow-500';
    if (uvIndex <= 7) return 'bg-orange-500';
    if (uvIndex <= 10) return 'bg-red-500';
    return 'bg-purple-500';
  };

  const getUVIndexLabel = (uvIndex: number) => {
    if (uvIndex <= 2) return 'Low';
    if (uvIndex <= 5) return 'Moderate';
    if (uvIndex <= 7) return 'High';
    if (uvIndex <= 10) return 'Very High';
    return 'Extreme';
  };

  const getUVIndexAdvisory = (uvIndex: number) => {
    if (uvIndex <= 2) return 'No protection needed';
    if (uvIndex <= 5) return 'Wear sunscreen';
    if (uvIndex <= 7) return 'Seek shade, wear protection';
    if (uvIndex <= 10) return 'Extra protection required';
    return 'Avoid sun exposure';
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6 overflow-y-auto">
          <div className="flex items-center space-x-3">
            <Cloud className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Weather & Climate</h1>
          </div>

          {/* Search Bar Component */}
          <CitySearchBar onSearch={handleSearch} loading={loading} />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Search Result Dashboard Section */}
          {searchResult && (
            <div className="space-y-6">
              {/* Main Result Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    {/* লাইভ কন্ডিশন আইকন */}
                    {searchResult.conditionIcon ? (
                      <img 
                        src={`https:${searchResult.conditionIcon}`} 
                        alt={searchResult.conditionText} 
                        className="w-16 h-16 object-contain bg-blue-50 rounded-full p-1 border border-blue-100" 
                      />
                    ) : (
                      <div className="p-3 bg-blue-50 rounded-full text-blue-500">
                        <Cloud className="w-10 h-10" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{searchResult.city}</h2>
                      <p className="text-gray-600">
                        {searchResult.country} • <span className="text-blue-600 font-medium">{searchResult.conditionText}</span>
                      </p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-white font-medium ${getUVIndexColor(searchResult.uvIndex)}`}>
                    UV Index: {searchResult.uvIndex}
                  </div>
                </div>

                {/* Current Weather Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {/* Temperature */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <Thermometer className="w-5 h-5 text-orange-600" />
                      <p className="text-sm font-medium text-gray-700">Temperature</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{searchResult.temperature.toFixed(1)}°C</p>
                  </div>

                  {/* Humidity */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <Droplets className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-medium text-gray-700">Humidity</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{searchResult.humidity.toFixed(0)}%</p>
                  </div>

                  {/* Wind Speed & Direction */}
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Wind className="w-5 h-5 text-gray-600" />
                      <p className="text-sm font-medium text-gray-700">Wind</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{searchResult.windSpeed.toFixed(1)} km/h</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-gray-400 rotate-45" /> Dir: {searchResult.windDirection}
                    </p>
                  </div>

                  {/* Precipitation */}
                  <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg p-4 border border-teal-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <Umbrella className="w-5 h-5 text-teal-600" />
                      <p className="text-sm font-medium text-gray-700">Precipitation</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{searchResult.precipitation.toFixed(1)} mm</p>
                  </div>

                  {/* UV Index with Advisory */}
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-100 col-span-2 md:col-span-3 lg:col-span-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sun className="w-5 h-5 text-yellow-600" />
                      <p className="text-sm font-medium text-gray-700">UV Level</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{getUVIndexLabel(searchResult.uvIndex)}</p>
                    <p className="text-xs text-gray-600 mt-1">{getUVIndexAdvisory(searchResult.uvIndex)}</p>
                  </div>
                </div>

                {/* 7-Day Forecast Chart Section */}
                {searchResult.daily && searchResult.daily.time && searchResult.daily.time.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-6 mt-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">7-Day Weather Forecast</h3>
                    <WeatherForecastChart dailyData={searchResult.daily} />
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 mt-6 text-center text-sm text-gray-500 border border-dashed border-gray-200">
                    No 7-day forecast data available for this location.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search History Layout Section */}
          <div className="mt-8 mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Search History / Saved Weather</h3>
          </div>

          {savedWeathers && savedWeathers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedWeathers.map((weather) => {
                const metrics = weather.currentMetrics || weather.current || {};
                const uv = metrics.uvIndex || 0;
                
                return (
                  <div key={weather._id || Math.random()} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{weather.city}</h4>
                        <p className="text-sm text-gray-500">{weather.country}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-white text-xs font-medium ${getUVIndexColor(uv)}`}>
                        UV: {uv}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-orange-50 rounded p-2">
                        <p className="text-xs text-gray-600">Temperature</p>
                        <p className="text-sm font-bold text-gray-900">{(metrics.temperature ?? 0).toFixed(1)}°C</p>
                      </div>
                      <div className="bg-blue-50 rounded p-2">
                        <p className="text-xs text-gray-600">Humidity</p>
                        <p className="text-sm font-bold text-gray-900">{(metrics.humidity ?? 0).toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No weather search history yet. Search for a city to get started!</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
