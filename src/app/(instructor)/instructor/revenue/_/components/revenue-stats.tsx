'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RevenueData {
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  thisWeekEarnings: number;
  growthRate: number;
  transactionCount: number;
  averageOrderValue: number;
}

export const RevenueStats: React.FC<{ revenueData: RevenueData }> = ({ revenueData }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const monthGrowth = calculateGrowth(revenueData.thisMonthEarnings, revenueData.lastMonthEarnings);

  const stats = [
    {
      title: 'This Month',
      value: formatCurrency(revenueData.thisMonthEarnings),
      subtitle: `vs ${formatCurrency(revenueData.lastMonthEarnings)} last month`,
      icon: DollarSign,
      trend: monthGrowth,
      color: 'text-green-600',
    },
    {
      title: 'This Week',
      value: formatCurrency(revenueData.thisWeekEarnings),
      subtitle: 'Last 7 days',
      icon: TrendingUp,
      trend: 12.5,
      color: 'text-blue-600',
    },
    {
      title: 'Lifetime Earnings',
      value: formatCurrency(revenueData.lifetimeEarnings),
      subtitle: `${revenueData.transactionCount} transactions`,
      icon: DollarSign,
      color: 'text-purple-600',
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(revenueData.averageOrderValue),
      subtitle: 'Per enrollment',
      icon: ShoppingCart,
      trend: 8.3,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-${stat.color}/10`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                {stat.trend !== undefined && (
                  <Badge
                    variant={stat.trend > 0 ? 'default' : 'destructive'}
                    className="flex items-center space-x-1"
                  >
                    {stat.trend > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{Math.abs(stat.trend).toFixed(1)}%</span>
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
