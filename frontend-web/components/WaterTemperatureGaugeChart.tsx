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

interface WaterTemperatureGaugeChartProps {
  waterTemperature: number;
}

export default function WaterTemperatureGaugeChart({ waterTemperature }: WaterTemperatureGaugeChartProps) {
  const getWaterTempColor = (value: number) => {
    if (value <= 10) return '#3b82f6'; // Cold - Blue
    if (value <= 18) return '#06b6d4'; // Cool - Cyan
    if (value <= 25) return '#22c55e'; // Optimal - Green
    if (value <= 30) return '#eab308'; // Warm - Yellow
    if (value <= 35) return '#f97316'; // Hot - Orange
    return '#ef4444'; // Very Hot - Red
  };

  const getWaterTempLabel = (value: number) => {
    if (value <= 10) return 'Cold';
    if (value <= 18) return 'Cool';
    if (value <= 25) return 'Optimal';
    if (value <= 30) return 'Warm';
    if (value <= 35) return 'Hot';
    return 'Very Hot';
  };

  const color = getWaterTempColor(waterTemperature);
  const label = getWaterTempLabel(waterTemperature);

  // Map temperature to 0-40 scale for gauge display
  const normalizedTemp = Math.min(Math.max(waterTemperature, 0), 40);

  const data = {
    datasets: [
      {
        data: [normalizedTemp, 40 - normalizedTemp],
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
          <span className="text-5xl font-bold text-gray-900">{waterTemperature.toFixed(1)}</span>
          <span className="text-sm text-gray-600 mt-1">°C</span>
          <span 
            className="text-sm font-medium mt-2 px-3 py-1 rounded-full"
            style={{ backgroundColor: color + '20', color: color }}
          >
            {label}
          </span>
        </div>
      </div>
      <div className="flex justify-between mt-4 text-xs text-gray-500 px-4">
        <span>0°C</span>
        <span>10°C</span>
        <span>20°C</span>
        <span>30°C</span>
        <span>40°C</span>
      </div>
    </div>
  );
}
