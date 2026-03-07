import { Suspense } from 'react';
import { InstructorsHeader } from './_/components/instructors-header';
import { InstructorsTable } from './_/components/instructors-table';
import { InstructorsStats } from './_/components/instructors-stats';
import { StatsCardsSkeleton } from './_/components/skeletons/course-card-skeleton';
import { TableSkeleton } from './_/components/skeletons/table-skeleton';

export const metadata = {
  title: 'Instructors Management | EduLearn Admin',
  description: 'Manage and monitor instructor accounts, courses, and performance',
};

export interface InstructorPageSearchParams {
  search?: string;
  status?: string;
  page?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export default function InstructorsPage() {
  return (
    <div className="space-y-6">
      <InstructorsHeader />

      <Suspense fallback={<StatsCardsSkeleton />}>
        <InstructorsStats />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <InstructorsTable />
      </Suspense>
    </div>
  );
}
