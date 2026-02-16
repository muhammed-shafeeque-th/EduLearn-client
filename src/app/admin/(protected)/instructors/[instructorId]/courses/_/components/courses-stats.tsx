import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, DollarSign, Clock } from 'lucide-react';
import { getInstructorCoursesStats } from '../../../../_/libs/apis';

interface CoursesStatsProps {
  instructorId: string;
}

export async function CoursesStats({ instructorId }: CoursesStatsProps) {
  const stats = await getInstructorCoursesStats(instructorId);

  const statCards = [
    {
      title: 'Published Courses',
      value: stats.published.toString(),
      icon: BookOpen,
      description: `${stats.draft} drafts`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Total Enrollments',
      value: stats.totalEnrollments.toLocaleString(),
      icon: Users,
      description: `${stats.activeStudents} active`,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Revenue (This Month)',
      value: `₹${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: `${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth.toFixed(1)}%`,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      title: 'Avg Completion Rate',
      value: `${stats.avgCompletionRate}%`,
      icon: Clock,
      description: 'All courses',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
