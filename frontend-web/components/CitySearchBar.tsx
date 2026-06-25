'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface CitySearchBarProps {
  onSearch: (city: string) => void;
  loading?: boolean;
}

export default function CitySearchBar({ onSearch, loading = false }: CitySearchBarProps) {
  const [city, setCity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Search for any city globally (e.g., Dhaka, London, New York...)"
          className="w-full px-6 py-4 pl-14 text-lg text-gray-900 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all shadow-sm"
          disabled={loading}
        />
        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <button
          type="submit"
          disabled={loading || !city.trim()}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );
}
