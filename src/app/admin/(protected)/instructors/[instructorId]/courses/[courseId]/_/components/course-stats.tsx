import { getInstructorCourseStats } from '@/app/admin/(protected)/instructors/_/libs/apis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Star, Clock, MessageSquare, Award, Activity, TrendingUp } from 'lucide-react';

interface CourseStatsProps {
  courseId: string;
  instructorId: string;
}

function calculateRevenueGrowth(revenueTrend?: Array<{ date: string; revenue: number }>) {
  if (!revenueTrend || revenueTrend.length < 2) {
    return null;
  }
  // Assume revenueTrend is sorted oldest -> newest
  const lastMonth = revenueTrend[revenueTrend.length - 2].revenue;
  const thisMonth = revenueTrend[revenueTrend.length - 1].revenue;
  if (lastMonth === 0) {
    // Avoid division by zero; if no revenue last month, show full increase
    return thisMonth > 0 ? 100 : 0;
  }
  return ((thisMonth - lastMonth) / lastMonth) * 100;
}

export async function CourseStats({ courseId, instructorId }: CourseStatsProps) {
  const stats = await getInstructorCourseStats(instructorId, courseId);

  // Revenue info & trends (from context, revenueTrend = [{date, revenue}, ...])
  const totalRevenue = stats?.revenueTotal ?? 0;
  const monthlyRevenue = stats?.monthlyRevenue ?? 0;

  const revenueGrowth = calculateRevenueGrowth(stats?.enrollmentTrend);
  const revenueGrowthDisplay =
    revenueGrowth === null ? 'N/A' : `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%`;

  // Enrollment trend (legacy fallback, kept as previously, but may need logic)
  const enrollmentGrowth =
    (typeof stats?.enrollmentTrend === 'number' ? stats.enrollmentTrend : 0) ?? 0;

  // Compute average rating from ratingsBreakdown which is an object like {1: 40, 2: 55, ...}
  const avgRating = (() => {
    if (!stats?.ratingsBreakdown || typeof stats.ratingsBreakdown !== 'object') return null;
    let totalRatings = 0;
    let sum = 0;
    for (let rating = 1; rating <= 5; rating++) {
      const count = stats.ratingsBreakdown[rating] ?? 0;
      sum += rating * count;
      totalRatings += count;
    }
    return totalRatings ? (sum / totalRatings).toFixed(2) : null;
  })();

  // Other stat fields (some may be undefined if not in CourseAnalytics shape)
  const completionRate = stats?.completionRate ?? 0;
  const averageRating = avgRating ?? null;
  const totalReviews = stats?.totalReviews ?? null;
  const engagementRate = stats?.engagementRate ?? 0;
  const averageTimePerLesson = stats?.averageTimePerLesson ?? 0;
  const discussionPosts = stats?.discussionPosts ?? 0;
  const questionsAnswered = stats?.questionsAnswered ?? 0;
  const certificatesIssued = stats?.certificatesIssued ?? 0;

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${Number(totalRevenue).toLocaleString()}`,
      change: revenueGrowthDisplay,
      changeLabel: 'vs last month',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Monthly Revenue',
      value: `₹${Number(monthlyRevenue).toLocaleString()}`,
      change: `${enrollmentGrowth >= 0 ? '+' : ''}${enrollmentGrowth}%`,
      changeLabel: 'enrollment growth',
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
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Avg Time/Lesson</span>
              </div>
              <span className="font-semibold">{averageTimePerLesson}min</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Discussion Posts</span>
              </div>
              <span className="font-semibold">{discussionPosts}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Questions Answered</span>
              </div>
              <span className="font-semibold">{questionsAnswered}</span>
            </div>

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
      <Card>
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
      </Card>
    </div>
  );
}
