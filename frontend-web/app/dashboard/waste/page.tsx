'use client';

import { useState, useEffect } from 'react';
import { Trash2, Recycle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Cell
} from 'recharts';

interface WasteData {
  _id: string;
  country: string;
  plasticWaste: number;
  eWaste: number;
  recyclingRate: number;
  organicWaste: number;
  landfillCapacity: number;
  wastePerCapita: number;
  year: number;
}

export default function WasteManagementPage() {
  const [wasteData, setWasteData] = useState<WasteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWasteData();
  }, []);

  const fetchWasteData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:5000/api/waste');
      const result = await response.json();

      console.log('Waste API Response:', result);

      if (response.ok && result.success) {
        setWasteData(result.data);
      } else {
        setError(result.message || 'Failed to fetch waste data');
      }
    } catch (err: any) {
      console.error('Waste fetch error:', err);
      setError(err.message || 'Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for waste breakdown chart
  const wasteBreakdownData = wasteData.map(item => ({
    country: item.country,
    plasticWaste: item.plasticWaste / 1000, // Convert to thousands for better readability
    eWaste: item.eWaste / 1000,
    organicWaste: item.organicWaste / 1000
  }));

  // Prepare data for recycling rate chart
  const recyclingData = wasteData.map(item => ({
    name: item.country,
    value: item.recyclingRate,
    fill: item.recyclingRate >= 50 ? '#10b981' : item.recyclingRate >= 30 ? '#f59e0b' : '#ef4444'
  }));

  // Calculate global averages
  const avgRecyclingRate = wasteData.length > 0 
    ? (wasteData.reduce((sum, item) => sum + item.recyclingRate, 0) / wasteData.length).toFixed(1)
    : '0';

  const totalPlasticWaste = wasteData.length > 0
    ? (wasteData.reduce((sum, item) => sum + item.plasticWaste, 0) / 1000000).toFixed(2)
    : '0';

  const totalEWaste = wasteData.length > 0
    ? (wasteData.reduce((sum, item) => sum + item.eWaste, 0) / 1000000).toFixed(2)
    : '0';

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Trash2 className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Waste Management</h1>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Trash2 className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Waste Management</h1>
            </div>
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6 overflow-y-auto">
          <div className="flex items-center space-x-3">
            <Trash2 className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-slate-900">Waste Management</h1>
          </div>

          {/* Hero Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-sm border border-green-200 p-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Track & Optimize Waste Management
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Monitor waste generation, recycling rates, and disposal patterns across major countries. 
                Get insights on sustainable waste management practices and track environmental impact.
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Total Plastic Waste</h3>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Recycle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{totalPlasticWaste}</p>
              <p className="text-sm text-slate-500 mt-1">Million tons/year</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Total E-Waste</h3>
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{totalEWaste}</p>
              <p className="text-sm text-slate-500 mt-1">Million tons/year</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Avg Recycling Rate</h3>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Recycle className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{avgRecyclingRate}%</p>
              <p className="text-sm text-slate-500 mt-1">Global average</p>
            </div>
          </div>

          {/* Global Waste Breakdown Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Global Waste Breakdown by Country</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={wasteBreakdownData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="country" 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  stroke="#94a3b8"
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  stroke="#94a3b8"
                  label={{ value: 'Waste (thousand tons/year)', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: '#1e293b' }}
                />
                <Legend />
                <Bar dataKey="plasticWaste" name="Plastic Waste" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="eWaste" name="E-Waste" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="organicWaste" name="Organic Waste" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recycling Rate Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Recycling Rate by Country</h3>
              <ResponsiveContainer width="100%" height={350}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={recyclingData}>
                  <RadialBar 
                    label={{ position: 'insideStart', fill: '#ffffff', fontSize: 12 }} 
                    background 
                    dataKey="value"
                  >
                    {recyclingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </RadialBar>
                  <Legend 
                    iconSize={10} 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ color: '#1e293b' }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Waste Per Capita</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={wasteData.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    type="number" 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    stroke="#94a3b8"
                    label={{ value: 'kg/day', position: 'insideBottom', fill: '#64748b' }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="country" 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    stroke="#94a3b8"
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ color: '#1e293b' }}
                  />
                  <Bar dataKey="wastePerCapita" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
