'use client';

import { InstructorHeader } from './instructor-header';
import { InstructorCourses } from './instructor-courses';
import { InstructorReviews } from './instructor-review';
import { InstructorPageSkeleton } from './skeletons/instructor-page-skeleton';
import { User } from '@/types/user';
import { useUser } from '@/states/server/user/use-users';
import { useInstructorCourses } from '@/states/server/course/use-courses';
import { getWindow } from '@/lib/utils';

interface InstructorPageContentProps {
  instructorId: string;
  initialData: User;
}

export function InstructorPageContent({
  instructorId,
  initialData: _,
}: InstructorPageContentProps) {
  const { data: instructor, isLoading, error } = useUser(instructorId, { enabled: true });
  const { courses, isLoading: isCourseLoading } = useInstructorCourses(instructorId);

  if (isLoading || isCourseLoading) {
    return <InstructorPageSkeleton />;
  }

  if (error || !instructor || instructor.role !== 'instructor') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Instructor Not Found</h2>
          <p className="text-muted-foreground">
            The instructor you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <button
            onClick={() => getWindow()?.history.back()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 md:space-y-20 pb-20">
      <InstructorHeader instructor={instructor} />
      <div className="space-y-12 md:space-y-24">
        <InstructorCourses
          courses={courses || []}
          instructorName={instructor.username}
          instructorId={instructorId}
        />
        <InstructorReviews
          reviews={instructor?.instructorProfile?.reviews || []}
          averageRating={instructor?.instructorProfile?.rating || 0}
          totalReviews={instructor?.instructorProfile?.totalRatings || 0}
        />
      </div>
    </div>
  );
}
