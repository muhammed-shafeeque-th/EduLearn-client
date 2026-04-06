'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Layers, BookOpen, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminCategories } from '@/states/server/category/use-categories';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoriesStats() {
  const { categories, isLoading } = useAdminCategories(true); // include deleted for stats

  const activeCategories = categories.filter((c) => c.isActive && !c.deletedAt);
  const totalSubcategories = categories.reduce(
    (acc, cat) => acc + (cat.subcategories?.length || 0),
    0
  );
  const totalCourses = categories.reduce((acc, cat) => acc + cat.courseCount, 0);
  const avgCoursesPerCategory =
    activeCategories.length > 0 ? Math.round(totalCourses / activeCategories.length) : 0;

  const stats = [
    {
      title: 'Total Categories',
      value: activeCategories.length.toString(),
      icon: FolderOpen,
      color: 'text-blue-600',
    },
    {
      title: 'Subcategories',
      value: totalSubcategories.toString(),
      icon: Layers,
      color: 'text-green-600',
    },
    {
      title: 'Total Courses',
      value: totalCourses.toString(),
      icon: BookOpen,
      color: 'text-purple-600',
    },
    {
      title: 'Avg per Category',
      value: isNaN(avgCoursesPerCategory) ? '0' : avgCoursesPerCategory.toString(),
      icon: TrendingUp,
      color: 'text-orange-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
