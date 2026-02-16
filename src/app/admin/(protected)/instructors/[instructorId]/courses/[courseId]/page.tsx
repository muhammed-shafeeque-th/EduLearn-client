import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getCourse, getInstructor } from '../../../_/libs/apis';
import { CourseHeader } from './_/components/course-header';
import { CourseContent } from './_/components/course-content';
import { CourseStudents } from './_/components/course-students';
import { CourseStats } from './_/components/course-stats';

interface CourseDetailPageProps {
  params: Promise<{ instructorId: string; courseId: string }>;
}

export async function generateMetadata({ params }: CourseDetailPageProps) {
  const { courseId, instructorId } = await params;

  const [course, instructor] = await Promise.all([
    getCourse(courseId),
    getInstructor(instructorId),
  ]);

  if (!course || !instructor) {
    return { title: 'Course Not Found' };
  }

  return {
    title: `${course.title} | ${instructor.username} | EduLearn Admin`,
    description: `Course details and management for ${course.title} by ${instructor.username}`,
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { courseId, instructorId } = await params;

  const [course, instructor] = await Promise.all([
    getCourse(courseId),
    getInstructor(instructorId),
  ]);

  if (!course || !instructor) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <CourseHeader course={course} instructor={instructor} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Suspense fallback={<div>Loading course content...</div>}>
            <CourseContent courseId={courseId} />
          </Suspense>

          <Suspense fallback={<div>Loading students...</div>}>
            <CourseStudents courseId={courseId} />
          </Suspense>
        </div>

        <div>
          <Suspense fallback={<div>Loading stats...</div>}>
            <CourseStats instructorId={instructorId} courseId={courseId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
