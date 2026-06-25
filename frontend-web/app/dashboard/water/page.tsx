'use client';

import { useState, useEffect } from 'react';
import { Droplets } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import CitySearchBar from '@/components/CitySearchBar';
import WaterTemperatureGaugeChart from '@/components/WaterTemperatureGaugeChart';
import WaterQualityLineChart from '@/components/WaterQualityLineChart';

export default function WaterQualityPage() {
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedWaters, setSavedWaters] = useState<any[]>([]);
  const [cityType, setCityType] = useState<'coastal' | 'inland' | null>(null);
  const [inlandMetrics, setInlandMetrics] = useState<any>(null);

  // Fetch saved history records from our backend server
  const fetchSavedWaters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://eco-platform-backend.onrender.com/api/water-quality/latest', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (response.ok) {
        const result = await response.json();
        setSavedWaters(Array.isArray(result) ? result : result.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch saved waters:', err);
    }
  };

  useEffect(() => {
    fetchSavedWaters();
  }, []);

  const handleSearch = async (city: string) => {
    if (!city.trim()) return;

    try {
      setLoading(true);
      setError('');
      setSearchResult(null);

      const token = localStorage.getItem('token');

      const response = await fetch('https://eco-platform-backend.onrender.com/api/water-quality/search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ city }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // এখানে নিশ্চিত করা হচ্ছে যে measurements বা hourly না থাকলেও কোড ক্র্যাশ করবে না
        const formattedData = {
          city: result.data?.city || city,
          country: result.data?.country || 'Unknown',
          waterQualityLevel: result.data?.waterQualityLevel || 'Good',
          waterTemperature: result.data?.measurements?.waterTemperature ?? 0,
          salinity: result.data?.measurements?.salinity ?? 0,
          waveHeight: result.data?.measurements?.waveHeight ?? 0,
          waveDirection: result.data?.measurements?.waveDirection ?? 0,
          wavePeriod: result.data?.measurements?.wavePeriod ?? 0,
          ph: result.data?.measurements?.ph ?? 7.0,
          turbidity: result.data?.measurements?.turbidity ?? 0,
          dissolvedOxygen: result.data?.measurements?.dissolvedOxygen ?? 0,
          waterScarcityLevel: result.data?.waterScarcityLevel || 'Safe',
          // এখানে কড়া পাহারা: যদি result.hourly বা result.data.hourly না থাকে, তবে খালি অ্যারে [] যাবে
          hourly: Array.isArray(result.hourly) ? result.hourly : (Array.isArray(result.data?.hourly) ? result.data.hourly : [])
        };

        setSearchResult(formattedData);
        setCityType(result.cityType || 'coastal');
        setInlandMetrics(result.inlandMetrics || null);
        await fetchSavedWaters();
      } else {
        setError(result.message || 'Failed to fetch water quality data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const getWaterQualityColor = (level: string) => {
    switch (level) {
      case 'Excellent': return 'bg-green-500';
      case 'Good': return 'bg-blue-500';
      case 'Fair': return 'bg-yellow-500';
      case 'Poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getWaterScarcityColor = (level: string) => {
    switch (level) {
      case 'Safe': return 'bg-green-500';
      case 'Moderate Risk': return 'bg-yellow-500';
      case 'Critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateWQI = (ph: number, turbidity: number): string => {
    // Water Quality Index calculation based on pH and turbidity
    // pH: 6.5-8.5 is safe, turbidity: <5 NTU is safe
    const phScore = ph >= 6.5 && ph <= 8.5 ? 100 : ph >= 6 && ph <= 9 ? 70 : 40;
    const turbidityScore = turbidity < 5 ? 100 : turbidity < 10 ? 70 : 40;
    const wqi = (phScore + turbidityScore) / 2;
    
    if (wqi >= 85) return 'Potable';
    if (wqi >= 60) return 'Usable for Household';
    return 'Highly Contaminated';
  };

  const getWQIColor = (wqi: string) => {
    switch (wqi) {
      case 'Potable': return 'bg-green-500';
      case 'Usable for Household': return 'bg-blue-500';
      case 'Highly Contaminated': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6 overflow-y-auto">
          <div className="flex items-center space-x-3">
            <Droplets className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Water Quality</h1>
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
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{searchResult.city}</h2>
                    <p className="text-gray-600">{searchResult.country}</p>
                  </div>
                  <div className="flex gap-2">
                    <div className={`px-4 py-2 rounded-full text-white font-medium ${getWaterQualityColor(searchResult.waterQualityLevel)}`}>
                      {searchResult.waterQualityLevel}
                    </div>
                    <div className={`px-4 py-2 rounded-full text-white font-medium ${getWaterScarcityColor(searchResult.waterScarcityLevel)}`}>
                      {searchResult.waterScarcityLevel}
                    </div>
                  </div>
                </div>

                {/* Top Metrics Grid - 4 Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-gray-600 mb-1">Water Temperature</p>
                    <p className="text-3xl font-bold text-gray-900">{searchResult.waterTemperature.toFixed(1)}°C</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                    <p className="text-sm text-gray-600 mb-1">pH Level</p>
                    <p className="text-3xl font-bold text-gray-900">{searchResult.ph.toFixed(2)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-100">
                    <p className="text-sm text-gray-600 mb-1">Turbidity</p>
                    <p className="text-3xl font-bold text-gray-900">{searchResult.turbidity.toFixed(1)} NTU</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100">
                    <p className="text-sm text-gray-600 mb-1">Dissolved Oxygen</p>
                    <p className="text-3xl font-bold text-gray-900">{searchResult.dissolvedOxygen.toFixed(1)} mg/L</p>
                  </div>
                </div>

                {/* Water Quality Index Gauge */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Water Quality Index (WQI)</h3>
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className={`px-8 py-4 rounded-full text-white font-bold text-xl ${getWQIColor(calculateWQI(searchResult.ph, searchResult.turbidity))}`}>
                        {calculateWQI(searchResult.ph, searchResult.turbidity)}
                      </div>
                      <p className="text-center text-sm text-gray-600 mt-2">Based on pH and Turbidity levels</p>
                    </div>
                  </div>
                </div>

                {/* Custom Component Charts Integration */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gauge Chart UI */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Water Temperature</h3>
                    <WaterTemperatureGaugeChart waterTemperature={searchResult.waterTemperature} />
                  </div>

                  {/* Detailed Metrics Sub-Grid - Dynamic based on city type */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {cityType === 'inland' ? 'Inland Water Conditions' : 'Current Marine Conditions'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {cityType === 'inland' ? (
                        <>
                          {/* Inland City Metrics */}
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600">Soil Moisture</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {inlandMetrics?.soilMoisture !== null ? inlandMetrics.soilMoisture.toFixed(1) : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">%</p>
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600">Recent Precipitation</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {inlandMetrics?.precipitation !== null ? inlandMetrics.precipitation.toFixed(2) : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">mm</p>
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600">Groundwater Health Index</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {inlandMetrics?.groundwaterHealthIndex !== null ? inlandMetrics.groundwaterHealthIndex.toFixed(1) : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">score</p>
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600">Water Availability</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {inlandMetrics?.groundwaterHealthIndex !== null 
                                ? (inlandMetrics.groundwaterHealthIndex >= 70 ? 'Good' 
                                  : inlandMetrics.groundwaterHealthIndex >= 40 ? 'Moderate' 
                                  : 'Low')
                                : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">status</p>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Coastal City Metrics - Conditional Rendering */}
                          {searchResult.salinity > 0 && (
                            <div className="bg-white rounded-lg p-4">
                              <p className="text-sm text-gray-600">Salinity</p>
                              <p className="text-2xl font-bold text-gray-900">{searchResult.salinity.toFixed(1)}</p>
                              <p className="text-xs text-gray-500">psu</p>
                            </div>
                          )}
                          {searchResult.waveHeight > 0 && (
                            <div className="bg-white rounded-lg p-4">
                              <p className="text-sm text-gray-600">Wave Height</p>
                              <p className="text-2xl font-bold text-gray-900">{searchResult.waveHeight.toFixed(2)}</p>
                              <p className="text-xs text-gray-500">meters</p>
                            </div>
                          )}
                          {searchResult.waveDirection > 0 && (
                            <div className="bg-white rounded-lg p-4">
                              <p className="text-sm text-gray-600">Wave Direction</p>
                              <p className="text-2xl font-bold text-gray-900">{searchResult.waveDirection.toFixed(0)}</p>
                              <p className="text-xs text-gray-500">degrees</p>
                            </div>
                          )}
                          {searchResult.wavePeriod > 0 && (
                            <div className="bg-white rounded-lg p-4">
                              <p className="text-sm text-gray-600">Wave Period</p>
                              <p className="text-2xl font-bold text-gray-900">{searchResult.wavePeriod.toFixed(1)}</p>
                              <p className="text-xs text-gray-500">seconds</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* চার্ট রেন্ডার করার আগে ট্রিপল চেক: অ্যারেতে ডেটা থাকলেই শুধু চার্ট দেখাবে */}
                {searchResult.hourly && Array.isArray(searchResult.hourly) && searchResult.hourly.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">24-Hour Water Quality Trend</h3>
                    <WaterQualityLineChart hourlyData={searchResult.hourly} />
                  </div>
                )}

                {/* Search History Layout Section */}
                <div className="mt-8 mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Search History / Saved Waters</h3>
                </div>

                {savedWaters && savedWaters.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedWaters.map((water) => (
                      <div key={water._id || Math.random()} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-800">{water.city}</h4>
                            <p className="text-sm text-gray-600">{water.country}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900">
                              {water.measurements?.waterTemperature?.toFixed(1) || 'N/A'}°C
                            </p>
                            <p className="text-xs text-gray-600">Temp</p>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-between text-xs text-gray-500">
                          <span>
                            {water.measurements?.waveHeight === 0 || water.measurements?.waveHeight === null
                              ? `Soil Moisture: ${water.measurements?.salinity?.toFixed(1) || 'N/A'}%`
                              : `Salinity: ${water.measurements?.salinity?.toFixed(1) || 'N/A'} psu`}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-white text-[10px] font-bold ${getWaterQualityColor(water.waterQualityLevel)}`}>
                            {water.waterQualityLevel || 'Good'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Saved: {water.timestamp ? new Date(water.timestamp).toLocaleString() : new Date().toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No history yet. Search for a location area above to save it!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Initial State Component View */}
          {!searchResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                <Droplets className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Water Temperature</h3>
                <p className="text-sm text-gray-600">Real-time water temperature data for both coastal marine and inland freshwater systems.</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <Droplets className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Adaptive Metrics</h3>
                <p className="text-sm text-gray-600">Dynamic data display: ocean salinity & waves for coastal cities, soil moisture & groundwater for inland cities.</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                <Droplets className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Water Quality Index</h3>
                <p className="text-sm text-gray-600">Comprehensive water health assessment based on location-specific environmental factors.</p>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
