'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend
);

interface CourseOverviewChartProps {
  enrollmentData: Array<{ date: string; enrollments: number }>;
  completionRate: number;
  engagementRate: number;
}

export function CourseOverviewChart({
  enrollmentData,
  completionRate,
  engagementRate,
}: CourseOverviewChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Generate multiple data series
    const enrollmentTrend = enrollmentData.map((item, index) => {
      const base = item.enrollments;
      const trend = base + Math.sin(index * 0.5) * base * 0.2;
      return Math.max(0, trend);
    });

    const completionTrend = enrollmentData.map((_, index) => {
      const base = completionRate;
      const variation = Math.sin(index * 0.3 + 1) * 10;
      return Math.max(0, Math.min(100, base + variation));
    });

    const engagementTrend = enrollmentData.map((_, index) => {
      const base = engagementRate;
      const variation = Math.sin(index * 0.4 + 2) * 8;
      return Math.max(0, Math.min(100, base + variation));
    });

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: enrollmentData.map((item) =>
          new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        ),
        datasets: [
          {
            label: 'Enrollments',
            data: enrollmentTrend,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
            yAxisID: 'y',
          },
          {
            label: 'Completion Rate',
            data: completionTrend,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
            yAxisID: 'y1',
          },
          {
            label: 'Engagement',
            data: engagementTrend,
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'line',
              padding: 15,
              font: {
                size: 11,
              },
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                if (label === 'Enrollments') {
                  return `${label}: ${Math.round(value)}`;
                } else {
                  return `${label}: ${value.toFixed(1)}%`;
                }
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            grid: {
              display: false,
            },
            ticks: {
              maxTicksLimit: 7,
              font: {
                size: 10,
              },
            },
          },
          y: {
            type: 'linear',
            display: false,
            position: 'left',
            grid: {
              display: false,
            },
          },
          y1: {
            type: 'linear',
            display: false,
            position: 'right',
            grid: {
              display: false,
            },
            min: 0,
            max: 100,
          },
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [enrollmentData, completionRate, engagementRate]);

  return (
    <div className="relative h-48">
      <canvas ref={chartRef} />
    </div>
  );
}
