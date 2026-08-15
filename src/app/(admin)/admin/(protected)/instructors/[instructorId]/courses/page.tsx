import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { CoursesHeader } from './_/components/courses-header';
import { CoursesStats } from './_/components/courses-stats';
import { CoursesTable } from './_/components/courses-table';
import { StatsCardsSkeleton } from '../../_/components/skeletons/course-card-skeleton';
import { TableSkeleton } from '../../_/components/skeletons/table-skeleton';
import { getInstructor } from '../../_/libs/apis';

interface InstructorCoursesPageProps {
  params: Promise<{ instructorId: string }>;
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

export async function generateMetadata({ params }: InstructorCoursesPageProps) {
  const { instructorId } = await params;
  const instructor = await getInstructor(instructorId);

  if (!instructor) {
    return { title: 'Courses Not Found' };
  }

  return {
    title: `${instructor.username} - Courses | EduLearn Admin`,
    description: `Manage courses created by ${instructor.username}`,
  };
}

export default async function InstructorCoursesPage({ params }: InstructorCoursesPageProps) {
  const { instructorId } = await params;

  const instructor = await getInstructor(instructorId);

  if (!instructor) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <CoursesHeader instructor={instructor} />

      <Suspense fallback={<StatsCardsSkeleton />}>
        <CoursesStats instructorId={instructorId} />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <CoursesTable instructorId={instructorId} />
      </Suspense>
    </div>
  );
}
