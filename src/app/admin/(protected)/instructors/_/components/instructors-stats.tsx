import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Star, TrendingUp } from 'lucide-react';
import { getInstructorsStats } from '../libs/apis';

type StatCard = {
  title: string;
  value: string;
  icon: React.ElementType;
  change: string;
  changeLabel: string;
  color: string;
  bgColor: string;
};

export async function InstructorsStats() {
  const stats = await getInstructorsStats();

  const statCards: StatCard[] = [
    {
      title: 'Total Instructors',
      value: stats.total.toLocaleString(),
      icon: Users,
      change: `+${stats.newThisMonth}`,
      changeLabel: 'this month',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Active Instructors',
      value: stats.active.toLocaleString(),
      icon: TrendingUp,
      change: stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}%` : '--',
      changeLabel: 'of total',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses?.toLocaleString() ?? 0,
      icon: BookOpen,
      change: `+${stats.newCourses}`,
      changeLabel: 'this month',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Avg Rating',
      value: stats.averageRating?.toFixed(1) ?? 0,
      icon: Star,
      change: stats.ratingChange ? `+${(stats.ratingChange * 100).toFixed(1)}%` : '+0%',
      changeLabel: 'vs last month',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
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
                <Icon className={`h-4 w-4 ${stat.color}`} aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> {stat.changeLabel}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
