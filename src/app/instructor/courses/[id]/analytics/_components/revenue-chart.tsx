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
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RevenueChartProps {
  data: Array<{ date: string; enrollments: number }>;
  totalRevenue: number;
}

export function RevenueChart({ data, totalRevenue }: RevenueChartProps) {
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

    // Generate revenue data based on enrollments
    const revenueData = data.map((item, index) => {
      const baseRevenue = item.enrollments * 89.99;
      const variation = Math.sin(index * 0.5) * baseRevenue * 0.3;
      return Math.max(0, baseRevenue + variation);
    });

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: data.map((item) =>
          new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        ),
        datasets: [
          {
            label: 'Revenue',
            data: revenueData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(59, 130, 246, 0.8)',
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                return `${Math.round(context.parsed.y).toLocaleString()}`;
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
            },
          },
          y: {
            display: false,
            grid: {
              display: false,
            },
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
  }, [data, totalRevenue]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-2xl font-bold">${Math.round(totalRevenue / 1000)}K</p>
        <p className="text-sm text-muted-foreground">USD Dollar you earned</p>
      </div>
      <div className="relative h-24">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
}
