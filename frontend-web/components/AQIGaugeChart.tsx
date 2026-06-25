'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AQIGaugeChartProps {
  aqi: number;
}

export default function AQIGaugeChart({ aqi }: AQIGaugeChartProps) {
  const getAQIColor = (value: number) => {
    if (value <= 50) return '#22c55e'; // Green
    if (value <= 100) return '#eab308'; // Yellow
    if (value <= 150) return '#f97316'; // Orange
    if (value <= 200) return '#ef4444'; // Red
    if (value <= 300) return '#a855f7'; // Purple
    return '#7f1d1d'; // Maroon
  };

  const getAQILabel = (value: number) => {
    if (value <= 50) return 'Good';
    if (value <= 100) return 'Moderate';
    if (value <= 150) return 'Unhealthy for Sensitive Groups';
    if (value <= 200) return 'Unhealthy';
    if (value <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const color = getAQIColor(aqi);
  const label = getAQILabel(aqi);

  const data = {
    datasets: [
      {
        data: [aqi, 500 - aqi],
        backgroundColor: [color, '#e5e7eb'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '75%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-8">
          <span className="text-5xl font-bold text-gray-900">{Math.round(aqi)}</span>
          <span className="text-sm text-gray-600 mt-1">AQI</span>
          <span 
            className="text-sm font-medium mt-2 px-3 py-1 rounded-full"
            style={{ backgroundColor: color + '20', color: color }}
          >
            {label}
          </span>
        </div>
      </div>
      <div className="flex justify-between mt-4 text-xs text-gray-500 px-4">
        <span>0</span>
        <span>50</span>
        <span>100</span>
        <span>150</span>
        <span>200</span>
        <span>300</span>
        <span>500</span>
      </div>
    </div>
  );
}
