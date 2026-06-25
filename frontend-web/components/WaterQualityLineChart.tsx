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

interface WaterQualityLineChartProps {
  hourlyData?: { // এখানে optional (?) করা হলো যেন অবজেক্টটি না থাকলেও কম্পোনেন্ট হ্যান্ডেল করতে পারে
    time?: string[];
    waterTemperature?: number[];
    salinity?: number[];
    waveHeight?: number[];
  };
}

export default function WaterQualityLineChart({ hourlyData }: WaterQualityLineChartProps) {
  
  // 🌟 নতুন ক্র্যাশ প্রোটেকশন গার্ড: 
  // যদি hourlyData না থাকে, অথবা তার ভেতর time অ্যারে না থাকে, তবে ক্র্যাশ না করে সেফলি একটি সুন্দর নোটিশ দেখাবে।
  if (!hourlyData || !hourlyData.time || !Array.isArray(hourlyData.time) || hourlyData.time.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-gray-500 text-sm">
        No hourly forecast trend available for this location.
      </div>
    );
  }

  // Format time labels (e.g., "2024-01-01T00:00" -> "00:00")
  // এখন এটি সম্পূর্ণ নিরাপদ, কারণ উপরে আমরা অলরেডি নিশ্চিত করেছি যে time প্রোপার্টিটি খালি নয়।
  const labels = hourlyData.time.map((time) => {
    if (!time) return '';
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  });

  const datasets = [];
  
  // Add Salinity dataset if available
  if (hourlyData.salinity && hourlyData.salinity.length > 0) {
    datasets.push({
      label: 'Salinity (psu)',
      data: hourlyData.salinity,
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

  // Add Wave Height dataset if available
  if (hourlyData.waveHeight && hourlyData.waveHeight.length > 0) {
    datasets.push({
      label: 'Wave Height (m)',
      data: hourlyData.waveHeight,
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
          text: 'Salinity (psu)',
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
          text: 'Wave Height (m)',
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
          maxTicksLimit: 8,
        },
      },
    },
  };

  return (
    <div className="w-full h-64">
      <Line data={data} options={options} />
    </div>
  );
}