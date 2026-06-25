'use client';

import { useState } from 'react';
import { Cloud, TrendingUp } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import CitySearchBar from '@/components/CitySearchBar';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function ClimateStripesContent() {
  const [showPrediction, setShowPrediction] = useState(false);
  const [historicalData, setHistoricalData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState('');
  const [trendLineData, setTrendLineData] = useState<any[]>([]);
  const [predictedIncrease, setPredictedIncrease] = useState(0);
  const [apiStatistics, setApiStatistics] = useState<any>(null);

  const handleSearch = async (city: string) => {
    try {
      setLoading(true);
      setError('');
      setHistoricalData(null);
      setTrendLineData([]);
      setPredictedIncrease(0);
      setShowPrediction(false);
      setPredictionError('');
      setApiStatistics(null);

      const token = localStorage.getItem('token');
      const response = await fetch('https://eco-platform-d71a.onrender.com/api/weather/historical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ city })
      });

      const result = await response.json();

      if (result.success) {
        setHistoricalData(result.data);
      } else {
        setError(result.message || 'Failed to fetch historical data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const handlePredictTrend = async () => {
    console.log('handlePredictTrend called, historicalData:', historicalData);
    if (!historicalData || !historicalData.historicalData) {
      console.log('Early return: missing historicalData');
      return;
    }

    try {
      setPredictionLoading(true);
      setPredictionError('');

      const historical = historicalData.historicalData;

      // Format data for Python API: [{year, avgTemp}, ...]
      const formattedData = historical.map((item: any) => ({
        year: item.year,
        avgTemp: item.avgTemp
      }));

      console.log('Sending to Python API:', formattedData);

      // Call Python ML backend
      const response = await fetch('http://localhost:8000/api/analytics/predict-climate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          historicalData: formattedData
        })
      });

      const result = await response.json();
      console.log('Received from Python API:', result);

      if (result.success) {
        // Validate that statistics exist and have required fields
        if (!result.statistics || typeof result.statistics.warmingBy2050 === 'undefined') {
          console.error('Invalid response from Python API - missing statistics:', result);
          setPredictionError('Invalid response from prediction service - missing warming data');
          return;
        }

        // Set prediction data from Python API
        const predictionData = result.predictionData.map((item: any) => ({
          year: item.year,
          temperature: item.avgTemp,
          isPrediction: true
        }));

        console.log('Setting predictedIncrease to:', result.statistics.warmingBy2050);
        console.log('Setting apiStatistics to:', result.statistics);

        setTrendLineData(predictionData);
        setPredictedIncrease(result.statistics.warmingBy2050);
        console.log('State updated to:', result.statistics.warmingBy2050);
        setApiStatistics(result.statistics);
        setShowPrediction(true);
      } else {
        console.error('Python API returned error:', result.message);
        setPredictionError(result.message || 'Failed to generate predictions');
      }
    } catch (err: any) {
      console.error('Error in handlePredictTrend:', err);
      setPredictionError(err.message || 'Failed to connect to prediction service');
    } finally {
      setPredictionLoading(false);
    }
  };

  const displayData = historicalData || {
    historicalData: [],
    predictionData: [],
    statistics: {
      averageTemperature: 0,
      trendDirection: 'Unknown',
      yearlyChange: 0,
      prediction2050: 0,
      warmingBy2050: 0
    }
  };

  // Merge historical data with prediction data for the chart
  const historicalChartData = displayData.historicalData.map((item: any) => ({
    year: item.year,
    temperature: item.avgTemp,
    isPrediction: false
  }));

  const chartData = showPrediction && trendLineData.length > 0
    ? [...historicalChartData, ...trendLineData]
    : historicalChartData;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Climate Stripes</h1>
        <p className="text-gray-600">Multi-year temperature comparison and trend analysis</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Cloud className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Historical Temperature Data</h2>
          </div>
          <button
            onClick={handlePredictTrend}
            disabled={!historicalData || predictionLoading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              historicalData && !predictionLoading
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{predictionLoading ? 'Predicting...' : 'Predict 2050 Trend'}</span>
          </button>
        </div>

        <div className="mb-6">
          <CitySearchBar onSearch={handleSearch} loading={loading} />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {predictionError && (
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-orange-700 text-sm">{predictionError}</p>
          </div>
        )}

        {chartData.length > 0 ? (
          <div>
            {showPrediction && predictedIncrease > 0 && (
              <div className={`mb-4 p-4 rounded-lg border ${
                predictedIncrease > 2 
                  ? 'bg-red-50 border-red-200' 
                  : predictedIncrease > 1 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <TrendingUp className={`w-5 h-5 ${
                    predictedIncrease > 2 
                      ? 'text-red-600' 
                      : predictedIncrease > 1 
                      ? 'text-orange-600' 
                      : 'text-yellow-600'
                  }`} />
                  <p className={`font-semibold ${
                    predictedIncrease > 2 
                      ? 'text-red-700' 
                      : predictedIncrease > 1 
                      ? 'text-orange-700' 
                      : 'text-yellow-700'
                  }`}>
                    Predicted Temperature Trend by 2050: +{predictedIncrease.toFixed(2)}°C Increase
                  </p>
                </div>
                <p className={`text-sm mt-1 ${
                  predictedIncrease > 2 
                    ? 'text-red-600' 
                    : predictedIncrease > 1 
                    ? 'text-orange-600' 
                    : 'text-yellow-600'
                }`}>
                  {predictedIncrease > 2 
                    ? '⚠️ Critical: Significant warming projected' 
                    : predictedIncrease > 1 
                    ? '⚠️ Warning: Moderate warming projected' 
                    : '⚠️ Caution: Mild warming projected'}
                </p>
              </div>
            )}
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="year" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value: any) => value.toString()}
                  />
                  <YAxis 
                    label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: any, name: any) => {
                      if (name === '2050 Prediction') {
                        return [`${Number(value).toFixed(2)}°C (Predicted)`, name];
                      }
                      return [`${Number(value).toFixed(2)}°C`, name];
                    }}
                    labelFormatter={(value: any) => `Year: ${value}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="temperature" 
                    fill="#3b82f6"
                    name="Historical Temperature"
                  />
                  {showPrediction && trendLineData.length > 0 && (
                    <Line 
                      type="monotone"
                      dataKey="temperature"
                      stroke="#ef4444"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="2050 Prediction"
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <div className="text-center">
              <Cloud className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Search a city to view historical temperature data</p>
              <p className="text-gray-500 text-sm mt-2">30 years of data from 1996 to 2025</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Average Temperature</h3>
          <p className="text-3xl font-bold text-gray-900">
            {apiStatistics ? apiStatistics.averageTemperature.toFixed(1) : displayData.statistics.averageTemperature.toFixed(1)}°C
          </p>
          <p className="text-sm text-gray-600 mt-1">Historical average</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Trend Direction</h3>
          <p className={`text-3xl font-bold ${(apiStatistics ? apiStatistics.trendDirection : displayData.statistics.trendDirection) === 'Rising' ? 'text-red-600' : 'text-blue-600'}`}>
            {apiStatistics ? apiStatistics.trendDirection : displayData.statistics.trendDirection}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {apiStatistics ? apiStatistics.yearlyChange.toFixed(2) : displayData.statistics.yearlyChange.toFixed(2)}°C per decade
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">2050 Projection</h3>
          <p className="text-3xl font-bold text-orange-600">
            {predictedIncrease.toFixed(2)}°C
          </p>
          <p className="text-sm text-gray-600 mt-1">Warming from baseline</p>
        </div>
      </div>
    </div>
  );
}

export default function ClimateStripesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ClimateStripesContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
