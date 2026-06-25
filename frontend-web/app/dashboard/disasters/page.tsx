'use client';

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, Wind, Droplets, Flame, MapPin, Clock, Shield, 
  Bookmark, Trash2, CheckCircle, Activity, Users, TrendingUp, 
  Zap, Waves, Mountain, CloudLightning, Eye, Heart, Home, 
  Phone, BriefcaseMedical, Package, Check, X, AlertCircle, ChevronDown
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  getActiveDisasters, 
  getDisasterStats, 
  NaturalDisaster, 
  DisasterStats 
} from '@/lib/disasterApi';

function NaturalDisastersContent() {
  const [disasters, setDisasters] = useState<NaturalDisaster[]>([]);
  const [stats, setStats] = useState<DisasterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [disastersData, statsData] = await Promise.all([
        getActiveDisasters(50),
        getDisasterStats(30)
      ]);
      
      console.log('API Response - Disasters:', disastersData);
      console.log('API Response - Stats:', statsData);
      console.log('Disasters array length:', disastersData?.length || 0);
      
      setDisasters(disastersData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error fetching disaster data:', err);
      setError(err.message || 'Failed to fetch disaster data');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBorderClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'border-l-red-500';
      case 'severe':
        return 'border-l-orange-500';
      case 'moderate':
        return 'border-l-amber-500';
      case 'low':
      default:
        return 'border-l-green-500';
    }
  };

  const getSeverityGradient = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'from-red-500 to-red-600';
      case 'severe':
        return 'from-orange-500 to-orange-600';
      case 'moderate':
        return 'from-yellow-500 to-yellow-600';
      case 'low':
      default:
        return 'from-green-500 to-green-600';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'severe':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'moderate':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
      default:
        return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  const getDisasterIcon = (disasterType: string) => {
    const type = disasterType.toLowerCase();
    if (type.includes('cyclone') || type.includes('hurricane') || type.includes('typhoon')) {
      return Wind;
    } else if (type.includes('flood') || type.includes('tsunami')) {
      return Waves;
    } else if (type.includes('earthquake') || type.includes('seismic')) {
      return Mountain;
    } else if (type.includes('fire') || type.includes('wildfire')) {
      return Flame;
    } else if (type.includes('drought') || type.includes('heat')) {
      return CloudLightning;
    } else {
      return AlertTriangle;
    }
  };

  const getSurvivalGuidelines = (disasterType: string) => {
    const type = disasterType.toLowerCase();
    
    if (type.includes('cyclone') || type.includes('hurricane') || type.includes('typhoon')) {
      return {
        dos: [
          'Stay indoors and away from windows',
          'Secure all doors and windows',
          'Keep emergency kit ready',
          'Follow evacuation orders immediately',
          'Stay in the lowest level of building',
          'Monitor weather updates regularly'
        ],
        donts: [
          'Do not go outside during the storm',
          'Do not use candles (use flashlights)',
          'Do not stay in mobile homes',
          'Do not ignore evacuation warnings',
          'Do not use elevators',
          'Do not drive through flooded roads'
        ]
      };
    } else if (type.includes('flood') || type.includes('tsunami')) {
      return {
        dos: [
          'Move to higher ground immediately',
          'Turn off electricity at the main switch',
          'Avoid walking or driving through water',
          'Stay informed via radio or alerts',
          'Keep important documents in waterproof bags',
          'Help others if safe to do so'
        ],
        donts: [
          'Do not walk through moving water',
          'Do not drive through flooded areas',
          'Do not drink flood water',
          'Do not use electrical appliances in water',
          'Do not return home until declared safe',
          'Do not ignore warning sirens'
        ]
      };
    } else if (type.includes('earthquake') || type.includes('seismic')) {
      return {
        dos: [
          'Drop, Cover, and Hold On',
          'Stay away from windows and heavy objects',
          'If outdoors, move to open area',
          'If in vehicle, stop safely and stay inside',
          'Check for injuries after shaking stops',
          'Be prepared for aftershocks'
        ],
        donts: [
          'Do not run outdoors during shaking',
          'Do not use elevators',
          'Do not stand near buildings or trees',
          'Do not light matches or lighters',
          'Do not move until shaking stops',
          'Do not ignore structural damage'
        ]
      };
    } else if (type.includes('fire') || type.includes('wildfire')) {
      return {
        dos: [
          'Evacuate immediately if ordered',
          'Close all doors and windows behind you',
          'Cover mouth with wet cloth',
          'Move to designated safe zones',
          'Leave lights on for firefighters',
          'Follow emergency routes'
        ],
        donts: [
          'Do not try to fight large fires',
          'Do not use elevators',
          'Do not go back for belongings',
          'Do not hide in closets or bathrooms',
          'Do not break windows',
          'Do not block emergency exits'
        ]
      };
    } else if (type.includes('drought') || type.includes('heat')) {
      return {
        dos: [
          'Stay hydrated and drink water',
          'Stay in air-conditioned spaces',
          'Wear light-colored, loose clothing',
          'Check on elderly neighbors',
          'Avoid outdoor activities during peak hours',
          'Use sunscreen and wear hats'
        ],
        donts: [
          'Do not leave children or pets in cars',
          'Do not ignore heat warnings',
          'Do not drink alcohol or caffeine',
          'Do not exercise during hottest hours',
          'Do not skip meals',
          'Do not use heavy appliances'
        ]
      };
    } else {
      return {
        dos: [
          'Stay calm and follow official instructions',
          'Keep emergency kit accessible',
          'Monitor news and updates',
          'Inform family of your status',
          'Help vulnerable people if possible',
          'Document damage for insurance'
        ],
        donts: [
          'Do not spread unverified information',
          'Do not panic or create chaos',
          'Do not ignore evacuation orders',
          'Do not use phone unless necessary',
          'Do not take unnecessary risks',
          'Do not return until declared safe'
        ]
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">Loading disaster data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg hover:bg-red-100 transition-all duration-200">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <AlertTriangle className="w-8 h-8 text-orange-600" />
        <h1 className="text-3xl font-bold text-slate-900">Natural Disasters Dashboard</h1>
      </div>

      {/* Two-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats Cards and Disaster Type Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Stats/Summary Row */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Disasters</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalCount}</p>
                  </div>
                  <Activity className="w-10 h-10 text-blue-200" />
                </div>
                <p className="text-blue-100 text-xs mt-2">Last 30 days</p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Active Alerts</p>
                    <p className="text-3xl font-bold mt-1">{stats.activeCount}</p>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-red-200" />
                </div>
                <p className="text-red-100 text-xs mt-2">Currently ongoing</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Casualties</p>
                    <p className="text-3xl font-bold mt-1">
                      {stats.byType.reduce((sum, type) => sum + type.totalDeaths, 0)}
                    </p>
                  </div>
                  <Users className="w-10 h-10 text-purple-200" />
                </div>
                <p className="text-purple-100 text-xs mt-2">Across all events</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Injured</p>
                    <p className="text-3xl font-bold mt-1">
                      {stats.byType.reduce((sum, type) => sum + type.totalInjured, 0)}
                    </p>
                  </div>
                  <Heart className="w-10 h-10 text-green-200" />
                </div>
                <p className="text-green-100 text-xs mt-2">Receiving care</p>
              </div>
            </div>
          )}

          {/* Disaster Type Breakdown */}
          {stats && stats.byType.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Disaster Type Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.byType.map((type) => (
                  <div key={type._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900 capitalize">{type._id}</h3>
                      <span className="text-2xl font-bold text-blue-600">{type.count}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-red-500" />
                        <span>{type.totalDeaths} deaths</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4 text-orange-500" />
                        <span>{type.totalInjured} injured</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Disaster Alerts Scrollable Feed */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-[calc(100vh-12rem)] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-slate-900">Live Disaster Alerts</h2>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>{disasters.length} Active Events</span>
              </div>
            </div>

            {disasters.length > 0 ? (
              <div className="space-y-4">
                {disasters.map((disaster) => {
                  const Icon = getDisasterIcon(disaster.disasterType);
                  const guidelines = getSurvivalGuidelines(disaster.disasterType);
                  const isExpanded = expandedAlertId === disaster._id;
                  
                  return (
                    <div 
                      key={disaster._id} 
                      className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 border-l-4 ${getSeverityBorderClass(disaster.severity)} cursor-pointer`}
                      onClick={() => setExpandedAlertId(isExpanded ? null : disaster._id)}
                    >
                      <div className="p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-50 rounded-lg">
                              <Icon className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-slate-900">{disaster.title}</h3>
                              <p className="text-xs text-slate-500">{disaster.disasterType}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityBadge(disaster.severity)}`}>
                              {disaster.severity}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{disaster.description}</p>

                        {/* Details */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center space-x-2 text-xs text-slate-500">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{disaster.location.city}, {disaster.location.country}</span>
                          </div>
                          {disaster.magnitude && (
                            <div className="flex items-center space-x-2 text-xs text-slate-500">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>Magnitude: {disaster.magnitude}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2 text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(disaster.startDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Casualties */}
                        <div className="flex items-center space-x-4 text-xs text-slate-600 mb-4 pb-4 border-b border-gray-100">
                          <div className="flex items-center space-x-1.5">
                            <Users className="w-3.5 h-3.5 text-red-500" />
                            <span>{disaster.casualties.deaths} deaths</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <Heart className="w-3.5 h-3.5 text-orange-500" />
                            <span>{disaster.casualties.injured} injured</span>
                          </div>
                        </div>

                        {/* Status and Area */}
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            disaster.status === 'Active' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-slate-600'
                          }`}>
                            {disaster.status}
                          </span>
                          <span className="text-xs text-slate-400">
                            {disaster.affectedArea}
                          </span>
                        </div>
                      </div>

                      {/* Survival Guidelines Preview */}
                      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                        <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                          <Shield className="w-3.5 h-3.5 text-green-600" />
                          <span>Quick Safety Tips</span>
                        </h4>
                        <div className="space-y-1">
                          <div className="flex items-start space-x-2 text-xs text-slate-600">
                            <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">{guidelines.dos[0]}</span>
                          </div>
                          <div className="flex items-start space-x-2 text-xs text-slate-600">
                            <X className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">{guidelines.donts[0]}</span>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Accordion Section */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50 animate-in slide-in-from-top-2 duration-300 ease-in-out">
                          <div className="p-5">
                            <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                              <Shield className="w-4 h-4 text-green-600" />
                              <span>Survival & Safety Guidelines</span>
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              {/* Do's */}
                              <div>
                                <h5 className="font-semibold text-green-700 mb-2 flex items-center space-x-2 text-sm">
                                  <Check className="w-4 h-4" />
                                  <span>Do's</span>
                                </h5>
                                <ul className="space-y-1.5">
                                  {guidelines.dos.map((item, index) => (
                                    <li key={index} className="flex items-start space-x-2 text-xs text-slate-700">
                                      <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Don'ts */}
                              <div>
                                <h5 className="font-semibold text-red-700 mb-2 flex items-center space-x-2 text-sm">
                                  <X className="w-4 h-4" />
                                  <span>Don'ts</span>
                                </h5>
                                <ul className="space-y-1.5">
                                  {guidelines.donts.map((item, index) => (
                                    <li key={index} className="flex items-start space-x-2 text-xs text-slate-700">
                                      <X className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Emergency Contacts */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h5 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2 text-sm">
                                <Phone className="w-4 h-4 text-blue-600" />
                                <span>Emergency Contacts</span>
                              </h5>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center space-x-2 text-xs">
                                  <Phone className="w-3.5 h-3.5 text-red-500" />
                                  <span className="font-medium">Emergency: 911</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs">
                                  <BriefcaseMedical className="w-3.5 h-3.5 text-blue-500" />
                                  <span className="font-medium">Medical: 112</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs">
                                  <Home className="w-3.5 h-3.5 text-green-500" />
                                  <span className="font-medium">Shelter: Local</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs">
                                  <Package className="w-3.5 h-3.5 text-orange-500" />
                                  <span className="font-medium">Supplies: Ready</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <AlertTriangle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No Active Disasters</h3>
                <p className="text-slate-500">Currently there are no active disaster alerts in the system.</p>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Last Updated */}
      <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
        <Clock className="w-4 h-4" />
        <span>Last updated: {new Date().toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function DisastersPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <NaturalDisastersContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
