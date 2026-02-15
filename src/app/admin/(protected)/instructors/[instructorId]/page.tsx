import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ProfileSkeleton } from '../_/components/skeletons/profile-skeleton';
import { getInstructor } from '../_/libs/apis';
import { InstructorProfile } from './_/components/instructor-profile';
import { InstructorCourses } from '@/app/admin/(protected)/instructors/[instructorId]/_/components/instructor-courses';
import { InstructorStats } from './_/components/instructor-stats';

interface InstructorPageProps {
  params: Promise<{ instructorId: string }>;
}

export async function generateMetadata({ params }: InstructorPageProps) {
  const { instructorId } = await params;
  const instructor = await getInstructor(instructorId);

  if (!instructor) {
    return {
      title: 'Instructor Not Found',
    };
  }

  return {
    title: `${instructor.username} | Instructor Profile | EduLearn Admin`,
    description: `View and manage ${instructor.username}'s profile, courses, and performance metrics`,
  };
}

export default async function InstructorPage({ params }: InstructorPageProps) {
  const { instructorId } = await params;
  const instructor = await getInstructor(instructorId);

  if (!instructor) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<ProfileSkeleton />}>
        <InstructorProfile instructor={instructor} />
      </Suspense>

      {/* Instructor Profile - Always show */}
      {/* <InstructorProfile instructor={instructor} /> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<div>Loading courses...</div>}>
            <InstructorCourses instructorId={instructorId} />
          </Suspense>
        </div>

        <div>
          <Suspense
            fallback={
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            }
          >
            <InstructorStats instructorId={instructorId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
