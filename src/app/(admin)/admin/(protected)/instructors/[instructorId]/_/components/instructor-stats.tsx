'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, BookOpen, Clock, Activity } from 'lucide-react';
import { useInstructorCoursesStats } from '@/states/server/admin/use-admin-stats';

interface InstructorStatsProps {
  instructorId: string;
}

export function InstructorStats({ instructorId }: InstructorStatsProps) {
  const { stats } = useInstructorCoursesStats(instructorId);

  const monthlyRevenue = stats?.monthlyRevenue ?? 0;
  const revenueGrowth = stats?.revenueGrowth ?? 0;
  const monthlyEnrollments = stats?.totalEnrollments ?? 0;
  const enrollmentGrowth = stats?.enrollmentGrowth ?? 0;
  const averageRating = stats?.averageRating ?? 0;
  const totalReviews = stats?.totalReviews ?? 0;
  const completionRate = stats?.avgCompletionRate ?? 0;
  const activeCourses = stats?.published ?? 0;
  const hoursTaught = stats?.totalHoursTaught ?? 0;

  return (
    <div className="space-y-6">
      {/* Revenue & Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue & Growth
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Monthly Revenue</span>
              <span className="font-semibold">₹{monthlyRevenue}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Growth Rate</span>
              <span className="font-semibold text-green-600">+{revenueGrowth}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Monthly Enrollments</span>
              <span className="font-semibold">{monthlyEnrollments}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Enrollment Growth</span>
              <span className="font-semibold text-green-600">+{enrollmentGrowth}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Course Completion Rate</span>
              <span>{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between text-sm">
              <span>Average Rating</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold">{averageRating}</span>
                <span className="text-yellow-400">★</span>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Reviews</span>
              <span className="font-semibold">{totalReviews}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Active Courses</span>
              </div>
              <span className="font-semibold">{activeCourses}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Hours Taught</span>
              </div>
              <span className="font-semibold">{hoursTaught.toLocaleString()}h</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
