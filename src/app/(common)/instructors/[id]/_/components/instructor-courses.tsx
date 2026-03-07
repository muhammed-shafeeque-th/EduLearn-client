'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseCard } from './course-card';
import { cn } from '@/lib/utils';
import type { CourseMeta } from '@/types/course';

interface InstructorCoursesProps {
  courses: CourseMeta[];
  instructorName: string;
  instructorId: string;
}

export function InstructorCourses({
  courses,
  instructorName,
  instructorId: _,
}: InstructorCoursesProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const coursesPerPage = 4;

  const visibleCourses = useMemo(() => {
    return courses.slice(currentIndex, currentIndex + coursesPerPage);
  }, [courses, currentIndex, coursesPerPage]);

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex + coursesPerPage < courses.length;

  const nextSlide = () => {
    if (canGoNext) {
      setCurrentIndex((prev) => prev + coursesPerPage);
    }
  };

  const prevSlide = () => {
    if (canGoPrevious) {
      setCurrentIndex((prev) => Math.max(0, prev - coursesPerPage));
    }
  };

  if (!courses || courses.length === 0) {
    return (
      <div className="py-20 bg-slate-100/50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="h-20 w-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
            <span className="text-3xl">📚</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Courses by {instructorName}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
              This instructor hasn&apos;t published any courses yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-blue-500" />
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                Courses by <span className="text-blue-600">{instructorName}</span>
              </h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg pl-11">
              Explore {courses.length} specialized course{courses.length !== 1 ? 's' : ''} designed
              to help you master new skills.
            </p>
          </div>

          <div className="flex items-center gap-3 pl-11 md:pl-0">
            {courses.length > coursesPerPage && (
              <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-xl">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevSlide}
                  disabled={!canGoPrevious}
                  className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextSlide}
                  disabled={!canGoNext}
                  className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {visibleCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onCourseClick={(course) => router.push(`/courses/${course.slug}`)}
            />
          ))}
        </div>

        {/* Pagination Dots */}
        {courses.length > coursesPerPage && (
          <div className="flex justify-center mt-12 gap-2">
            {Array.from({ length: Math.ceil(courses.length / coursesPerPage) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * coursesPerPage)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-500',
                  Math.floor(currentIndex / coursesPerPage) === index
                    ? 'w-8 bg-blue-600'
                    : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
