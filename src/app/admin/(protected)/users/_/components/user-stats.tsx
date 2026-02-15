import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Star, ShieldOff } from 'lucide-react';
import { getUsersStats } from '../../../instructors/_/libs/apis';

export async function UsersStats() {
  // Get stats from API
  const stats = await getUsersStats();

  // Defend: fallback for bad API response shape
  const safeStats = {
    total: stats?.total ?? 0,
    active: stats?.active ?? 0,
    inactive: stats?.inactive ?? 0,
    blocked: stats?.blocked ?? 0,
  };

  const statCards = [
    {
      title: 'Total Users',
      value: safeStats.total.toLocaleString(),
      icon: Users,
      change: `+${safeStats.active}`,
      changeLabel: 'active',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Active Users',
      value: safeStats.active.toLocaleString(),
      icon: BookOpen,
      change:
        safeStats.total > 0 ? `${Math.round((safeStats.active / safeStats.total) * 100)}%` : '0%',
      changeLabel: 'of total',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Inactive Users',
      value: safeStats.inactive.toLocaleString(),
      icon: Star,
      change:
        safeStats.total > 0 ? `${Math.round((safeStats.inactive / safeStats.total) * 100)}%` : '0%',
      changeLabel: 'of total',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      title: 'Blocked Users',
      value: safeStats.blocked.toLocaleString(),
      icon: ShieldOff,
      change:
        safeStats.total > 0
          ? `${Math.round((safeStats.blocked / safeStats.total) * 100)}%`
          : 'of total',
      changeLabel: 'of total',
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
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
              <p className="text-xs text-muted-foreground">
                <span className={stat.color}>{stat.change}</span> {stat.changeLabel}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
