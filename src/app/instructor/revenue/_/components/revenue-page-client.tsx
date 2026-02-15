'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  RefreshCcw,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  DollarSign,
  TrendingUp,
  Activity,
} from 'lucide-react';
import {
  useCurrentUserWallet,
  useInfiniteWalletTransactions,
} from '@/states/server/wallet/use-wallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TransactionList } from './transaction-list';
import { RevenueChart } from './revenue-chart';
// import { ExportReports } from './export-report';

export const RevenuePageClient: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState('30d');

  const {
    wallet,
    isLoading: isWalletLoading,
    isError: isWalletError,
    error: walletError,
    refetch: refetchWallet,
  } = useCurrentUserWallet({ enabled: true });

  const {
    data: transactionsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isTransactionsLoading,
  } = useInfiniteWalletTransactions({ pageSize: 20 }, { enabled: true });

  const allTransactions = useMemo(() => {
    if (!transactionsData?.pages) return wallet?.transactions || [];
    return transactionsData.pages.flatMap((page) => page.items);
  }, [transactionsData, wallet?.transactions]);

  const revenueStats = useMemo(() => {
    if (!allTransactions.length) {
      return {
        totalEarnings: wallet?.balance || 0,
        thisMonthEarnings: 0,
        lastMonthEarnings: 0,
        thisWeekEarnings: 0,
        todayEarnings: 0,
        growthRate: 0,
        transactionCount: 0,
        averageTransactionValue: 0,
        pendingAmount: 0,
        completedTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0,
      };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const incomeTypes = ['deposit', 'purchase', 'refund'];
    const incomeTransactions = allTransactions.filter(
      (t) => incomeTypes.includes(t.type.toLowerCase()) && t.amount > 0
    );

    const thisMonthTxns = incomeTransactions.filter((t) => new Date(t.timestamp) >= startOfMonth);

    const lastMonthTxns = incomeTransactions.filter((t) => {
      const date = new Date(t.timestamp);
      return date >= startOfLastMonth && date <= endOfLastMonth;
    });

    const thisWeekTxns = incomeTransactions.filter((t) => new Date(t.timestamp) >= startOfWeek);

    const todayTxns = incomeTransactions.filter((t) => new Date(t.timestamp) >= startOfDay);

    const thisMonthEarnings = thisMonthTxns.reduce((sum, t) => sum + t.amount, 0);
    const lastMonthEarnings = lastMonthTxns.reduce((sum, t) => sum + t.amount, 0);
    const thisWeekEarnings = thisWeekTxns.reduce((sum, t) => sum + t.amount, 0);
    const todayEarnings = todayTxns.reduce((sum, t) => sum + t.amount, 0);

    const growthRate =
      lastMonthEarnings > 0
        ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100
        : 0;

    const totalEarnings = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const averageTransactionValue =
      incomeTransactions.length > 0 ? totalEarnings / incomeTransactions.length : 0;

    const pendingAmount = allTransactions
      .filter((t) => t.status.toLowerCase() === 'pending')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const completedTransactions = allTransactions.filter(
      (t) => t.status.toLowerCase() === 'complete' || t.status.toLowerCase() === 'completed'
    ).length;

    const pendingTransactions = allTransactions.filter(
      (t) => t.status.toLowerCase() === 'pending'
    ).length;

    const failedTransactions = allTransactions.filter(
      (t) => t.status.toLowerCase() === 'failed'
    ).length;

    return {
      totalEarnings,
      thisMonthEarnings,
      lastMonthEarnings,
      thisWeekEarnings,
      todayEarnings,
      growthRate,
      transactionCount: incomeTransactions.length,
      averageTransactionValue,
      pendingAmount,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
    };
  }, [allTransactions, wallet?.balance]);

  if (isWalletLoading) {
    return <RevenueLoadingSkeleton />;
  }

  if (isWalletError || !wallet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold">Failed to Load Wallet</h3>
                <p className="text-sm text-muted-foreground">
                  {walletError?.message || 'An error occurred'}
                </p>
              </div>
            </div>
            <Button onClick={() => refetchWallet()} className="w-full">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wallet.currency || 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Revenue & Wallet</h1>
            <p className="text-muted-foreground mt-1">
              Manage your earnings and track transactions
            </p>
          </div>
          {/* <ExportReports wallet={wallet} transactions={allTransactions} /> */}
        </motion.div>

        {/* Wallet Balance Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden border-2">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
            <CardContent className="relative p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Main Balance */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-primary rounded-xl shadow-lg">
                      <Wallet className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
                      <h2 className="text-5xl font-bold tracking-tight">
                        {formatCurrency(wallet.balance)}
                      </h2>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button size="lg" className="flex-1">
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Withdraw
                    </Button>
                    <Button variant="outline" size="lg" className="flex-1">
                      <ArrowDownRight className="h-4 w-4 mr-2" />
                      Add Funds
                    </Button>
                  </div>

                  {wallet.updatedAt && (
                    <p className="text-xs text-muted-foreground">
                      Last updated: {new Date(wallet.updatedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-card/50 backdrop-blur">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <p className="text-sm text-muted-foreground">This Month</p>
                    </div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(revenueStats.thisMonthEarnings)}
                    </p>
                    <div className="flex items-center space-x-1 mt-2">
                      {revenueStats.growthRate > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-600" />
                      )}
                      <span
                        className={`text-xs font-medium ${revenueStats.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {revenueStats.growthRate > 0 ? '+' : ''}
                        {revenueStats.growthRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border bg-card/50 backdrop-blur">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <p className="text-sm text-muted-foreground">This Week</p>
                    </div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(revenueStats.thisWeekEarnings)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Last 7 days</p>
                  </div>

                  <div className="p-4 rounded-lg border bg-card/50 backdrop-blur">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <p className="text-sm text-muted-foreground">Today</p>
                    </div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(revenueStats.todayEarnings)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Real-time</p>
                  </div>

                  <div className="p-4 rounded-lg border bg-card/50 backdrop-blur">
                    <div className="flex items-center space-x-2 mb-2">
                      <Wallet className="h-4 w-4 text-orange-600" />
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(revenueStats.pendingAmount)}
                    </p>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {revenueStats.pendingTransactions} transactions
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <Badge variant="outline" className="text-green-600">
                  +{revenueStats.growthRate.toFixed(1)}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
              <p className="text-2xl font-bold">{formatCurrency(revenueStats.totalEarnings)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {revenueStats.transactionCount} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <Badge variant="outline">{allTransactions.length}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Transactions</p>
              <p className="text-2xl font-bold">{allTransactions.length}</p>
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex-1">
                  <Progress
                    value={(revenueStats.completedTransactions / allTransactions.length) * 100}
                    className="h-1"
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {revenueStats.completedTransactions} completed
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <Badge variant="secondary">Avg</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Avg Transaction</p>
              <p className="text-2xl font-bold">
                {formatCurrency(revenueStats.averageTransactionValue)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Per transaction</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Wallet className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <Badge variant="outline">{wallet.currency}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Currency</p>
              <p className="text-2xl font-bold">{wallet.currency}</p>
              <p className="text-xs text-muted-foreground mt-2">
                User ID: {wallet.userId.slice(0, 8)}...
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">
              Transactions
              <Badge variant="secondary" className="ml-2">
                {allTransactions.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <RevenueChart
                      transactions={allTransactions}
                      timeFilter={timeFilter}
                      onTimeFilterChange={setTimeFilter}
                      currency={wallet.currency}
                    />
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Transaction Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-green-500" />
                            <span>Completed</span>
                          </div>
                          <span className="font-medium">{revenueStats.completedTransactions}</span>
                        </div>
                        <Progress
                          value={
                            (revenueStats.completedTransactions / allTransactions.length) * 100
                          }
                          className="h-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-yellow-500" />
                            <span>Pending</span>
                          </div>
                          <span className="font-medium">{revenueStats.pendingTransactions}</span>
                        </div>
                        <Progress
                          value={(revenueStats.pendingTransactions / allTransactions.length) * 100}
                          className="h-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-red-500" />
                            <span>Failed</span>
                          </div>
                          <span className="font-medium">{revenueStats.failedTransactions}</span>
                        </div>
                        <Progress
                          value={(revenueStats.failedTransactions / allTransactions.length) * 100}
                          className="h-2"
                        />
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total</span>
                          <span className="font-semibold">{allTransactions.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <TransactionList
                  transactions={allTransactions}
                  isLoading={isTransactionsLoading}
                  showAll={false}
                  currency={wallet.currency}
                />
              </motion.div>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <TransactionList
                  transactions={allTransactions}
                  isLoading={isTransactionsLoading}
                  showAll={true}
                  currency={wallet.currency}
                  hasMore={hasNextPage}
                  onLoadMore={fetchNextPage}
                  isLoadingMore={isFetchingNextPage}
                />
              </motion.div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <RevenueChart
                  transactions={allTransactions}
                  timeFilter={timeFilter}
                  onTimeFilterChange={setTimeFilter}
                  currency={wallet.currency}
                  showComparison={true}
                />
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TransactionTypeBreakdown
                      transactions={allTransactions}
                      currency={wallet.currency}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
};

const TransactionTypeBreakdown: React.FC<{
  transactions: Array<{ type: string; amount: number }>;
  currency: string;
}> = ({ transactions, currency }) => {
  const breakdown = useMemo(() => {
    const types: Record<string, { count: number; total: number }> = {};

    transactions.forEach((t) => {
      const type = t.type.toLowerCase();
      if (!types[type]) {
        types[type] = { count: 0, total: 0 };
      }
      types[type].count++;
      types[type].total += Math.abs(t.amount);
    });

    return Object.entries(types)
      .map(([type, data]) => ({
        type,
        count: data.count,
        total: data.total,
        percentage: (data.count / transactions.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      deposit: 'bg-green-500',
      withdrawal: 'bg-blue-500',
      purchase: 'bg-purple-500',
      refund: 'bg-orange-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      {breakdown.map((item) => (
        <div key={item.type} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${getTypeColor(item.type)}`} />
              <span className="text-sm font-medium capitalize">{item.type}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{formatCurrency(item.total)}</p>
              <p className="text-xs text-muted-foreground">{item.count} txns</p>
            </div>
          </div>
          <div className="space-y-1">
            <Progress value={item.percentage} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">
              {item.percentage.toFixed(1)}% of total
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const RevenueLoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-14 w-14 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-12 w-48" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 flex-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
