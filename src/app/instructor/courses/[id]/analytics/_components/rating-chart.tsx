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
import { Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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

interface RatingChartProps {
  averageRating: number;
  ratingsBreakdown: { [key: number]: number };
  totalRatings: number;
}

export function RatingChart({ averageRating, ratingsBreakdown, totalRatings }: RatingChartProps) {
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

    // Generate trending data for ratings over time
    const trendData = Array.from({ length: 30 }, (_, i) => {
      const baseValue = averageRating + Math.sin(i * 0.2) * 0.3;
      const noise = (Math.random() - 0.5) * 0.2;
      return Math.max(3.5, Math.min(5.0, baseValue + noise));
    });

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
        datasets: [
          {
            label: 'Rating Trend',
            data: trendData,
            borderColor: 'rgb(251, 191, 36)',
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            borderWidth: 2,
            fill: false,
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
            borderColor: 'rgba(251, 191, 36, 0.8)',
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                return `${context.parsed.y.toFixed(1)} stars`;
              },
            },
          },
        },
        scales: {
          x: {
            display: false,
            grid: {
              display: false,
            },
          },
          y: {
            display: false,
            grid: {
              display: false,
            },
            min: 3.5,
            max: 5.0,
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
  }, [averageRating, ratingsBreakdown, totalRatings]);

  return (
    <div className="space-y-4">
      {/* Rating Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.floor(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : star === Math.ceil(averageRating) && averageRating % 1 >= 0.5
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">Overall Rating</div>
      </div>

      {/* Chart */}
      <div className="relative h-16">
        <canvas ref={chartRef} />
      </div>

      {/* Rating Breakdown */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingsBreakdown[rating] || 0;
          const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;

          return (
            <div key={rating} className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-1 w-12">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{rating}</span>
              </div>
              <Progress value={percentage} className="flex-1 h-2" />
              <span className="w-8 text-right text-muted-foreground">{percentage.toFixed(0)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
