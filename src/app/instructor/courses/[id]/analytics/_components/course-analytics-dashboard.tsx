'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Award,
  DollarSign,
  Eye,
  Clock,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RevenueChart } from './revenue-chart';
import { RatingChart } from './rating-chart';
import { CourseOverviewChart } from './course-overview-chart';
import { ProfileViewChart } from './profile-view-chart';
import { CourseAnalytics } from '@/types/course';

interface CourseAnalyticsDashboardProps {
  analytics: {
    courseId: string;
    title: string;
    analytics: CourseAnalytics;
  };
}

export function CourseAnalyticsDashboard({ analytics }: CourseAnalyticsDashboardProps) {
  const { courseId, title, analytics: data } = analytics;
  const [timeRange, setTimeRange] = useState('this-month');

  const mainStats = [
    {
      title: 'Total Students',
      value: data.studentMetrics?.total.toLocaleString() ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      change: '+12% this month',
    },
    {
      title: 'Completion Rate',
      value: `${data.completionRate.toFixed(1)}%`,
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      change: '+5.2% from last month',
    },
    {
      title: 'Engagement Rate',
      value: `${data.engagementRate.toFixed(1) ?? 0}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      change: '+8.1% from last month',
    },
    {
      title: 'Total Revenue',
      value: `${data.revenueTotal.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      change: `${data.revenueThisMonth.toFixed(0)} this month`,
    },
  ];

  const recentActivities = [
    {
      type: 'comment',
      user: 'Kevin',
      action: 'commented on your lesson',
      content: '"What is ux?" in 2021 UX/UI design with figma',
      time: '2m ago',
      avatar: 'K',
    },
    {
      type: 'rating',
      user: 'John',
      action: 'gave a 5 star rating on your course',
      content: '2021 UX/UI design with figma',
      time: '5 mins ago',
      avatar: 'J',
    },
    {
      type: 'purchase',
      user: 'Saloni',
      action: 'purchase your course',
      content: '2021 UX/UI design with figma',
      time: '8 mins ago',
      avatar: 'S',
    },
    {
      type: 'purchase',
      user: 'Anil',
      action: 'purchase your course',
      content: '2021 UX/UI design with figma',
      time: '12 mins ago',
      avatar: 'A',
    },
  ];

  const totalRatings = Object.values(data.ratingsBreakdown).reduce((sum, count) => sum + count, 0);
  const averageRating =
    Object.entries(data.ratingsBreakdown).reduce(
      (sum, [rating, count]) => sum + parseInt(rating) * count,
      0
    ) / totalRatings;

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
            <p className="text-muted-foreground mt-1">{title}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Report</Button>
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
                      <p className="text-xs text-muted-foreground">{stat.change}</p>
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

      {/* Charts Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            <Select defaultValue="today">
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-medium">
                    {activity.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{' '}
                      <span className="text-muted-foreground">{activity.action}</span>{' '}
                      <span className="font-medium">&quot;{activity.content}&quot;</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Revenue</CardTitle>
            <Select defaultValue="this-month">
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">This month</SelectItem>
                <SelectItem value="last-month">Last month</SelectItem>
                <SelectItem value="this-year">This year</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-4">
            <RevenueChart data={data.enrollmentTrend} totalRevenue={data.revenueThisMonth} />
          </CardContent>
        </Card>

        {/* Profile View Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Profile View</CardTitle>
            <Select defaultValue="today">
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-4">
            <ProfileViewChart data={data.enrollmentTrend} totalViews={10} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Course Rating */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Overall Course Rating</CardTitle>
            <Select defaultValue="this-week">
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This week</SelectItem>
                <SelectItem value="this-month">This month</SelectItem>
                <SelectItem value="this-year">This year</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-4">
            <RatingChart
              averageRating={averageRating}
              ratingsBreakdown={data.ratingsBreakdown}
              totalRatings={totalRatings}
            />
          </CardContent>
        </Card>

        {/* Course Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Course Overview</CardTitle>
            <Select defaultValue="this-week">
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This week</SelectItem>
                <SelectItem value="this-month">This month</SelectItem>
                <SelectItem value="this-year">This year</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-4">
            <CourseOverviewChart
              enrollmentData={data.enrollmentTrend}
              completionRate={data.completionRate}
              engagementRate={data.engagementRate}
            />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Details</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Progress Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>0-25% Complete</span>
                      <span>2,345 students</span>
                    </div>
                    <Progress value={15.2} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>26-50% Complete</span>
                      <span>4,567 students</span>
                    </div>
                    <Progress value={29.6} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>51-75% Complete</span>
                      <span>5,234 students</span>
                    </div>
                    <Progress value={33.9} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>76-100% Complete</span>
                      <span>3,274 students</span>
                    </div>
                    <Progress value={21.3} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {data.averageProgress.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Progress</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {data.completionRate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {data.engagementRate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Engagement</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">4.2</p>
                      <p className="text-sm text-muted-foreground">Avg Session (hrs)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Most Watched Lessons */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.contentAnalytics.mostWatchedLessons.map((lesson, index) => (
                    <div
                      key={lesson.lessonId}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{lesson.lessonTitle}</h4>
                          <p className="text-sm text-muted-foreground">
                            Engagement: {(Math.random() * 30 + 70).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{lesson.viewCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{lesson.avgWatchTime.toFixed(1)}min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Activity className="w-4 h-4" />
                          <span>{(Math.random() * 30 + 70).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Drop-off Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Content Performance Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.contentAnalytics.dropOffPoints.map((point) => (
                    <div
                      key={`${point.sectionId}-${point.lessonId}`}
                      className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-red-600 dark:text-red-400">
                            !
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-red-800 dark:text-red-200">
                            High Drop-off Point
                          </h4>
                          <p className="text-sm text-red-600 dark:text-red-400">
                            Section: {point.sectionId} • Lesson: {point.lessonId}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="destructive">
                          {point.dropOffRate.toFixed(1)}% drop-off
                        </Badge>
                        <Button size="sm" variant="outline">
                          Review Content
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        ${data.revenueTotal.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        ${data.revenueThisMonth.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">This Month</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Course Sales</span>
                        <span>${(data.revenueTotal * 0.85).toFixed(0)}</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Certificates</span>
                        <span>${(data.revenueTotal * 0.1).toFixed(0)}</span>
                      </div>
                      <Progress value={10} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Other</span>
                        <span>${(data.revenueTotal * 0.05).toFixed(0)}</span>
                      </div>
                      <Progress value={5} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium">Average Revenue per Student</span>
                      <span className="font-bold">
                        ${(data.revenueTotal / data.totalStudents).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium">Conversion Rate</span>
                      <span className="font-bold">3.2%</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium">Refund Rate</span>
                      <span className="font-bold text-green-600">1.8%</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium">Growth Rate (MoM)</span>
                      <span className="font-bold text-green-600">+23.5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
