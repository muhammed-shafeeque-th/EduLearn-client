import { Metadata } from 'next';
import { Suspense } from 'react';
import { CourseCreator } from './_';
import CourseCreatorSkeleton from './loading';

export const metadata: Metadata = {
  title: 'Create New Course | Instructor Dashboard ',
  description: 'Create a new course with sections, lessons, and assessments.',
};

export default function CreateCoursePage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<CourseCreatorSkeleton />}>
        <CourseCreator />
      </Suspense>
    </div>
  );
}
