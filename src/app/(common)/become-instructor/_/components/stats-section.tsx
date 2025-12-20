'use client';

import React, { JSX } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Award, Globe, TrendingUp, LucideIcon } from 'lucide-react';

// 1. Define type for stat object for better type-safety and documentation
type Stat = {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
};

// 2. Use 'const' assertion for the stats array
const STATS: readonly Stat[] = [
  {
    value: '67.1k',
    label: 'Students',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    value: '26k',
    label: 'Courses',
    icon: BookOpen,
    color: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  {
    value: '72',
    label: 'Countries',
    icon: Globe,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  {
    value: '99.9%',
    label: 'Success Rate',
    icon: Award,
    color: 'text-primary/50',
    bgColor: 'bg-primary/10 dark:bg-primary-90',
  },
  {
    value: '57',
    label: 'Growth Rate',
    icon: TrendingUp,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
];

// 3. Extract StatCard as a memoized component for reusability
interface StatCardProps {
  stat: Stat;
  index: number;
}

const StatCard: React.FC<StatCardProps> = React.memo(({ stat, index }) => {
  const Icon = stat.icon;
  return (
    <motion.div
      key={stat.label}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="text-center space-y-3"
      aria-label={`${stat.label}: ${stat.value}`}
    >
      <div
        className={`inline-flex items-center justify-center w-16 h-16 ${stat.bgColor} rounded-2xl`}
      >
        <Icon className={`w-8 h-8 ${stat.color}`} aria-hidden="true" />
      </div>
      <div>
        <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          {stat.value}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
      </div>
    </motion.div>
  );
});
StatCard.displayName = 'StatCard';

// 4. Section component with accessibility best practices and structure
export function StatsSection(): JSX.Element {
  return (
    <section
      className="py-12 lg:py-20 bg-white dark:bg-gray-900"
      aria-labelledby="instructor-stats-title"
    >
      <div className="container mx-auto px-4">
        <h2 id="instructor-stats-title" className="sr-only">
          Instructor Platform Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8">
          {STATS.map((stat, index) => (
            <StatCard stat={stat} index={index} key={stat.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
