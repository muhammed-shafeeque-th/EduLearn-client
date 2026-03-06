'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  DollarSign,
  BarChart3,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RatingChart } from './rating-chart';
import { EnrollmentTrendChart } from './enrollment-trend-chart';
import { CourseAnalytics } from '@/types/course';
import { useCourseAnalytics } from '@/states/server/course/use-course-stats';
import LoadingScreen from '@/components/ui/loading-screen';

interface CourseAnalyticsDashboardProps {
  courseId: string;
  // analytics: CourseAnalytics;
}

const MONTH_NAMES = [
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

function normalizeCourseAnalytics(data: Partial<CourseAnalytics>) {
  return {
    courseId: data?.courseId ?? '',
    totalStudents: data?.totalStudents ?? 0,
    completionRate: data?.completionRate ?? 0,
    averageProgress: data?.averageProgress ?? 0,
    averageRating: data?.averageRating ?? 0,
    totalRatings: data?.totalRatings ?? 0,
    revenueThisMonth: data?.revenueThisMonth ?? 0,
    revenueLastMonth: data?.revenueLastMonth ?? 0,
    revenueTotal: data?.revenueTotal ?? 0,
    ratingsBreakdown: data?.ratingsBreakdown ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    enrollmentTrend: data?.enrollmentTrend ?? [],
  };
}

export function CourseAnalyticsDashboard({ courseId }: CourseAnalyticsDashboardProps) {
  const { data, isLoading, refetch, error } = useCourseAnalytics(courseId, { enabled: true });

  const analytics = normalizeCourseAnalytics(data!);

  const {
    totalStudents,
    completionRate,
    averageProgress,
    averageRating,
    totalRatings,
    revenueThisMonth,
    revenueLastMonth,
    revenueTotal,
    ratingsBreakdown,
    enrollmentTrend,
  } = analytics;

  // Compute revenue month-over-month growth
  const revenueGrowth = useMemo(() => {
    if (revenueLastMonth === 0) return revenueThisMonth > 0 ? 100 : 0;
    return ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;
  }, [revenueThisMonth, revenueLastMonth]);

  // Compute average revenue per student (safe division)
  const avgRevenuePerStudent = useMemo(() => {
    return totalStudents > 0 ? revenueTotal / totalStudents : 0;
  }, [revenueTotal, totalStudents]);

  // Format enrollment trend for display
  const formattedTrend = useMemo(() => {
    return enrollmentTrend.map((item) => ({
      label: MONTH_NAMES[item.month - 1] ?? `M${item.month}`,
      enrollments: item.enrollments,
    }));
  }, [enrollmentTrend]);

  if (error) {
    return (
      <div className="text-center text-destructive py-8">
        <p>Failed to load the course details. Please try again later.</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  if (isLoading) return <LoadingScreen />;

  const mainStats = [
    {
      title: 'Total Students',
      value: totalStudents.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Completion Rate',
      value: `${completionRate.toFixed(1)}%`,
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Average Rating',
      value: averageRating.toFixed(1),
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      subtitle: `${totalRatings} reviews`,
    },
    {
      title: 'Total Revenue',
      value: `$${revenueTotal.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
      subtitle: `$${revenueThisMonth.toLocaleString()} this month`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/instructor/courses/${courseId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Course Analytics</h1>
            <p className="text-muted-foreground mt-1">Performance overview and student metrics</p>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      {stat.subtitle && (
                        <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                      )}
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Enrollment Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {formattedTrend.length > 0 ? (
              <EnrollmentTrendChart data={formattedTrend} />
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                No enrollment trend data available yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overall Course Rating */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Course Ratings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <RatingChart
              averageRating={averageRating}
              ratingsBreakdown={ratingsBreakdown}
              totalRatings={totalRatings}
            />
          </CardContent>
        </Card>
      </div>

      {/* Student Metrics & Revenue Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Progress Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Student Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Average Progress</span>
                  <span className="font-semibold">{averageProgress.toFixed(1)}%</span>
                </div>
                <Progress value={averageProgress} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Completion Rate</span>
                  <span className="font-semibold">{completionRate.toFixed(1)}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {totalStudents.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{completionRate.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Revenue Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-600">
                    ${revenueTotal.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    ${revenueThisMonth.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">This Month</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Last Month</span>
                  <span className="font-bold">${revenueLastMonth.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Avg Revenue / Student</span>
                  <span className="font-bold">${avgRevenuePerStudent.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Month-over-Month Growth</span>
                  <span
                    className={`font-bold flex items-center gap-1 ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {revenueGrowth >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {revenueGrowth >= 0 ? '+' : ''}
                    {revenueGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
