'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useSystemOverview } from '@/states/server/admin/use-admin-stats';
import { normalizeCurrencyAmount } from '@/lib/utils';

type ChangeType = 'positive' | 'negative' | 'neutral';

interface StatData {
  title: string;
  value: string;
  change: string;
  changeType: ChangeType;
  icon: React.ElementType;
}

const STAT_CONFIG: Array<{
  key: keyof NonNullable<ReturnType<typeof useSystemOverview>['data']>;
  title: string;
  icon: React.ElementType;
  valueFormatter?: (value: number) => string;
}> = [
  {
    key: 'totalUsers',
    title: 'Total Users',
    icon: Users,
  },
  {
    key: 'activeInstructors',
    title: 'Active Instructors',
    icon: GraduationCap,
  },
  {
    key: 'totalCourses',
    title: 'Total Courses',
    icon: BookOpen,
  },
  {
    key: 'monthlyRevenue',
    title: 'Monthly Revenue',
    icon: DollarSign,
    valueFormatter: (v) => {
      const normalizedRevenue = normalizeCurrencyAmount(v);
      return normalizedRevenue?.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      });
    },
  },
];

export function DashboardStats() {
  const { data, isLoading } = useSystemOverview();

  // If no backend yet, optionally, use static mock. Remove for prod.
  // Uncomment the following if you want to use fallback demo data.
  // const data = undefined; // simulate no data, mocking

  // Memoize computed stats for efficiency
  const stats: StatData[] = useMemo(() => {
    if (!data) {
      // Mock or loading values (can be empty, or hardcoded values, or partially loaded)
      return [];
    }
    return STAT_CONFIG.map(({ key, title, icon, valueFormatter }) => {
      // Example: data.changes = { totalUsers: 0.2, ... }
      const valueRaw = data[key] ?? 0;
      const changeRaw = data.changes?.[key] ?? 0;
      let changeType: ChangeType = 'neutral';

      if (typeof changeRaw === 'number') {
        if (changeRaw > 0) changeType = 'positive';
        else if (changeRaw < 0) changeType = 'negative';
      }

      // Format value and change
      const value =
        valueFormatter && typeof valueRaw === 'number'
          ? valueFormatter(valueRaw)
          : (valueRaw?.toLocaleString?.() ?? String(valueRaw));

      // Format change (as +X% or -X%)
      let change = '';
      if (typeof changeRaw === 'number') {
        const percent = Math.abs(changeRaw * 100).toFixed(1) + '%';
        change = (changeRaw > 0 ? '+' : changeRaw < 0 ? '-' : '') + percent;
      }

      return {
        title,
        value,
        change,
        changeType,
        icon,
      };
    });
  }, [data]);

  // Show skeleton while loading or before data is available
  if (isLoading || !data) {
    return (
      <div
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Loading stats"
      >
        {Array.from({ length: STAT_CONFIG.length }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      aria-label="Dashboard Stats"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {typeof stat.change === 'string' && stat.change !== '' ? (
                  <p
                    className={`text-xs flex items-center ${
                      stat.changeType === 'positive'
                        ? 'text-green-600'
                        : stat.changeType === 'negative'
                          ? 'text-red-600'
                          : 'text-muted-foreground'
                    }`}
                    aria-label={`Change: ${stat.change} from last month`}
                  >
                    {stat.change} from last month
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
