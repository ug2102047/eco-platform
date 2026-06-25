'use client';

import { useState } from 'react';
import { Shield, AlertTriangle, Droplets } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import CitySearchBar from '@/components/CitySearchBar';

function RiskMatrixContent() {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [waterData, setWaterData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (city: string) => {
    try {
      setLoading(true);
      setError('');
      setWeatherData(null);
      setWaterData(null);

      const token = localStorage.getItem('token');

      // Fetch weather data
      const weatherResponse = await fetch('https://eco-platform-backend.onrender.com/api/weather/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ city })
      });

      const weatherResult = await weatherResponse.json();

      if (weatherResult.success) {
        setWeatherData(weatherResult.data);
      } else {
        setError(weatherResult.message || 'Failed to fetch weather data');
        return;
      }

      // Fetch water data for soil moisture
      const waterResponse = await fetch('https://eco-platform-backend.onrender.com/api/water-quality/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ city })
      });

      const waterResult = await waterResponse.json();

      if (waterResult.success) {
        setWaterData(waterResult);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  // Calculate dynamic risk scores
  const calculateHeatwaveRisk = () => {
    const temp = weatherData?.currentMetrics?.temperature || 0;
    
    // Under 25°C = 10%
    if (temp < 25) {
      return 10;
    }
    // 25°C to 32°C = 40-50% (linear interpolation)
    else if (temp >= 25 && temp <= 32) {
      const minRisk = 40;
      const maxRisk = 50;
      const progress = (temp - 25) / (32 - 25);
      return Math.round(minRisk + (progress * (maxRisk - minRisk)));
    }
    // Above 32°C to 35°C = 50-80% (linear interpolation)
    else if (temp > 32 && temp <= 35) {
      const minRisk = 50;
      const maxRisk = 80;
      const progress = (temp - 32) / (35 - 32);
      return Math.round(minRisk + (progress * (maxRisk - minRisk)));
    }
    // Above 35°C = 80-95% (scaling up to critical)
    else {
      const minRisk = 80;
      const maxRisk = 95;
      const maxTemp = 45;
      const progress = Math.min((temp - 35) / (maxTemp - 35), 1);
      return Math.round(minRisk + (progress * (maxRisk - minRisk)));
    }
  };

  const calculateFloodingRisk = () => {
    const precipitation = weatherData?.currentMetrics?.precipitation || 0;
    
    // 0mm = 5%
    if (precipitation === 0) {
      return 5;
    }
    // 0mm to 5mm = 5-20% (light rain)
    else if (precipitation > 0 && precipitation <= 5) {
      const minRisk = 5;
      const maxRisk = 20;
      const progress = precipitation / 5;
      return Math.round(minRisk + (progress * (maxRisk - minRisk)));
    }
    // 5mm to 20mm = 20-60% (moderate rain)
    else if (precipitation > 5 && precipitation <= 20) {
      const minRisk = 20;
      const maxRisk = 60;
      const progress = (precipitation - 5) / (20 - 5);
      return Math.round(minRisk + (progress * (maxRisk - minRisk)));
    }
    // 20mm to 50mm = 60-85% (heavy rain)
    else if (precipitation > 20 && precipitation <= 50) {
      const minRisk = 60;
      const maxRisk = 85;
      const progress = (precipitation - 20) / (50 - 20);
      return Math.round(minRisk + (progress * (maxRisk - minRisk)));
    }
    // Above 50mm = 85-95% (extreme rain)
    else {
      const minRisk = 85;
      const maxRisk = 95;
      const maxRain = 100;
      const progress = Math.min((precipitation - 50) / (maxRain - 50), 1);
      return Math.round(minRisk + (progress * (maxRisk - minRisk)));
    }
  };

  const calculateGroundwaterRisk = () => {
    // Use soil moisture from water data if available (inland cities)
    const soilMoisture = waterData?.inlandMetrics?.soilMoisture || 50;
    // Higher risk when soil moisture is low (depletion)
    const risk = Math.max(100 - soilMoisture, 0);
    return Math.round(risk);
  };

  const heatwaveRisk = calculateHeatwaveRisk();
  const floodingRisk = calculateFloodingRisk();
  const groundwaterRisk = calculateGroundwaterRisk();

  // Dynamic gauge color functions
  const getGaugeColor = (risk: number) => {
    if (risk >= 70) return '#ef4444'; // red
    if (risk >= 40) return '#f59e0b'; // amber/orange
    return '#22c55e'; // green
  };

  const getStatusColor = (risk: number) => {
    if (risk >= 70) return 'text-red-600';
    if (risk >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const heatwaveStatus = heatwaveRisk >= 70 ? 'Critical' : heatwaveRisk >= 40 ? 'Elevated' : 'Normal';
  const heatwaveColor = getStatusColor(heatwaveRisk);
  const heatwaveGaugeColor = getGaugeColor(heatwaveRisk);

  const floodingStatus = floodingRisk >= 70 ? 'Critical' : floodingRisk >= 40 ? 'Moderate' : 'Low';
  const floodingColor = getStatusColor(floodingRisk);
  const floodingGaugeColor = getGaugeColor(floodingRisk);

  const groundwaterStatus = groundwaterRisk >= 70 ? 'Critical' : groundwaterRisk >= 40 ? 'Moderate' : 'Stable';
  const groundwaterColor = getStatusColor(groundwaterRisk);
  const groundwaterGaugeColor = getGaugeColor(groundwaterRisk);

  const overallRisk = Math.round((heatwaveRisk + floodingRisk + groundwaterRisk) / 3);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Risk & Vulnerability Matrix</h1>
        <p className="text-gray-600">Environmental risk assessment and vulnerability indicators</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <CitySearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Heatwave Susceptibility Gauge */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Heatwave Susceptibility</h3>
              <p className="text-sm text-gray-600">Temperature stress risk</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center py-8">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={heatwaveGaugeColor}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray="440"
                  strokeDashoffset={440 - (440 * heatwaveRisk / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{heatwaveRisk}%</span>
                <span className={`text-sm ${heatwaveColor}`}>{heatwaveStatus}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Status</span>
              <span className={`font-medium ${heatwaveColor}`}>{heatwaveStatus}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Temperature</span>
              <span className="font-medium text-gray-900">{weatherData?.currentMetrics?.temperature?.toFixed(1) || 'N/A'}°C</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Baseline Threshold</span>
              <span className="font-medium text-gray-900">30°C</span>
            </div>
          </div>
        </div>

        {/* Urban Flooding Risk Gauge */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Droplets className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Urban Flooding Risk</h3>
              <p className="text-sm text-gray-600">Precipitation and drainage capacity</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center py-8">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={floodingGaugeColor}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray="440"
                  strokeDashoffset={440 - (440 * floodingRisk / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{floodingRisk}%</span>
                <span className={`text-sm ${floodingColor}`}>{floodingStatus}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Status</span>
              <span className={`font-medium ${floodingColor}`}>{floodingStatus}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Rainfall</span>
              <span className="font-medium text-gray-900">{weatherData?.currentMetrics?.precipitation?.toFixed(1) || 'N/A'}mm</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Risk Threshold</span>
              <span className="font-medium text-gray-900">50mm</span>
            </div>
          </div>
        </div>

        {/* Groundwater Depletion Indicator Gauge */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Groundwater Depletion</h3>
              <p className="text-sm text-gray-600">Water table sustainability</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center py-8">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={groundwaterGaugeColor}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray="440"
                  strokeDashoffset={440 - (440 * groundwaterRisk / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{groundwaterRisk}%</span>
                <span className={`text-sm ${groundwaterColor}`}>{groundwaterStatus}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Status</span>
              <span className={`font-medium ${groundwaterColor}`}>{groundwaterStatus}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Soil Moisture</span>
              <span className="font-medium text-gray-900">{waterData?.inlandMetrics?.soilMoisture?.toFixed(1) || 'N/A'}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Groundwater Health</span>
              <span className="font-medium text-gray-900">{waterData?.inlandMetrics?.groundwaterHealthIndex?.toFixed(1) || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Risk Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Overall Risk Assessment</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-sm text-gray-600 mb-1">Critical Risks</p>
            <p className="text-2xl font-bold text-red-600">
              {[heatwaveRisk, floodingRisk, groundwaterRisk].filter(r => r >= 70).length}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-gray-600 mb-1">Moderate Risks</p>
            <p className="text-2xl font-bold text-yellow-600">
              {[heatwaveRisk, floodingRisk, groundwaterRisk].filter(r => r >= 40 && r < 70).length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Low Risks</p>
            <p className="text-2xl font-bold text-green-600">
              {[heatwaveRisk, floodingRisk, groundwaterRisk].filter(r => r < 40).length}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Overall Score</p>
            <p className="text-2xl font-bold text-blue-600">{overallRisk}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RiskMatrixPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <RiskMatrixContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
