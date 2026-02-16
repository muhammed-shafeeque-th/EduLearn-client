import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getInstructor } from '../../_/libs/apis';
import { CoursesHeader } from './_/components/courses-header';
import { CoursesStats } from './_/components/courses-stats';
import { TableSkeleton } from '../../../_components/__table/table-skeleton';
import { CoursesTable } from './_/components/courses-table';

interface InstructorCoursesPageProps {
  params: { instructorId: string };
  searchParams: { search?: string; status?: string; page?: string };
}

export async function generateMetadata({ params }: InstructorCoursesPageProps) {
  const { instructorId } = params;
  const instructor = await getInstructor(instructorId);

  if (!instructor) {
    return { title: 'Courses Not Found' };
  }

  return {
    title: `${instructor.username} - Courses | EduLearn Admin`,
    description: `Manage courses created by ${instructor.username}`,
  };
}

export default async function InstructorCoursesPage({
  params,
  searchParams,
}: InstructorCoursesPageProps) {
  const { instructorId } = params;

  const instructor = await getInstructor(instructorId);

  if (!instructor) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <CoursesHeader instructor={instructor} />

      <Suspense fallback={<div>Loading stats...</div>}>
        <CoursesStats instructorId={instructorId} />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <CoursesTable instructorId={instructorId} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
