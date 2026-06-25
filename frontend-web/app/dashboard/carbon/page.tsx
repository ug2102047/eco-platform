'use client';

import { useState, useEffect } from 'react';
import { Calculator, Leaf, Zap, Car, Bus, Utensils, Download } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { calculateCarbonFootprint, getCarbonHistory, CarbonData } from '@/lib/carbonApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function CarbonPage() {
  const [formData, setFormData] = useState({
    electricityKwh: 0,
    carKm: 0,
    publicTransportKm: 0,
    dietType: 'balanced' as 'heavy-meat' | 'balanced' | 'vegetarian'
  });
  const [result, setResult] = useState<CarbonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<CarbonData[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  // Prevent hydration mismatch by only rendering history after client-side mount
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getCarbonHistory(5);
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleCalculate = async () => {
    try {
      setLoading(true);
      setError('');
      setResult(null);

      const data = await calculateCarbonFootprint(formData);
      setResult(data);
      await fetchHistory();
    } catch (err: any) {
      setError(err.message || 'Failed to calculate carbon footprint');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    window.print();
  };

  const getCarbonLevel = (footprint: number) => {
    if (footprint < 200) return { level: 'Low', color: 'bg-green-500', textColor: 'text-green-600' };
    if (footprint < 400) return { level: 'Average', color: 'bg-orange-500', textColor: 'text-orange-600' };
    return { level: 'High', color: 'bg-red-500', textColor: 'text-red-600' };
  };

  const getRecommendations = (breakdown: CarbonData['breakdown']) => {
    const maxEmission = Math.max(
      breakdown.electricity,
      breakdown.car,
      breakdown.publicTransport,
      breakdown.diet
    );

    if (maxEmission === breakdown.electricity) {
      return [
        'Switch to LED bulbs to reduce energy consumption',
        'Consider using energy-efficient appliances',
        'Unplug devices when not in use to save standby power'
      ];
    } else if (maxEmission === breakdown.car) {
      return [
        'Try carpooling or using public transport more often',
        'Consider switching to an electric or hybrid vehicle',
        'Combine trips to reduce total mileage'
      ];
    } else if (maxEmission === breakdown.diet) {
      return [
        'Consider incorporating more plant-based meals',
        'Reduce meat consumption to a few times per week',
        'Choose locally sourced food to reduce transportation emissions'
      ];
    } else {
      return [
        'Great job on using public transport!',
        'Continue optimizing your travel patterns',
        'Consider walking or cycling for short distances'
      ];
    }
  };

  const chartData = result ? [
    { name: 'Electricity', value: result.breakdown.electricity, color: '#3b82f6' },
    { name: 'Car', value: result.breakdown.car, color: '#ef4444' },
    { name: 'Public Transport', value: result.breakdown.publicTransport, color: '#22c55e' },
    { name: 'Diet', value: result.breakdown.diet, color: '#f59e0b' }
  ] : [];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <style>{`
          @media print {
            @page {
              size: A4;
              margin: 20mm;
            }
            
            body * {
              visibility: hidden;
            }
            
            .print-only, .print-only * {
              visibility: visible;
            }
            
            .print-only {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white;
            }
          }
        `}</style>
        <div className="space-y-6 overflow-y-auto">
          <div className="flex items-center space-x-3">
            <Calculator className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Carbon Calculator</h1>
          </div>

          {/* Input Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Calculate Your Carbon Footprint</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Electricity */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center space-x-2 mb-3">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <label className="font-medium text-gray-700">Monthly Electricity Usage</label>
                </div>
                <input
                  type="number"
                  value={formData.electricityKwh === 0 ? '' : formData.electricityKwh}
                  onChange={(e) => setFormData({ ...formData, electricityKwh: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                  placeholder="Enter kWh"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">Average: 300-500 kWh/month</p>
              </div>

              {/* Car Mileage */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-100">
                <div className="flex items-center space-x-2 mb-3">
                  <Car className="w-5 h-5 text-red-600" />
                  <label className="font-medium text-gray-700">Weekly Car Mileage</label>
                </div>
                <input
                  type="number"
                  value={formData.carKm === 0 ? '' : formData.carKm}
                  onChange={(e) => setFormData({ ...formData, carKm: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                  placeholder="Enter kilometers"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">Average: 100-300 km/week</p>
              </div>

              {/* Public Transport */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center space-x-2 mb-3">
                  <Bus className="w-5 h-5 text-green-600" />
                  <label className="font-medium text-gray-700">Weekly Public Transport</label>
                </div>
                <input
                  type="number"
                  value={formData.publicTransportKm === 0 ? '' : formData.publicTransportKm}
                  onChange={(e) => setFormData({ ...formData, publicTransportKm: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                  placeholder="Enter kilometers"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">Average: 50-150 km/week</p>
              </div>

              {/* Diet Type */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-100">
                <div className="flex items-center space-x-2 mb-3">
                  <Utensils className="w-5 h-5 text-amber-600" />
                  <label className="font-medium text-gray-700">Diet Habits</label>
                </div>
                <select
                  value={formData.dietType}
                  onChange={(e) => setFormData({ ...formData, dietType: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="heavy-meat" className="text-gray-900 bg-white">Heavy Meat Eater</option>
                  <option value="balanced" className="text-gray-900 bg-white">Balanced Diet</option>
                  <option value="vegetarian" className="text-gray-900 bg-white">Vegetarian</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Choose your primary diet pattern</p>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading}
              className="mt-6 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  <span>Calculate My Footprint</span>
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Results Section */}
          {result && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Your Carbon Footprint Results</h2>
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Detailed Eco-Report</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Total Carbon Score Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Carbon Score</h3>
                  <div className="flex flex-col items-center">
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center ${getCarbonLevel(result.totalCarbonFootprint).color} mb-4`}>
                      <div className="text-white text-center">
                        <p className="text-3xl font-bold">{result.totalCarbonFootprint.toFixed(0)}</p>
                        <p className="text-sm">kg CO₂/month</p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-white font-medium ${getCarbonLevel(result.totalCarbonFootprint).color}`}>
                      {getCarbonLevel(result.totalCarbonFootprint).level}
                    </div>
                  </div>
                </div>

                {/* Breakdown Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Emission Breakdown</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `${value ? value.toFixed(1) : '0'} kg CO₂`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Leaf className="w-5 h-5 text-green-600 mr-2" />
                    Eco-Friendly Tips
                  </h3>
                  <ul className="space-y-3">
                    {getRecommendations(result.breakdown).map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span className="text-sm text-gray-600">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-gray-600 mb-1">Electricity</p>
                    <p className="text-2xl font-bold text-gray-900">{result.breakdown.electricity.toFixed(1)} kg</p>
                    <p className="text-xs text-gray-500">{formData.electricityKwh} kWh</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-100">
                    <p className="text-sm text-gray-600 mb-1">Car Travel</p>
                    <p className="text-2xl font-bold text-gray-900">{result.breakdown.car.toFixed(1)} kg</p>
                    <p className="text-xs text-gray-500">{formData.carKm} km</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                    <p className="text-sm text-gray-600 mb-1">Public Transport</p>
                    <p className="text-2xl font-bold text-gray-900">{result.breakdown.publicTransport.toFixed(1)} kg</p>
                    <p className="text-xs text-gray-500">{formData.publicTransportKm} km</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-100">
                    <p className="text-sm text-gray-600 mb-1">Diet</p>
                    <p className="text-2xl font-bold text-gray-900">{result.breakdown.diet.toFixed(1)} kg</p>
                    <p className="text-xs text-gray-500">{formData.dietType}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Section */}
          {isMounted && history.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Calculations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.map((item, index) => (
                  <div key={item._id || index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm text-gray-600">Total Footprint</p>
                        <p className="text-2xl font-bold text-gray-900">{item.totalCarbonFootprint.toFixed(0)} kg</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-white text-xs font-medium ${getCarbonLevel(item.totalCarbonFootprint).color}`}>
                        {getCarbonLevel(item.totalCarbonFootprint).level}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Initial State */}
          {!result && history.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                <Zap className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Energy Tracking</h3>
                <p className="text-sm text-gray-600">Monitor your electricity consumption and its environmental impact.</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
                <Car className="w-12 h-12 text-red-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Transport Analysis</h3>
                <p className="text-sm text-gray-600">Track your car and public transport usage for carbon emissions.</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <Leaf className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Personalized Tips</h3>
                <p className="text-sm text-gray-600">Get eco-friendly recommendations based on your highest emission source.</p>
              </div>
            </div>
          )}

          {/* Print-Friendly Eco-Report Container */}
          {result && (
            <div className="print-only hidden print:block">
              <div className="max-w-[210mm] mx-auto p-8 bg-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {/* Report Header */}
                <div className="border-b-2 border-slate-300 pb-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900">Eco-Report</h1>
                      <p className="text-slate-600 mt-1">Personal Carbon Footprint Analysis</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Generated on</p>
                      <p className="text-slate-700 font-medium">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Carbon Footprint Score */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
                    Your Carbon Footprint Score
                  </h2>
                  <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Total Monthly Carbon Footprint</p>
                        <p className="text-4xl font-bold text-slate-900">
                          {result.totalCarbonFootprint.toFixed(0)} kg CO₂
                        </p>
                      </div>
                      <div className={`px-6 py-3 rounded-full text-white font-semibold ${
                        getCarbonLevel(result.totalCarbonFootprint).color
                      }`}>
                        {getCarbonLevel(result.totalCarbonFootprint).level}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consumption Breakdown */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
                    Consumption Breakdown
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <p className="text-sm text-slate-600 mb-1">Electricity</p>
                      <p className="text-2xl font-bold text-slate-900">{result.breakdown.electricity.toFixed(1)} kg</p>
                      <p className="text-xs text-slate-500">{formData.electricityKwh} kWh/month</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <p className="text-sm text-slate-600 mb-1">Car Travel</p>
                      <p className="text-2xl font-bold text-slate-900">{result.breakdown.car.toFixed(1)} kg</p>
                      <p className="text-xs text-slate-500">{formData.carKm} km/week</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <p className="text-sm text-slate-600 mb-1">Public Transport</p>
                      <p className="text-2xl font-bold text-slate-900">{result.breakdown.publicTransport.toFixed(1)} kg</p>
                      <p className="text-xs text-slate-500">{formData.publicTransportKm} km/week</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <p className="text-sm text-slate-600 mb-1">Diet</p>
                      <p className="text-2xl font-bold text-slate-900">{result.breakdown.diet.toFixed(1)} kg</p>
                      <p className="text-xs text-slate-500">{formData.dietType}</p>
                    </div>
                  </div>
                </div>

                {/* Personalized Green Lifestyle Tips */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
                    Personalized Green Lifestyle Tips
                  </h2>
                  <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                    <ul className="space-y-3">
                      {getRecommendations(result.breakdown).map((tip, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </span>
                          <span className="text-slate-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Report Footer */}
                <div className="border-t-2 border-slate-300 pt-6 mt-8">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <p>Eco-Platform Carbon Calculator</p>
                    <p>Take action for a sustainable future</p>
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
