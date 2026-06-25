'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Wind, 
  Cloud, 
  Droplets, 
  AlertTriangle, 
  Calculator,
  ChevronDown,
  ChevronRight,
  Thermometer,
  Shield,
  Lightbulb,
  Trash2,
  Leaf,
  Users
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Air Quality', href: '/dashboard/air-quality', icon: Wind },
  { name: 'Water Quality', href: '/dashboard/water', icon: Droplets },
  { name: 'Natural Disasters', href: '/dashboard/disasters', icon: AlertTriangle },
  { name: 'Carbon Calculator', href: '/dashboard/carbon', icon: Calculator },
  { name: 'Waste Management', href: '/dashboard/waste', icon: Trash2 },
  { name: 'Community', href: '/dashboard/community', icon: Users },
  { name: 'Biodiversity', href: '/dashboard/biodiversity', icon: Leaf },
];

const weatherSubItems = [
  { name: 'Live Forecast', href: '/dashboard/weather', icon: Thermometer },
  { name: 'Climate Stripes', href: '/dashboard/weather/historical', icon: Cloud },
  { name: 'Risk & Vulnerability', href: '/dashboard/weather/risk-matrix', icon: Shield },
  { name: 'Smart Lifestyle Advisory', href: '/dashboard/weather/advisory', icon: Lightbulb },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);

  const isWeatherActive = pathname.startsWith('/dashboard/weather');

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </a>
          );
        })}

        {/* Weather & Climate Dropdown */}
        <div>
          <button
            onClick={() => setIsWeatherOpen(!isWeatherOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
              isWeatherActive
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Cloud className="w-5 h-5" />
              <span className="font-medium">Weather & Climate</span>
            </div>
            {isWeatherOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {isWeatherOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {weatherSubItems.map((subItem) => {
                const isSubActive = pathname === subItem.href;
                const SubIcon = subItem.icon;
                
                return (
                  <a
                    key={subItem.name}
                    href={subItem.href}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                      isSubActive
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <SubIcon className="w-4 h-4" />
                    <span className="text-sm">{subItem.name}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
