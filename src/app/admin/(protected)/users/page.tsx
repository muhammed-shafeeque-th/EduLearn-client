import { Suspense } from 'react';
import { StatsCardsSkeleton } from './_/components/skeletons/course-card-skeleton';
import { TableSkeleton } from '../_components/__table/table-skeleton';

import { UsersStats } from './_/components/user-stats';
import { UsersHeader } from './_/components/user-header';
import dynamicImport from 'next/dynamic';

export const metadata = {
  title: 'Users Management | EduLearn Admin',
  description: 'Manage and monitor instructor accounts, courses, and performance',
};

const UsersTable = dynamicImport(
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

export const dynamic = 'force-dynamic';
