'use client';

import { useState, useEffect } from 'react';
import { Leaf, Shield, AlertTriangle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  BarChart,
  Bar
} from 'recharts';

interface BiodiversityData {
  _id: string;
  country: string;
  endangeredSpeciesCount: number;
  deforestationRate: number;
  protectedAreaCoverage: number;
  totalSpeciesCount: number;
  habitatLossIndex: number;
  biodiversityIndex: number;
  invasiveSpeciesCount: number;
  year: number;
}

export default function BiodiversityPage() {
  const [biodiversityData, setBiodiversityData] = useState<BiodiversityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBiodiversityData();
  }, []);

  const fetchBiodiversityData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/biodiversity');
      const result = await response.json();

      if (response.ok && result.success) {
        setBiodiversityData(result.data);
      } else {
        setError(result.message || 'Failed to fetch biodiversity data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for endangered species chart
  const endangeredSpeciesData = biodiversityData.map(item => ({
    country: item.country,
    endangeredSpecies: item.endangeredSpeciesCount,
    totalSpecies: item.totalSpeciesCount
  }));

  // Prepare data for deforestation and protection chart
  const deforestationData = biodiversityData.map(item => ({
    country: item.country,
    deforestationRate: item.deforestationRate,
    protectedArea: item.protectedAreaCoverage
  }));

  // Calculate global averages
  const avgEndangeredSpecies = biodiversityData.length > 0
    ? Math.round(biodiversityData.reduce((sum, item) => sum + item.endangeredSpeciesCount, 0) / biodiversityData.length)
    : 0;

  const avgProtectedArea = biodiversityData.length > 0
    ? (biodiversityData.reduce((sum, item) => sum + item.protectedAreaCoverage, 0) / biodiversityData.length).toFixed(1)
    : '0';

  const avgBiodiversityIndex = biodiversityData.length > 0
    ? (biodiversityData.reduce((sum, item) => sum + item.biodiversityIndex, 0) / biodiversityData.length).toFixed(2)
    : '0';

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Leaf className="w-8 h-8 text-emerald-600" />
              <h1 className="text-3xl font-bold text-gray-900">Biodiversity & Ecosystems</h1>
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
              <Leaf className="w-8 h-8 text-emerald-600" />
              <h1 className="text-3xl font-bold text-gray-900">Biodiversity & Ecosystems</h1>
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
            <Leaf className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-slate-900">Biodiversity & Ecosystems</h1>
          </div>

          {/* Hero Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl shadow-sm border border-emerald-200 p-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Monitor & Protect Biodiversity
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Track species diversity, ecosystem health indicators, and conservation efforts across major countries. 
                Gain insights into habitat changes and support environmental preservation initiatives.
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Avg Endangered Species</h3>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{avgEndangeredSpecies}</p>
              <p className="text-sm text-slate-500 mt-1">Species per country</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Avg Protected Area</h3>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{avgProtectedArea}%</p>
              <p className="text-sm text-slate-500 mt-1">Land coverage</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Biodiversity Index</h3>
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-teal-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{avgBiodiversityIndex}</p>
              <p className="text-sm text-slate-500 mt-1">Global average (0-1)</p>
            </div>
          </div>

          {/* Endangered Species Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Endangered Species Track</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={endangeredSpeciesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="country" 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  stroke="#94a3b8"
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  stroke="#94a3b8"
                  label={{ value: 'Species Count', angle: -90, position: 'insideLeft', fill: '#64748b' }}
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
                <Area 
                  type="monotone" 
                  dataKey="endangeredSpecies" 
                  name="Endangered Species"
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="totalSpecies" 
                  name="Total Species"
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Deforestation & Protection Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Deforestation Rate vs Protected Area</h3>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={deforestationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="country" 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    stroke="#94a3b8"
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    stroke="#94a3b8"
                    label={{ value: 'Deforestation Rate (%)', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    stroke="#94a3b8"
                    label={{ value: 'Protected Area (%)', angle: 90, position: 'insideRight', fill: '#64748b' }}
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
                  <Bar 
                    yAxisId="right"
                    dataKey="protectedArea" 
                    name="Protected Area (%)" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="deforestationRate" 
                    name="Deforestation Rate (%)" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Habitat Loss Index</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={biodiversityData.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    type="number" 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    stroke="#94a3b8"
                    label={{ value: 'Loss Index (0-100)', position: 'insideBottom', fill: '#64748b' }}
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
                  <Bar 
                    dataKey="habitatLossIndex" 
                    name="Habitat Loss Index"
                    fill="#ef4444" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Biodiversity Index Comparison */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Biodiversity Index Comparison</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={biodiversityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="country" 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  stroke="#94a3b8"
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  stroke="#94a3b8"
                  label={{ value: 'Biodiversity Index (0-1)', angle: -90, position: 'insideLeft', fill: '#64748b' }}
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
                <Line 
                  type="monotone" 
                  dataKey="biodiversityIndex" 
                  name="Biodiversity Index"
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
