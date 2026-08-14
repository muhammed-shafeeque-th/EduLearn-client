'use client';

import { StatsSkeleton } from '@/app/(admin)/admin/(protected)/(dashboard)/@stats/_/stats-skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useInstructorCourseStats } from '@/states/server/admin/use-admin-stats';
import { DollarSign, Star, Award, TrendingUp } from 'lucide-react';

interface CourseStatsProps {
  courseId: string;
  instructorId: string;
}

export default function CourseStats({ courseId, instructorId }: CourseStatsProps) {
  const { stats, isLoading } = useInstructorCourseStats(instructorId, courseId);

  const totalRevenue = stats?.totalRevenue ?? 0;
  const revenueGrowth = stats?.revenueGrowth ?? 0;
  const monthlyRevenue = stats?.revenueThisMonth ?? 0;
  const completionRate = stats?.completionRate ?? 0;
  const averageRating = stats?.averageRating ?? 0;
  const totalReviews = stats?.totalReviews ?? 0;
  const engagementRate = stats?.engagementRate ?? 0;
  // const averageTimePerLesson = stats?.averageTimePerLesson ?? 0;
  // const discussionPosts = stats?.discussionPosts ?? 0;
  // const questionsAnswered = stats?.questionsAnswered ?? 0;
  const certificatesIssued = stats?.totalStudents ?? 0;

  if (isLoading || !stats) {
    return <StatsSkeleton />;
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      change: revenueGrowth > 0 ? revenueGrowth : 0,
      changeLabel: 'vs last month',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Monthly Revenue',
      value: `₹${monthlyRevenue.toLocaleString()}`,
      change: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}%`,
      changeLabel: 'vs last month',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      change: 'Above average',
      changeLabel: 'industry standard',
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Avg Rating',
      value: averageRating !== null ? averageRating.toString() : 'N/A',
      change: totalReviews !== null ? `${totalReviews} reviews` : '',
      changeLabel: totalReviews !== null ? 'total reviews' : '',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                {stat.change && (
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{stat.change}</span> {stat.changeLabel}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Engagement Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Student Engagement</span>
              <span>{engagementRate}%</span>
            </div>
            <Progress value={Number(engagementRate)} className="h-2" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Avg Time/Lesson</span>
              </div>
              <span className="font-semibold">{averageTimePerLesson}min</span>
            </div> */}

            {/* <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Discussion Posts</span>
              </div>
              <span className="font-semibold">{discussionPosts}</span>
            </div> */}

            {/* <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Questions Answered</span>
              </div>
              <span className="font-semibold">{questionsAnswered}</span>
            </div> */}

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Certificates Issued</span>
              </div>
              <span className="font-semibold">{certificatesIssued}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Quarter Performance</span>
                <span className="text-blue-600">↑ 15%</span>
              </div>
              <div className="text-xs text-muted-foreground">Strong performance this quarter</div>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
