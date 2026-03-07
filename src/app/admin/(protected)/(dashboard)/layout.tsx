import React, { Suspense } from 'react';
import { StatsSkeleton } from './@stats/_/stats-skeleton';
import { ChartSkeleton } from './_/skeletons/chart-skeleton';

export default function DashboardLayout({
  children,
  stats,
  revenue,
  enrollment,
  growth,
  top_courses,
}: {
  children: React.ReactNode;
  stats: React.ReactNode;
  revenue: React.ReactNode;
  enrollment: React.ReactNode;
  growth: React.ReactNode;
  top_courses: React.ReactNode;
  performance: React.ReactNode;
  reviews: React.ReactNode;
  activity: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {children}

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {<Suspense fallback={<StatsSkeleton />}>{stats}</Suspense>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {<Suspense fallback={<ChartSkeleton />}>{revenue}</Suspense>}
        {<Suspense fallback={<ChartSkeleton />}>{enrollment}</Suspense>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {<Suspense fallback={<ChartSkeleton />}>{growth}</Suspense>}
        {<Suspense fallback={<ChartSkeleton />}>{top_courses}</Suspense>}
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {performance}
        {reviews}
      </div>

      {activity && <div className="w-full">{activity}</div>} */}
    </div>
  );
}
