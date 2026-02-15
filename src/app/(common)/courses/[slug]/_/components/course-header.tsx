'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Star, Clock, Globe, Play } from 'lucide-react';
import { VideoPreview } from './video-preview';
import { Course } from '@/types/course';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

// Utility: Render instructor initials
const getInstructorInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');

interface CourseHeaderProps {
  course: Course;
}

// Single-responsibility rendering helpers for clarity
function CourseThumbnail({
  src,
  alt,
  onPreview,
}: {
  src: string;
  alt: string;
  onPreview: () => void;
}) {
  return (
    <div className="relative w-full lg:w-80 aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 group">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        priority
        sizes="(max-width: 1024px) 100vw, 320px"
      />
      <button
        type="button"
        onClick={onPreview}
        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition"
        aria-label="Watch course preview"
      >
        <span className="flex flex-col items-center text-white">
          <span className="bg-white/30 rounded-full p-4 mb-2 backdrop-blur-sm">
            <Play className="w-8 h-8" />
          </span>
          <span className="text-sm font-medium">Course Preview</span>
        </span>
      </button>
      <div className="absolute top-3 left-3">
        <Badge className="bg-green-600 text-white">
          <Play className="w-3 h-3 mr-1" /> Free Preview
        </Badge>
      </div>
    </div>
  );
}

function CourseMeta({
  rating,
  totalRatings,
  durationValue,
  durationUnit,
  language,
  students,
}: {
  rating: number;
  totalRatings: number;
  durationValue: number;
  durationUnit: string;
  language: string;
  students?: number;
}) {
  return (
    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
      <div className="flex items-center gap-1" title="Course Rating">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden />
        <span className="font-semibold text-gray-900 dark:text-white">
          {Number(rating).toFixed(1) ?? '0.0'}
        </span>
        <span>({totalRatings?.toLocaleString() || 0} ratings)</span>
      </div>
      {typeof students === 'number' && (
        <div className="flex items-center gap-1" title="Total Students">
          <span role="img" aria-label="students" className="font-semibold">
            👥
          </span>
          <span>{students?.toLocaleString()} students</span>
        </div>
      )}
      <div className="flex items-center gap-1" title="Duration">
        <Clock className="w-4 h-4" aria-hidden />
        <span>
          {durationValue || 0} {durationUnit}
        </span>
      </div>
      <div className="flex items-center gap-1" title="Language">
        <Globe className="w-4 h-4" aria-hidden />
        <span>{language || 'English'}</span>
      </div>
    </div>
  );
}

function InstructorCard({
  id,
  name,
  totalCourses,
  totalStudents,
}: {
  id: string;
  name: string;
  totalCourses?: number;
  totalStudents?: number;
}) {
  return (
    <Card className="p-4 bg-gray-50 dark:bg-gray-700" aria-label="Instructor Info">
      <Link
        href={`/instructors/${id}`}
        className="flex items-center gap-4 no-underline hover:underline focus-visible:underline"
      >
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
          {getInstructorInitials(name)}
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {totalCourses ?? 1} courses&nbsp;&bull;&nbsp;
            {totalStudents?.toLocaleString() ?? '0'} students
          </div>
        </div>
      </Link>
    </Card>
  );
}

export function CourseHeader({ course }: CourseHeaderProps) {
  const [showVideoPreview, setShowVideoPreview] = useState(false);

  // Memoize preview video to prevent unnecessary re-creation
  const previewVideoData = useMemo(
    () => ({
      title: 'Course Introduction & Welcome',
      url:
        course.trailer ||
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'preview' as const,
    }),
    [course.trailer]
  );

  // Accessibility: Focus management helpers could be added for modal

  const handleShowPreview = useCallback(() => setShowVideoPreview(true), []);
  const handleHidePreview = useCallback(() => setShowVideoPreview(false), []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        aria-label="Course Header"
      >
        <div className="p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
          {/* Thumbnail Section */}
          <CourseThumbnail
            src={course.thumbnail || '/default-course.jpg'}
            alt={course.title}
            onPreview={handleShowPreview}
          />

          {/* Details Section */}
          <div className="flex-1 space-y-4">
            <header>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {course.title}
              </h1>
              {!!course.subTitle && (
                <p className="text-gray-600 dark:text-gray-300 text-lg">{course.subTitle}</p>
              )}
            </header>

            <CourseMeta
              rating={course.rating}
              totalRatings={course.totalRatings}
              durationValue={course.durationValue}
              durationUnit={course.durationUnit}
              language={course.language}
              students={typeof course.students === 'number' ? course.students : undefined}
            />

            <InstructorCard
              id={course.instructor.id}
              name={course.instructor.name}
              totalCourses={course.instructor.totalCourses}
              totalStudents={course.instructor.totalStudents}
            />

            <div className="flex justify-between items-center pt-2">
              <p
                className="text-sm text-gray-500 dark:text-gray-400"
                aria-label={`Last updated on ${formatDate(new Date(course.updatedAt || 0))}`}
              >
                Last updated {formatDate(new Date(course.updatedAt || 0))}
              </p>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={handleShowPreview}
                className="text-primary hover:text-primary/80"
                aria-label="Preview Course"
              >
                <Play className="w-4 h-4 mr-1" aria-hidden /> Preview Course
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Video Preview Modal */}
      <VideoPreview
        isOpen={showVideoPreview}
        onClose={handleHidePreview}
        videoData={previewVideoData}
      />
    </>
  );
}
