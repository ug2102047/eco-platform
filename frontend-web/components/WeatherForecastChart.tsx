'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WeatherForecastChartProps {
  dailyData?: {
    time?: string[];
    maxTemperature?: number[];
    minTemperature?: number[];
    totalPrecipitation?: number[];
  };
}

export default function WeatherForecastChart({ dailyData }: WeatherForecastChartProps) {
  // Data validation and crash protection
  if (!dailyData || !dailyData.time || !Array.isArray(dailyData.time) || dailyData.time.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-gray-500 text-sm">
        No 7-day forecast data available for this location.
      </div>
    );
  }

  // Format date labels (e.g., "2024-01-01" -> "Jan 1")
  const labels = dailyData.time.map((date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const datasets = [];

  // Add Max Temperature dataset if available
  if (dailyData.maxTemperature && dailyData.maxTemperature.length > 0) {
    datasets.push({
      label: 'Max Temp (°C)',
      data: dailyData.maxTemperature,
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 3,
      pointHoverRadius: 5,
      yAxisID: 'y',
    });
  }

  // Add Min Temperature dataset if available
  if (dailyData.minTemperature && dailyData.minTemperature.length > 0) {
    datasets.push({
      label: 'Min Temp (°C)',
      data: dailyData.minTemperature,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 3,
      pointHoverRadius: 5,
      yAxisID: 'y',
    });
  }

  // Add Precipitation dataset if available
  if (dailyData.totalPrecipitation && dailyData.totalPrecipitation.length > 0) {
    datasets.push({
      label: 'Precipitation (mm)',
      data: dailyData.totalPrecipitation,
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 3,
      pointHoverRadius: 5,
      yAxisID: 'y1',
    });
  }

  const data = {
    labels,
    datasets,
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 12 },
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        displayColors: true,
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Temperature (°C)',
          font: { size: 11 },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: { size: 12 },
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Precipitation (mm)',
          font: { size: 11 },
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          font: { size: 12 },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 11 },
          maxTicksLimit: 7,
        },
      },
    },
  };

  return (
    <div className="w-full h-80">
      <Line data={data} options={options} />
    </div>
  );
}