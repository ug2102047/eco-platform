'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, MapPin, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default function SettingsPage() {
  const router = useRouter();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [region, setRegion] = useState('dhaka');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const cities = [
    { value: 'dhaka', label: 'Dhaka' },
    { value: 'jhenaidah', label: 'Jhenaidah' },
    { value: 'chittagong', label: 'Chittagong' },
    { value: 'khulna', label: 'Khulna' },
    { value: 'rajshahi', label: 'Rajshahi' },
    { value: 'sylhet', label: 'Sylhet' },
  ];

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedEmailAlerts = localStorage.getItem('emailAlerts');
    const savedRegion = localStorage.getItem('region');

    if (savedEmailAlerts !== null) setEmailAlerts(JSON.parse(savedEmailAlerts));
    if (savedRegion) setRegion(savedRegion);
  }, []);

  const handleSave = () => {
    setSaveStatus('saving');

    // Save to localStorage
    localStorage.setItem('emailAlerts', JSON.stringify(emailAlerts));
    localStorage.setItem('region', region);

    // Simulate save delay
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and notifications</p>
        </div>

        {/* Settings Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Email Alerts Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Email Alerts</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Receive weekly Eco-Reports with environmental updates and air quality summaries
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emailAlerts ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Region Sync Section */}
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Region Sync</h3>
                <p className="text-sm text-gray-600 mt-1 mb-4">
                  Lock your primary monitored city for personalized environmental data
                </p>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full max-w-xs px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  {cities.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
            </span>
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Settings are saved locally in your browser. Changes will persist across sessions.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
