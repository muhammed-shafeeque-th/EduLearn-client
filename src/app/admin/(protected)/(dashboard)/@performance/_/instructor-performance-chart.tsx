'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export function InstructorPerformanceChart() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const data = {
    labels: [
      'Teaching Quality',
      'Student Engagement',
      'Course Completion',
      'Response Time',
      'Content Quality',
      'Innovation',
    ],
    datasets: [
      {
        label: 'Top Performers',
        data: [85, 90, 80, 95, 88, 75],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
      },
      {
        label: 'Average Performance',
        data: [70, 75, 65, 80, 72, 60],
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        borderColor: 'rgba(249, 115, 22, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(249, 115, 22, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(249, 115, 22, 1)',
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
      r: {
        angleLines: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb',
        },
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb',
        },
        pointLabels: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          font: {
            size: 12,
          },
        },
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          backdropColor: 'transparent',
        },
        beginAtZero: true,
        max: 100,
      },
    },
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
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
      transition={{ delay: 0.6 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Instructor Performance Metrics</CardTitle>
          <CardDescription>
            Comparative analysis of instructor performance across key metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Radar data={data} options={options} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
