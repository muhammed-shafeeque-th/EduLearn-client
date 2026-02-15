import { Suspense } from 'react';
import { InstructorsHeader } from './_/components/instructors-header';
import { InstructorsTable } from './_/components/instructors-table';
import { InstructorsStats } from './_/components/instructors-stats';
import { StatsCardsSkeleton } from './_/components/skeletons/course-card-skeleton';
import { TableSkeleton } from '../_components/__table/table-skeleton';

export const metadata = {
  title: 'Instructors Management | EduLearn Admin',
  description: 'Manage and monitor instructor accounts, courses, and performance',
};

export default function InstructorsPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; page?: string };
}) {
  return (
    <div className="space-y-6">
      <InstructorsHeader />

      <Suspense fallback={<StatsCardsSkeleton />}>
        <InstructorsStats />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <InstructorsTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

export const dynamic = 'force-dynamic';
