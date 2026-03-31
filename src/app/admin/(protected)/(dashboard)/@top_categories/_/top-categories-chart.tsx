'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { useCategoriesStats } from '@/states/server/admin/use-admin-stats';

ChartJS.register(ArcElement, Tooltip, Legend);

export function TopCategoriesChart() {
  const { theme } = useTheme();

  const { stats, isLoading } = useCategoriesStats({ enabled: true });

  const chartData = useMemo(() => {
    const categoriesLabels = new Array<string>();
    const courseCountList = new Array<number>();
    if (stats && Array.isArray(stats)) {
      stats.slice(0, 5).forEach((item) => {
        categoriesLabels.push(String(item.category));
        courseCountList.push(Number(item.count));
      });
    }

    return {
      labels: categoriesLabels ?? [
        'Web Development',
        'Data Science',
        'Mobile Development',
        'UI/UX Design',
        'DevOps',
      ],
      datasets: [
        {
          data: courseCountList ?? [2, 3, 0, 8, 1],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(236, 72, 153, 0.8)',
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(249, 115, 22, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(236, 72, 153, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [stats]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
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
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            return `${context.label}: ${context.parsed} courses`;
          },
        },
      },
    },
  };

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
      transition={{ delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Popular Course Categories</CardTitle>
          <CardDescription>Distribution of course enrollments by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Doughnut data={chartData} options={options} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
