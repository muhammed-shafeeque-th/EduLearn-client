import { Suspense } from 'react';
import { StatsCardsSkeleton } from './_/components/skeletons/course-card-skeleton';

import { UsersStats } from './_/components/user-stats';
import { UsersHeader } from './_/components/user-header';
import dynamic from 'next/dynamic';
import { TableSkeleton } from './_/components/skeletons/table-skeleton';

export const metadata = {
  title: 'Users Management | EduLearn Admin',
  description: 'Manage and monitor instructor accounts, courses, and performance',
};

const UsersTable = dynamic(
  () => import('./_/components/users-table').then((mod) => mod.UsersTable),
  {
    loading: () => <TableSkeleton />,
  }
);

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <UsersHeader />

      <Suspense fallback={<StatsCardsSkeleton />}>
        <UsersStats />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <UsersTable />
      </Suspense>
    </div>
  );
}
