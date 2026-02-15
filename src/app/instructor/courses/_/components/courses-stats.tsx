'use client';

import { motion } from 'framer-motion';
import { BookOpen, Users, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useInstructorCoursesStats } from '@/states/server/user/use-user-stats';
import { useAuthUserSelector } from '@/states/client';

interface CourseStatsProps {
  instructorId?: string;
}

const statConfigs = [
  {
    key: 'totalCourses',
    title: 'Total Courses',
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    format: (v: number) => v?.toString(),
  },
  {
    key: 'totalStudents',
    title: 'Students Enrolled',
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    format: (v: number) => v?.toLocaleString(),
  },
  {
    key: 'averageRating',
    title: 'Average Rating',
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    format: (v: number) => (v ? v.toFixed(1) : '—'),
  },
  {
    key: 'totalRevenue',
    title: 'Total Revenue',
    icon: TrendingUp,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    format: (v: number) => (v != null ? `₹${v.toLocaleString()}` : '—'),
  },
];

export function CoursesStats({}: CourseStatsProps) {
  const { userId } = useAuthUserSelector() ?? {};

  const {
    data: stats,
    isLoading,
    isError,
    error,
  } = useInstructorCoursesStats(userId!, { enabled: true });

  // Loading or error states
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-busy>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 animate-pulse">
                <div className="p-2 rounded-lg bg-muted"></div>
                <div className="min-w-0 flex-1">
                  <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        Failed to load course stats. Please try again later.
        {error?.message && (
          <div className="text-xs text-muted-foreground mt-2">{error.message}</div>
        )}
      </div>
    );
  }

  // Defensive fallback values
  const resolvedStats = stats ?? {
    totalCourses: 0,
    totalStudents: 0,
    averageRating: 0,
    totalRevenue: 0,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfigs.map((stat, index) => {
        const Icon = stat.icon;
        const value = resolvedStats[stat.key as keyof typeof resolvedStats];
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground truncate">
                      {stat.title}
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {typeof stat.format === 'function' ? stat.format(value as number) : value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
