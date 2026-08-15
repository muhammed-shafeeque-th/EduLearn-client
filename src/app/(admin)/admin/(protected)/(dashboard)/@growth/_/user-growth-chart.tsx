'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useTheme } from 'next-themes';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import {
  useInstructorGrowthTrend,
  useUsersGrowthTrend,
} from '@/states/server/admin/use-admin-stats';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function UserGrowthChart() {
  const { theme } = useTheme();
  const year = useMemo(() => new Date().getFullYear().toString(), []);
  const { trend: instructorsTrend, isLoading: isLoadingInstructors } =
    useInstructorGrowthTrend(year);
  const { trend: usersTrend, isLoading: isLoadingUsers } = useUsersGrowthTrend(year);

  const getChartData = useMemo(
    () => (trend: { month: number; count: number }[] | undefined) => {
      const data = new Array(12).fill(0);
      if (!trend) return data;
      trend.forEach((item) => {
        // Backend returns 0-indexed month (0=Jan, 11=Dec)
        const index = Number(item.month);
        if (index >= 0 && index < 12) {
          data[index] = item.count;
        }
      });
      return data;
    },
    []
  );

  const studentData = useMemo(() => getChartData(usersTrend), [getChartData, usersTrend]);
  const instructorData = useMemo(
    () => getChartData(instructorsTrend),
    [getChartData, instructorsTrend]
  );

  const data = {
    labels: MONTH_LABELS,
    datasets: [
      {
        label: 'Students',
        data: studentData,
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Instructors',
        data: instructorData,
        borderColor: 'rgb(139, 69, 19)',
        backgroundColor: 'rgba(139, 69, 19, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
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
        },
      },
    },
  };

  if (isLoadingInstructors || isLoadingUsers) {
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
      transition={{ delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>Weekly growth in students and instructors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Line data={data} options={options} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
