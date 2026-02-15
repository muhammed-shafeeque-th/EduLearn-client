'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend);

interface ProfileViewChartProps {
  data: Array<{ date: string; enrollments: number }>;
  totalViews: number;
}

export function ProfileViewChart({ data, totalViews }: ProfileViewChartProps) {
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

    // Generate view data
    const viewData = data.map((item) => {
      const baseViews = item.enrollments * 15;
      const variation = Math.random() * baseViews * 0.4;
      return Math.max(0, baseViews + variation);
    });

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: data.map((item) =>
          new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        ),
        datasets: [
          {
            label: 'Profile Views',
            data: viewData,
            backgroundColor: 'rgb(34, 197, 94)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 1,
            borderRadius: 2,
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
            borderColor: 'rgba(34, 197, 94, 0.8)',
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                return `${Math.round(context.parsed.y).toLocaleString()} views`;
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
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data, totalViews]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">USD Dollar you earned</p>
      </div>
      <div className="relative h-24">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
}
