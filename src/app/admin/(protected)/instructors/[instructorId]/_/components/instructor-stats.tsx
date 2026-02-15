import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, BookOpen, MessageSquare, Clock, Activity } from 'lucide-react';
import { getInstructorCoursesStats } from '../../../_/libs/apis';

interface InstructorStatsProps {
  instructorId: string;
}

// Types from InstructorCoursesStats API return type
type CourseStatsResponse = Awaited<ReturnType<typeof getInstructorCoursesStats>>;

export async function InstructorStats({ instructorId }: InstructorStatsProps) {
  const instructorCoursesStats: CourseStatsResponse = await getInstructorCoursesStats(instructorId);

  // Defensive fallback if data not returned as expected
  const stats = instructorCoursesStats ?? {};

  // Map API data to expected display variables (with fallback defaults)
  const monthlyRevenue = stats.monthlyRevenue ?? 0;
  const revenueGrowth = stats.revenueGrowth ?? 0;
  const monthlyEnrollments = stats.totalEnrollments ?? 0;
  // Enrollment growth not available in stats - set placeholder
  const enrollmentGrowth = 0;
  const averageRating = stats.avgCompletionRate ?? 0;
  // totalReviews, responseTime not in stats - placeholder values
  const totalReviews = 0;
  const responseTime = 0;
  const completionRate = stats.avgCompletionRate ?? 0;
  // engagementRate not in stats - placeholder
  const engagementRate = 0;
  const activeCourses = stats.published ?? 0;
  // totalDiscussions not in stats - placeholder
  const totalDiscussions = 0;
  // hoursTeached not in stats - placeholder
  const hoursTeached = 0;

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
              <span className="font-semibold">${monthlyRevenue}</span>
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

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Student Engagement</span>
              <span>{engagementRate}%</span>
            </div>
            <Progress value={engagementRate} className="h-2" />
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
            <div className="flex justify-between text-sm">
              <span>Response Time</span>
              <span className="font-semibold">&lt; {responseTime}h</span>
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

            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-green-500" />
                <span className="text-sm">Discussions</span>
              </div>
              <span className="font-semibold">{totalDiscussions}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Hours Taught</span>
              </div>
              <span className="font-semibold">{hoursTeached.toLocaleString()}h</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                action: 'Published new lesson',
                course: 'Advanced React',
                time: '2 hours ago',
                type: 'success',
              },
              {
                action: 'Responded to 5 questions',
                course: 'Next.js Course',
                time: '4 hours ago',
                type: 'info',
              },
              {
                action: 'Updated course materials',
                course: 'TypeScript Basics',
                time: '1 day ago',
                type: 'warning',
              },
              {
                action: 'Completed live session',
                course: 'React Hooks',
                time: '2 days ago',
                type: 'success',
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-2">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success'
                      ? 'bg-green-500'
                      : activity.type === 'info'
                        ? 'bg-blue-500'
                        : activity.type === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.course}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
