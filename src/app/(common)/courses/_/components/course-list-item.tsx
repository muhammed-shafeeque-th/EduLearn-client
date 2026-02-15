'use client';

import { Star, Users, Clock, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Course } from '@/types/course';
import Image from 'next/image';

interface CourseListItemProps {
  course: Course;
}

export function CourseListItem({ course }: CourseListItemProps) {
  const courseLessonsCount = course.sections.reduce(
    (acc, section) => acc + section.lessons.length,
    0
  );
  const courseInMinutes = course.sections.reduce(
    (sSum, section) =>
      sSum + section.lessons.reduce((lSum, lesson) => lSum + (lesson.estimatedDuration ?? 0), 0),
    0
  );
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Course Image */}
          <div className="flex-shrink-0">
            <div className="w-32 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg overflow-hidden relative">
              <Image
                // width={24}
                // height={24}
                fill
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              {/* <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              /> */}
            </div>
          </div>

          {/* Course Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Category */}
                <Badge variant="outline" className="mb-2 text-xs">
                  {course.category}
                </Badge>

                {/* Title */}
                <h3 className="font-semibold text-foreground line-clamp-2 mb-2 hover:text-primary transition-colors">
                  {course.title}
                </h3>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-foreground">{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.enrollments?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{courseInMinutes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{courseLessonsCount} lessons</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="text-right">
                <span
                  className={cn(
                    'text-xl font-bold',
                    course.price === 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-orange-600 dark:text-orange-400'
                  )}
                >
                  {course.price === 0 ? 'Free' : `${course.price}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
