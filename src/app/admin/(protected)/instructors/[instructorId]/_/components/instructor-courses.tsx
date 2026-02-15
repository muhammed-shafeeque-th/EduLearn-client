'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Star, Clock, Eye, Edit, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Course, CourseMeta } from '@/types/course';
import { useInstructorCourses } from '@/states/server/course/use-courses';
import Image from 'next/image';

interface InstructorCoursesProps {
  instructorId: string;
}

function StatusBadge({ status }: { status: Course['status'] }) {
  const variants: Record<Course['status'], string> = {
    published: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    unpublished: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    deleted: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variants[status]}`}
      data-testid={`badge-${status}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function StatCard({
  value,
  label,
  colorClass,
}: {
  value: React.ReactNode;
  label: string;
  colorClass: string;
}) {
  return (
    <div className={`text-center p-3 ${colorClass} rounded-lg`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function CourseListItem({ course, instructorId }: { course: CourseMeta; instructorId: string }) {
  const { id, title, description, status, students, rating, updatedAt, thumbnail } = course;

  return (
    <div className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4">
        {/* Thumbnail */}
        {thumbnail && (
          <div className="flex-shrink-0 w-20 h-20 mr-4 hidden sm:block">
            <Image
              src={thumbnail}
              alt={title}
              className="w-20 h-20 object-cover rounded-md bg-muted"
              width={80}
              height={80}
              style={{ minWidth: 80, minHeight: 80, maxWidth: 80, maxHeight: 80 }}
            />
          </div>
        )}
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h5 className="font-medium truncate">{title}</h5>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description && description?.length > 150
              ? `${description.slice(0, 150)}...`
              : description}
          </p>

          <div className="flex items-center gap-4 text-sm flex-wrap">
            {status === 'published' && (
              <>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{students} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span>{Number(rating ?? 0).toFixed(1)}</span>
                </div>
              </>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Updated {updatedAt ? new Date(updatedAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Course Actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href={`/admin/instructors/${instructorId}/courses/${id}`} passHref legacyBehavior>
              <DropdownMenuItem asChild>
                <div className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </div>
              </DropdownMenuItem>
            </Link>
            {/* <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit Course
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function InstructorCourses({ instructorId }: InstructorCoursesProps) {
  const { courses, totalCount } = useInstructorCourses(instructorId, { page: 1, pageSize: 5 });

  const safeCourses: CourseMeta[] = Array.isArray(courses) ? courses : [];
  const publishedCourses = safeCourses.filter((course) => course.status === 'published');

  const totalRevenue = publishedCourses.reduce((sum, course) => sum + (course.price ?? 0), 0);
  const totalStudents = publishedCourses.reduce((sum, course) => sum + (course.students ?? 0), 0);
  const avgRating =
    publishedCourses.length > 0
      ? publishedCourses.reduce((sum, course) => sum + (course.rating ?? 0), 0) /
        publishedCourses.length
      : 0;

  const quickStats = [
    {
      value: totalCount,
      label: 'Total Courses',
      colorClass: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    },
    {
      value: totalStudents,
      label: 'Students',
      colorClass: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    },
    {
      value: avgRating.toFixed(1),
      label: 'Avg Rating',
      colorClass: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600',
    },
    {
      value: `₹${totalRevenue.toLocaleString()}`,
      label: 'Revenue',
      colorClass: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <span>Course Overview</span>
          </CardTitle>
          <Link href={`/admin/instructors/${instructorId}/courses`} passHref legacyBehavior>
            <Button size="sm">View All Courses</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map(({ value, label, colorClass }) => (
            <StatCard key={label} value={value} label={label} colorClass={colorClass} />
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Recent Courses</h4>
          {safeCourses.slice(0, 3).length > 0 ? (
            safeCourses
              .slice(0, 3)
              .map((course) => (
                <CourseListItem key={course.id} course={course} instructorId={instructorId} />
              ))
          ) : (
            <div className="text-center text-muted-foreground py-6">No courses to show.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
