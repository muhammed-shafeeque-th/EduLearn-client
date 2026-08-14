/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import * as Chart from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import type { WalletTransaction } from '@/types/wallet';

Chart.Chart.register(
  Chart.CategoryScale,
  Chart.LinearScale,
  Chart.PointElement,
  Chart.LineController,
  Chart.LineElement,
  Chart.BarElement,
  Chart.Title,
  Chart.Tooltip,
  Chart.Legend,
  Chart.Filler
);

export const RevenueChart: React.FC<{
  transactions: WalletTransaction[];
  timeFilter: string;
  onTimeFilterChange: (value: string) => void;
  currency: string;
  showComparison?: boolean;
}> = ({ transactions, timeFilter, onTimeFilterChange, currency, showComparison = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart.Chart | null>(null);

  const chartData = useMemo(() => {
    const now = new Date();
    const days =
      timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : timeFilter === '90d' ? 90 : 365;

    const labels: string[] = [];
    const dataMap: Map<string, number> = new Map();

    // Initialize all dates with 0
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      labels.push(dateStr);
      dataMap.set(dateStr, 0);
    }

    // Aggregate transaction data by date
    transactions.forEach((txn) => {
      const txnDate = new Date(txn.timestamp);
      const diffTime = now.getTime() - txnDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if ((diffDays < days && txn.type === 'deposit') || txn.type === 'purchase') {
        const dateStr = txnDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const current = dataMap.get(dateStr) || 0;
        dataMap.set(dateStr, current + txn.amount);
      }
    });

    return {
      labels,
      data: labels.map((label) => dataMap.get(label) || 0),
    };
  }, [transactions, timeFilter]);

  const growthRate = useMemo(() => {
    const halfPoint = Math.floor(chartData.data.length / 2);
    const firstHalf = chartData.data.slice(0, halfPoint).reduce((a, b) => a + b, 0);
    const secondHalf = chartData.data.slice(halfPoint).reduce((a, b) => a + b, 0);

    if (firstHalf === 0) return 0;
    return ((secondHalf - firstHalf) / firstHalf) * 100;
  }, [chartData]);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const datasets = [
        {
          label: 'Revenue',
          data: chartData.data,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ];

      if (showComparison) {
        datasets.push({
          label: 'Previous Period',
          data: chartData.data.map((v) => v * 0.85),
          borderColor: '#6b7280',
          backgroundColor: 'rgba(107, 114, 128, 0.1)',
          fill: true,
          tension: 0.4,
          borderDash: [5, 5],
        } as any);
      }

      chartRef.current = new Chart.Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: showComparison,
              position: 'top' as const,
            },
            tooltip: {
              mode: 'index' as const,
              intersect: false,
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  label += new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency || 'USD',
                  }).format(context.parsed.y);
                  return label;
                },
              },
            },
          },
          scales: {
            x: {
              display: true,
              grid: { display: false },
            },
            y: {
              display: true,
              grid: { color: 'rgba(0, 0, 0, 0.1)' },
              ticks: {
                callback: function (value) {
                  return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency || 'USD',
                    notation: 'compact',
                  }).format(value as number);
                },
              },
            },
          },
          elements: {
            point: { radius: 3, hoverRadius: 5 },
          },
        },
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [chartData, showComparison, currency]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Revenue Overview</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Track your earnings over time</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span>
                {growthRate > 0 ? '+' : ''}
                {growthRate.toFixed(1)}%
              </span>
            </Badge>
            <Select value={timeFilter} onValueChange={onTimeFilterChange}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <canvas ref={canvasRef} />
        </div>
      </CardContent>
    </Card>
  );
};
