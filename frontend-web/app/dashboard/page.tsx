'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, MapPin, ShieldCheck } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { airQualityAPI } from '@/lib/api';

interface AirQualityData {
  _id: string;
  city: string;
  country: string;
  measurements: {
    pm25: number | null;
    pm10: number | null;
    co: number | null;
    no2: number | null;
    o3: number | null;
    so2: number | null;
  };
  aqi: number | null;
  aqiLevel: string | null;
  timestamp: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [airQualityData, setAirQualityData] = useState<AirQualityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchAirQualityData();
    }
  }, [user]);

  const fetchAirQualityData = async () => {
    try {
      setLoading(true);
      const response = await airQualityAPI.getLatest();
      setAirQualityData(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch air quality data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getAQIColor = (aqi: number | null) => {
    if (!aqi) return 'bg-gray-200';
    if (aqi <= 50) return 'bg-green-500';
    if (aqi <= 100) return 'bg-yellow-500';
    if (aqi <= 150) return 'bg-orange-500';
    if (aqi <= 200) return 'bg-red-500';
    if (aqi <= 300) return 'bg-purple-500';
    return 'bg-maroon-700';
  };

  const getMetricColor = (value: number | null, type: string) => {
    if (!value) return 'bg-gray-300';
    if (type === 'pm25') {
      if (value <= 12) return 'bg-green-500';
      if (value <= 35.4) return 'bg-yellow-500';
      if (value <= 55.4) return 'bg-orange-500';
      if (value <= 150.4) return 'bg-red-500';
      return 'bg-purple-500';
    }
    if (type === 'pm10') {
      if (value <= 54) return 'bg-green-500';
      if (value <= 154) return 'bg-yellow-500';
      if (value <= 254) return 'bg-orange-500';
      if (value <= 354) return 'bg-red-500';
      return 'bg-purple-500';
    }
    if (type === 'co') {
      if (value <= 4.4) return 'bg-green-500';
      if (value <= 9.4) return 'bg-yellow-500';
      if (value <= 12.4) return 'bg-orange-500';
      if (value <= 15.4) return 'bg-red-500';
      return 'bg-purple-500';
    }
    if (type === 'no2') {
      if (value <= 53) return 'bg-green-500';
      if (value <= 100) return 'bg-yellow-500';
      if (value <= 360) return 'bg-orange-500';
      if (value <= 649) return 'bg-red-500';
      return 'bg-purple-500';
    }
    if (type === 'o3') {
      if (value <= 54) return 'bg-green-500';
      if (value <= 70) return 'bg-yellow-500';
      if (value <= 85) return 'bg-orange-500';
      if (value <= 105) return 'bg-red-500';
      return 'bg-purple-500';
    }
    return 'bg-gray-300';
  };

  const getMetricProgress = (value: number | null, type: string) => {
    if (!value) return 0;
    if (type === 'pm25') return Math.min((value / 150) * 100, 100);
    if (type === 'pm10') return Math.min((value / 354) * 100, 100);
    if (type === 'co') return Math.min((value / 15) * 100, 100);
    if (type === 'no2') return Math.min((value / 649) * 100, 100);
    if (type === 'o3') return Math.min((value / 105) * 100, 100);
    return 0;
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={fetchAirQualityData}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Refresh Data
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Top Row: Summary Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Carbon Footprint */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500 rounded-lg">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">Eco Metric</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Your Carbon Footprint</h3>
              <p className="text-3xl font-bold text-gray-900">320 kg CO₂</p>
              <p className="text-xs text-gray-500 mt-2">Monthly estimate</p>
            </div>

            {/* Card 2: Regional AQI Status */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Monitoring</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Monitored Cities</h3>
              <p className="text-3xl font-bold text-gray-900">6 Regions Active</p>
              <p className="text-xs text-gray-500 mt-2">Real-time AQI tracking</p>
            </div>

            {/* Card 3: Disaster Alerts */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl shadow-sm border border-emerald-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-500 rounded-lg">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">Safety</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Active Climate Threats</h3>
              <p className="text-3xl font-bold text-gray-900">0 Active Alerts</p>
              <p className="text-xs text-gray-500 mt-2">All systems normal</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Loading air quality data...</p>
            </div>
          ) : airQualityData.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-600">No air quality data available. Run the Python script to fetch data from Open-Meteo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {airQualityData.slice(0, 3).map((data) => (
                <div key={data._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className={`h-2 ${getAQIColor(data.aqi)}`}></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{data.city}</h3>
                        <p className="text-sm text-gray-600">{data.country}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-800">{data.aqi ? Math.round(data.aqi) : 'N/A'}</p>
                        <p className="text-xs text-gray-600">AQI</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        data.aqiLevel === 'Good' ? 'bg-green-100 text-green-800' :
                        data.aqiLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                        data.aqiLevel === 'Unhealthy for Sensitive Groups' ? 'bg-orange-100 text-orange-800' :
                        data.aqiLevel === 'Unhealthy' ? 'bg-red-100 text-red-800' :
                        data.aqiLevel === 'Very Unhealthy' ? 'bg-purple-100 text-purple-800' :
                        data.aqiLevel === 'Hazardous' ? 'bg-red-900 text-white' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {data.aqiLevel || 'Unknown'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600 font-medium">PM2.5</span>
                          <span className="font-bold text-slate-900">{data.measurements.pm25 ? data.measurements.pm25.toFixed(1) : 'N/A'} µg/m³</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getMetricColor(data.measurements.pm25, 'pm25')} transition-all duration-300`}
                            style={{ width: `${getMetricProgress(data.measurements.pm25, 'pm25')}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600 font-medium">PM10</span>
                          <span className="font-bold text-slate-900">{data.measurements.pm10 ? data.measurements.pm10.toFixed(1) : 'N/A'} µg/m³</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getMetricColor(data.measurements.pm10, 'pm10')} transition-all duration-300`}
                            style={{ width: `${getMetricProgress(data.measurements.pm10, 'pm10')}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600 font-medium">CO</span>
                          <span className="font-bold text-slate-900">{data.measurements.co ? data.measurements.co.toFixed(2) : 'N/A'} mg/m³</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getMetricColor(data.measurements.co, 'co')} transition-all duration-300`}
                            style={{ width: `${getMetricProgress(data.measurements.co, 'co')}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600 font-medium">NO2</span>
                          <span className="font-bold text-slate-900">{data.measurements.no2 ? data.measurements.no2.toFixed(1) : 'N/A'} µg/m³</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getMetricColor(data.measurements.no2, 'no2')} transition-all duration-300`}
                            style={{ width: `${getMetricProgress(data.measurements.no2, 'no2')}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600 font-medium">O3</span>
                          <span className="font-bold text-slate-900">{data.measurements.o3 ? data.measurements.o3.toFixed(1) : 'N/A'} µg/m³</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getMetricColor(data.measurements.o3, 'o3')} transition-all duration-300`}
                            style={{ width: `${getMetricProgress(data.measurements.o3, 'o3')}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Updated: {new Date(data.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Row: Climate Preview & Eco-Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Climate Trend Preview */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Climate Trend Preview</h3>
                <div className="p-2 bg-slate-200 rounded-lg">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Temperature Trend</p>
                    <p className="text-xs text-gray-500">Last 30 days</p>
                  </div>
                  <span className="text-sm font-bold text-orange-600">+1.2°C</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                  <div>
                    <p className="text-sm font-medium text-gray-700">CO2 Levels</p>
                    <p className="text-xs text-gray-500">Regional average</p>
                  </div>
                  <span className="text-sm font-bold text-red-600">415 ppm</span>
                </div>
              </div>
            </div>

            {/* Right Column: Actionable Eco-Tips */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Actionable Eco-Tips</h3>
                <div className="p-2 bg-green-500 rounded-lg">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                  <div className="p-1.5 bg-green-100 rounded-full mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Switch to LED bulbs</p>
                    <p className="text-xs text-gray-600">Save up to 80% energy on lighting</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                  <div className="p-1.5 bg-green-100 rounded-full mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Reduce meat consumption</p>
                    <p className="text-xs text-gray-600">Cut carbon footprint by 50% per meal</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                  <div className="p-1.5 bg-green-100 rounded-full mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Use public transport</p>
                    <p className="text-xs text-gray-600">Reduce emissions by 2.6kg per trip</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
