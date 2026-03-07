'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTheme } from 'next-themes';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { useEnrollmentTrend } from '@/states/server/admin/use-admin-stats';
import { useMemo } from 'react';

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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function CourseEnrollmentChart() {
  const { theme } = useTheme();
  const year = useMemo(() => new Date().getFullYear().toString(), []);
  const { trend, isLoading } = useEnrollmentTrend(year);

  const chartData = useMemo(() => {
    const filledData = new Array(12).fill(0);
    if (trend && Array.isArray(trend)) {
      trend.forEach((item) => {
        const monthIndex = Number(item.month);
        if (monthIndex >= 0 && monthIndex < 12) {
          filledData[monthIndex] += Number(item.enrollments || 0);
        }
      });
    }

    return {
      labels: MONTH_LABELS,
      datasets: [
        {
          label: 'Course Enrollments',
          data: filledData,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  }, [trend]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: theme === 'dark' ? '#e5e7eb' : '#374151',
            usePointStyle: true,
            padding: 20,
          },
        },
        tooltip: {
          backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          titleColor: theme === 'dark' ? '#fff' : '#000',
          bodyColor: theme === 'dark' ? '#fff' : '#000',
          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
          borderWidth: 1,
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
            precision: 0, // Ensure integers for enrollments
          },
          beginAtZero: true,
        },
      },
    }),
    [theme]
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
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
      transition={{ delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Course Enrollment Trends</CardTitle>
          <CardDescription>Monthly enrollments vs completions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar data={chartData} options={options} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
