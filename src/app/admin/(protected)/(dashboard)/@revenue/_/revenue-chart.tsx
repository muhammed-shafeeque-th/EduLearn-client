/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { useRevenueStats } from '@/states/server/admin/use-admin-stats';
import { normalizeCurrencyAmount } from '@/lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler
);

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function RevenueChart() {
  const { theme } = useTheme();
  const year = useMemo(() => new Date().getFullYear().toString(), []);
  const { data, isLoading } = useRevenueStats(year);

  const chartData = useMemo(() => {
    const filledData = new Array(12).fill(0);
    if (data && Array.isArray(data)) {
      data.forEach((item) => {
        const monthIndex = Number(item.month) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          filledData[monthIndex] = normalizeCurrencyAmount(item.revenue);
        }
      });
    }
    return {
      labels: MONTH_LABELS,
      datasets: [
        {
          label: 'Revenue',
          data: filledData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: 'rgb(59, 130, 246)',
          pointHoverBackgroundColor: 'rgb(59, 130, 246)',
          pointHoverBorderColor: 'rgb(59, 130, 246)',
        },
      ],
    };
  }, [data]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          titleColor: theme === 'dark' ? '#fff' : '#000',
          bodyColor: theme === 'dark' ? '#fff' : '#000',
          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
          borderWidth: 1,
          callbacks: {
            label: function (context: any) {
              return `Revenue: ₹${Number(context.parsed.y).toLocaleString()}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          },
        },
        y: {
          grid: {
            color: theme === 'dark' ? '#374151' : '#f3f4f6',
          },
          ticks: {
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            callback: function (value: any) {
              return '$' + Number(value).toLocaleString();
            },
          },
        },
      },
    }),
    [theme]
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
          <CardDescription>Revenue trends over the past 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
