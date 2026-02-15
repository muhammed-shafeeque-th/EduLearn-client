'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Star,
  Plus,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { useCurrentUser } from '@/states/server/user/use-current-user';
import { ERROR_CODES } from '@/lib/errors/error-codes';
import { useInstructorStats } from '@/states/server/user/use-user-stats';
import { useInstructorCourses } from '@/states/server/course/use-courses';

/**
 * Main dashboard for instructors.
 * Provides a summary of course stats, quick actions, and recent activity.
 */
export default function InstructorDashboard() {
  const router = useRouter();

  // Fetch current user
  const {
    data: user,
    isLoading: isUserLoading,
    isError: userError,
  } = useCurrentUser({ enabled: true });

  // Fetch instructor statistics only if user exists and is not blocked
  const {
    data: instructorStats,
    isLoading: isStatsLoading,
    isError: statsError,
  } = useInstructorStats(user?.id ?? '', { enabled: !!user && user.status !== 'blocked' });

  const { courses: courses } = useInstructorCourses(user?.id, {
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: 1,
    pageSize: 3,
  });

  // Redirect if user is not found or blocked
  useEffect(() => {
    if (!isUserLoading && (!user || user.status === 'blocked')) {
      router.replace(`/?error_code=${ERROR_CODES.FORBIDDEN}`);
    }
  }, [isUserLoading, user, router]);

  // Placeholder: Replace with data from instructorStats if/when available
  const recentCourses = useMemo(
    () =>
      courses?.length
        ? courses.map((course) => ({
            id: course.id,
            title: course.title,
            students: course.students,
            rating: course.rating,
            revenue: course.price * course.students, // TODO: Add proper data received from backend
          }))
        : [
            // fallback
            { id: 1, title: 'React Masterclass', students: 245, rating: 4.9, revenue: 4800 },
            { id: 2, title: 'Node.js Complete Guide', students: 189, rating: 4.7, revenue: 3600 },
            {
              id: 3,
              title: 'UI/UX Design Fundamentals',
              students: 167,
              rating: 4.8,
              revenue: 2800,
            },
          ],
    [courses]
  );

  // Prefer real stats if present, fallback to mock only if unavailable
  const stats = useMemo(() => {
    if (instructorStats) {
      return {
        totalStudents: instructorStats.totalStudents ?? 0,
        totalRevenue: instructorStats.totalRevenue ?? 0,
        activeCourses: instructorStats.activeCourses ?? 0,
        rating: instructorStats.averageRating ?? 0,
        totalHours: instructorStats.totalContentHours ?? 0,
        completionRate: instructorStats.completionRate ?? 0,
      };
    }
    // Remove mock/fake data in production; only used here as fallback
    return {
      totalStudents: 0,
      totalRevenue: 0,
      activeCourses: 0,
      rating: 0,
      totalHours: 0,
      completionRate: 0,
    };
  }, [instructorStats]);

  // Render loading state
  if (isUserLoading || isStatsLoading) {
    return (
      <div className="p-8 text-center">
        <span className="text-gray-700 dark:text-gray-300">Loading dashboard...</span>
      </div>
    );
  }

  // Error states
  if (userError || statsError) {
    return (
      <div className="p-8 text-center text-red-600 dark:text-red-400">
        Failed to load dashboard. Please refresh.
      </div>
    );
  }

  // Defensive fallback: if user removed after loading
  if (!user) {
    return null;
  }

  const quickActions = [
    { label: 'Create Course', href: '/instructor/courses/create', icon: Plus, color: 'orange' },
    // { label: 'View Analytics', href: '/instructor/analytics', icon: BarChart3, color: 'blue' },
    {
      label: 'Student Messages',
      href: '/instructor/chats',
      icon: MessageSquare,
      color: 'green',
    },
    // { label: 'Schedule Session', href: '/instructor/schedule', icon: Calendar, color: 'purple' },
  ];

  const statsGrid = [
    {
      label: 'Total Students',
      value: stats.totalStudents?.toLocaleString(),
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue?.toLocaleString()}`,
      icon: DollarSign,
      color: 'green',
    },
    { label: 'Active Courses', value: stats.activeCourses, icon: BookOpen, color: 'orange' },
    { label: 'Average Rating', value: stats.rating, icon: Star, color: 'yellow' },
    { label: 'Content Hours', value: `${stats.totalHours}h`, icon: Clock, color: 'purple' },
    {
      label: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      color: 'indigo',
    },
  ];

  // Recent Activity placeholder (could come from API in real app)
  const recentActivities = [
    {
      type: 'enrollment',
      message: '5 new students enrolled in React Masterclass',
      time: '2 hours ago',
    },
    {
      type: 'review',
      message: 'New 5-star review on Node.js Complete Guide',
      time: '4 hours ago',
    },
    {
      type: 'message',
      message: '3 new student messages waiting for response',
      time: '6 hours ago',
    },
    {
      type: 'completion',
      message: '12 students completed UI/UX Design Fundamentals',
      time: '1 day ago',
    },
  ];

  // Helper for dynamic Tailwind classes
  const getColorClass = (color: string, prefix: string = '', dark = false) =>
    // Use only allowed tailwind classes
    dark ? `dark:bg-${color}-900/30` : `${prefix}${color}-100`;

  const getTextColorClass = (color: string) => `text-${color}-500`;

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-blue-500 rounded-2xl p-8 text-white"
      >
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName} {user?.lastName}! 👋
        </h1>
        <p className="text-primary/10 mb-6">
          Ready to inspire and educate? Your students are waiting for your next amazing course.
        </p>

        <div className="flex items-center space-x-6">
          <Link
            href="/instructor/courses/create"
            className="bg-white text-primary px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Course
          </Link>
          <Link
            href="/instructor/courses"
            className="border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors"
          >
            View All Courses
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsGrid.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                {/* TODO: Consider clsx/twMerge for dynamic classnames in real production */}
                <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-500`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={action.href}
                  className="block p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
                >
                  <div
                    className={`w-12 h-12 bg-${action.color}-100 dark:bg-${action.color}-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`w-6 h-6 text-${action.color}-500`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                    {action.label}
                  </h3>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Top Performing Courses
          </h2>
          <div className="space-y-4">
            {recentCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    ${course.revenue?.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {course.students}
                    </span>
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                      {course.rating}
                    </span>
                  </div>
                  <button
                    className="text-primary dark:text-primary/40 hover:underline"
                    onClick={() => {
                      router.push(`/instructor/courses/${course.id}`);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
