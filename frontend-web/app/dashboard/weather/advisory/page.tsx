'use client';

import { useState } from 'react';
import { Sun, Shield, Shirt, Umbrella, AlertCircle, CheckCircle, Thermometer, Wind, Droplets, Sparkles, AlertTriangle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import CitySearchBar from '@/components/CitySearchBar';

function LifestyleAdvisoryContent() {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (city: string) => {
    try {
      setLoading(true);
      setError('');
      setWeatherData(null);

      const token = localStorage.getItem('token');
      const response = await fetch('https://eco-platform-backend.onrender.com/api/weather/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ city })
      });

      const result = await response.json();

      if (result.success) {
        setWeatherData(result.data);
      } else {
        setError(result.message || 'Failed to fetch weather data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const displayData = weatherData || {
    currentMetrics: {
      temperature: 0,
      uvIndex: 0,
      precipitation: 0
    },
    airQuality: {
      pm25: 0,
      pm10: 0
    }
  };

  const uvIndex = displayData.currentMetrics?.uvIndex || 0;
  const uvPercentage = Math.min((uvIndex / 11) * 100, 100);
  const uvLevel = uvIndex <= 2 ? 'Low' : uvIndex <= 5 ? 'Moderate' : uvIndex <= 7 ? 'High' : uvIndex <= 10 ? 'Very High' : 'Extreme';
  const uvColor = uvIndex <= 2 ? 'text-green-600' : uvIndex <= 5 ? 'text-yellow-600' : uvIndex <= 7 ? 'text-orange-600' : 'text-red-600';
  const uvGradient = uvIndex <= 2 ? 'from-green-500 to-green-600' : uvIndex <= 5 ? 'from-yellow-500 to-yellow-600' : uvIndex <= 7 ? 'from-orange-500 to-orange-600' : 'from-red-500 to-red-600';
  const uvBadge = uvIndex <= 2 ? 'bg-green-50 text-green-700 border-green-200' : uvIndex <= 5 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : uvIndex <= 7 ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-red-50 text-red-700 border-red-200';

  const aqi = displayData.airQuality?.pm25 || 0;
  const aqiPercentage = Math.min((aqi / 500) * 100, 100);
  const aqiLevel = aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : aqi <= 150 ? 'Unhealthy for Sensitive Groups' : aqi <= 200 ? 'Unhealthy' : aqi <= 300 ? 'Very Unhealthy' : 'Hazardous';
  const aqiColor = aqi <= 50 ? 'text-green-600' : aqi <= 100 ? 'text-yellow-600' : aqi <= 150 ? 'text-orange-600' : 'text-red-600';
  const aqiGradient = aqi <= 50 ? 'from-green-500 to-green-600' : aqi <= 100 ? 'from-yellow-500 to-yellow-600' : aqi <= 150 ? 'from-orange-500 to-orange-600' : 'from-red-500 to-red-600';
  const aqiBadge = aqi <= 50 ? 'bg-green-50 text-green-700 border-green-200' : aqi <= 100 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : aqi <= 150 ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-red-50 text-red-700 border-red-200';

  const temperature = displayData.currentMetrics?.temperature || 0;
  const tempPercentage = Math.min(((temperature + 10) / 50) * 100, 100);
  const tempAdvice = temperature < 10 ? 'Cold - Wear layers' : temperature < 20 ? 'Cool - Light jacket' : temperature < 30 ? 'Comfortable - Light layers' : 'Hot - Stay hydrated';
  const tempGradient = temperature < 10 ? 'from-blue-500 to-blue-600' : temperature < 20 ? 'from-cyan-500 to-cyan-600' : temperature < 30 ? 'from-green-500 to-green-600' : 'from-orange-500 to-orange-600';
  const tempBadge = temperature < 10 ? 'bg-blue-50 text-blue-700 border-blue-200' : temperature < 20 ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : temperature < 30 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200';

  const precipitation = displayData.currentMetrics?.precipitation || 0;
  const rainChance = precipitation > 0 ? Math.min(precipitation * 10, 100) : 0;
  const rainGradient = precipitation > 5 ? 'from-red-500 to-red-600' : precipitation > 0 ? 'from-teal-500 to-teal-600' : 'from-green-500 to-green-600';
  const rainBadge = precipitation > 5 ? 'bg-red-50 text-red-700 border-red-200' : precipitation > 0 ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-green-50 text-green-700 border-green-200';

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Sparkles className="w-8 h-8 text-purple-600" />
        <h1 className="text-3xl font-bold text-slate-900">Smart Lifestyle Advisory</h1>
      </div>
      <p className="text-slate-600">Real-time situational triggers and personalized recommendations</p>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
        <CitySearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg hover:bg-red-100 transition-all duration-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* UV Protection Gauge */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-3 bg-gradient-to-br ${uvGradient} rounded-lg`}>
              <Sun className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">UV Protection Gauge</h3>
              <p className="text-sm text-slate-600">Sun exposure risk level</p>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Current UV Index</span>
              <span className={`text-2xl font-bold ${uvColor}`}>{uvIndex}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 h-3 rounded-full" style={{ width: `${uvPercentage}%` }}></div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className={`text-sm font-medium ${uvColor}`}>{uvLevel}</p>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${uvBadge}`}>
                {uvIndex <= 2 ? 'No protection needed' : uvIndex <= 5 ? 'Protection recommended' : 'Protection required'}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            {uvIndex === 0 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-slate-700">Perfect conditions! Enjoy the outdoors freely</p>
                </div>
              </div>
            )}
            {uvIndex > 0 && uvIndex <= 2 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-slate-700">Safe to stay outdoors - no protection needed</p>
                </div>
              </div>
            )}
            {uvIndex > 2 && uvIndex <= 5 && (
              <>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <p className="text-sm text-slate-700 font-medium">Apply SPF 30+ sunscreen</p>
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-slate-700">Wear UV-protective sunglasses</p>
                  </div>
                </div>
              </>
            )}
            {uvIndex > 5 && uvIndex <= 7 && (
              <>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <p className="text-sm text-slate-700 font-medium">Apply SPF 50+ sunscreen</p>
                  </div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <p className="text-sm text-slate-700 font-medium">Wear UV-protective sunglasses</p>
                  </div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-slate-700">Limit sun exposure during peak hours</p>
                  </div>
                </div>
              </>
            )}
            {uvIndex > 7 && (
              <>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-slate-700 font-medium">Wear Sunglasses & Sunscreen!</p>
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-slate-700 font-medium">Seek shade during peak hours (10am-4pm)</p>
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-slate-700">Wear protective clothing and hat</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Air Pollution Exposure Warning */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-3 bg-gradient-to-br ${aqiGradient} rounded-lg`}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Air Pollution Warning</h3>
              <p className="text-sm text-slate-600">Air quality health impact</p>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">PM2.5 Level</span>
              <span className={`text-2xl font-bold ${aqiColor}`}>{aqi.toFixed(0)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 h-3 rounded-full" style={{ width: `${aqiPercentage}%` }}></div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className={`text-sm font-medium ${aqiColor}`}>{aqiLevel}</p>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${aqiBadge}`}>
                {aqi <= 50 ? 'Excellent' : aqi <= 100 ? 'Good' : aqi <= 150 ? 'Moderate' : 'Poor'}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            {aqi <= 50 && (
              <>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-slate-700">Air quality is excellent - enjoy outdoor activities!</p>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-slate-700">Windows can remain open for fresh air</p>
                  </div>
                </div>
              </>
            )}
            {aqi > 50 && aqi <= 100 && (
              <>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-slate-700">Safe for outdoor exercise</p>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-slate-700">Windows can remain open</p>
                  </div>
                </div>
              </>
            )}
            {aqi > 100 && aqi <= 150 && (
              <>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <p className="text-sm text-slate-700 font-medium">Sensitive groups should limit outdoor activities</p>
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-slate-700">Healthy individuals can continue normal activities</p>
                  </div>
                </div>
              </>
            )}
            {aqi > 150 && (
              <>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-slate-700 font-medium">Limit outdoor activities!</p>
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-slate-700 font-medium">Keep windows closed</p>
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-slate-700 font-medium">Consider wearing a mask outdoors</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Smart Clothing Advice */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-3 bg-gradient-to-br ${tempGradient} rounded-lg`}>
              <Shirt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Smart Clothing Advice</h3>
              <p className="text-sm text-slate-600">Weather-appropriate attire</p>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Temperature</span>
              <span className="text-2xl font-bold text-slate-900">{temperature.toFixed(1)}°C</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-blue-400 to-orange-400 h-3 rounded-full" style={{ width: `${tempPercentage}%` }}></div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm font-medium text-slate-700">{tempAdvice}</p>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${tempBadge}`}>
                {temperature < 10 ? 'Cold' : temperature < 20 ? 'Cool' : temperature < 30 ? 'Comfortable' : 'Hot'}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            {temperature < 10 && (
              <>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-slate-700 font-medium">Wear a heavy jacket or multiple layers</p>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-slate-700">Keep warm - wear thermal clothing</p>
                  </div>
                </div>
              </>
            )}
            {temperature >= 10 && temperature < 20 && (
              <>
                <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                  <div className="flex items-center space-x-2">
                    <Shirt className="w-4 h-4 text-cyan-600" />
                    <p className="text-sm text-slate-700 font-medium">Wear warm layers</p>
                  </div>
                </div>
                <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-slate-700">Bring a light jacket</p>
                  </div>
                </div>
              </>
            )}
            {temperature >= 20 && temperature < 30 && (
              <>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-slate-700">Light cotton or breathable fabrics</p>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-slate-700">Comfortable walking shoes</p>
                  </div>
                </div>
              </>
            )}
            {temperature >= 30 && (
              <>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <p className="text-sm text-slate-700 font-medium">Light, breathable clothing</p>
                  </div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-slate-700 font-medium">Stay hydrated throughout the day</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Additional Advisory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Precipitation Advisory */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-3 bg-gradient-to-br ${rainGradient} rounded-lg`}>
              <Umbrella className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Precipitation Advisory</h3>
              <p className="text-sm text-slate-600">Rain and weather alerts</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-600">Current Rainfall</p>
              <p className="text-2xl font-bold text-slate-900">{precipitation.toFixed(1)}mm</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Rain Chance</p>
              <p className="text-2xl font-bold text-slate-900">{rainChance.toFixed(0)}%</p>
            </div>
          </div>
          
          <div className="p-4 rounded-lg border">
            {precipitation === 0 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-slate-700 font-medium">No rain expected. Enjoy your day!</p>
                </div>
              </div>
            )}
            {precipitation > 0 && precipitation <= 5 && (
              <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                <div className="flex items-center space-x-2">
                  <Umbrella className="w-4 h-4 text-teal-600" />
                  <p className="text-sm text-slate-700 font-medium">Light rain - carry an umbrella</p>
                </div>
              </div>
            )}
            {precipitation > 5 && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-slate-700 font-medium">Heavy rain - stay indoors!</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${rainBadge}`}>
              {precipitation === 0 ? 'Clear' : precipitation <= 5 ? 'Light Rain' : 'Heavy Rain'}
            </span>
          </div>
        </div>

        {/* Health & Safety Advisory */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Health & Safety</h3>
              <p className="text-sm text-slate-600">Overall wellness recommendations</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-slate-700">Hydration Status</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${temperature > 25 ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                  {temperature > 25 ? 'Stay hydrated' : 'Normal'}
                </span>
              </div>
            </div>
            
            <div className="p-3 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-slate-700">Heat Stress Risk</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${temperature > 30 ? 'bg-red-50 text-red-700 border-red-200' : temperature > 25 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                  {temperature > 30 ? 'High' : temperature > 25 ? 'Moderate' : 'Low'}
                </span>
              </div>
            </div>
            
            <div className="p-3 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-slate-700">Air Quality Impact</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${aqi <= 100 ? 'bg-green-50 text-green-700 border-green-200' : aqi <= 150 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {aqi <= 100 ? 'Low' : aqi <= 150 ? 'Moderate' : 'High'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LifestyleAdvisoryPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <LifestyleAdvisoryContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
