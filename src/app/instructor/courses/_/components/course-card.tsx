'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Star,
  Users,
  MoreVertical,
  Eye,
  Edit,
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CourseMeta, CourseStatus } from '@/types/course';

interface CourseCardProps {
  course: CourseMeta;
}

// Define explicit status keys relevant to requirements

const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  unpublished: 'Unpublished',
  deleted: 'Deleted',
};

const COURSE_STATUS_COLORS: Record<CourseStatus, string> = {
  published:
    'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400',
  draft:
    'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400',
  unpublished: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
  deleted: 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900/20 dark:text-gray-400',
};

function getStatusColor(status: string) {
  // Fallback: use draft color if not matched
  return COURSE_STATUS_COLORS[status as CourseStatus] || COURSE_STATUS_COLORS['draft'];
}

function getStatusLabel(status: string) {
  return COURSE_STATUS_LABELS[status as CourseStatus] || 'Draft';
}

export function CourseCard({ course }: CourseCardProps) {
  // Calculate metrics only if sections are defined and not empty
  // const totalSections = course.sections?.length || 0;
  // const totalLessons = course.sections
  //   ? course.sections.reduce((sum, section) => sum + (section.lessons?.length || 0), 0)
  //   : 0;
  // const totalQuizzes = course.sections
  //   ? course.sections.reduce((sum, section) => sum + (section.quiz ? 1 : 0), 0)
  //   : 0;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18 }}
      className="w-full sm:w-[390px] md:w-[450px] max-w-full"
    >
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 w-full">
        {/* Thumbnail */}
        <div className="relative w-full aspect-[16/6] overflow-hidden min-h-[144px] max-h-[160px]">
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, 450px"
            priority={false}
          />

          {/* Status Badge */}
          <Badge
            className={`absolute top-2 left-2 z-10 shadow
            ${getStatusColor(course.status ?? 'draft')} text-xs font-medium px-3 py-1 rounded`}
          >
            {getStatusLabel(course.status ?? 'draft')}
          </Badge>

          {/* Actions Menu */}
          <div className="absolute top-2 right-2 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 text-black bg-white/90 hover:bg-white"
                  aria-label="Card actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/instructor/courses/${course.id}`}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/instructor/courses/${course.id}/edit`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Course
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/instructor/courses/${course.id}/analytics`}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Price Badge */}
          <div className="absolute bottom-2 right-2 z-10">
            <Badge
              variant="secondary"
              className="bg-black/70 text-white hover:bg-black/80 text-xs px-2 py-1 rounded"
            >
              {course.discountPrice ? (
                <div className="flex items-center gap-1">
                  <span className="line-through text-xs">${course.price}</span>
                  <span className="font-semibold">${course.discountPrice}</span>
                </div>
              ) : (
                <span className="font-semibold">${course.price || 'N/A'}</span>
              )}
            </Badge>
          </div>

          {/* Content Summary Badge */}
          <div className="absolute bottom-2 left-2 z-10">
            <Badge
              variant="secondary"
              className="bg-black/80 text-white hover:bg-black/90 text-[11px] px-1.5 py-0.5 rounded tracking-wide"
            >
              {course.noOfSections}S • {course.noOfLessons}L • {course.noOfQuizzes}Q
            </Badge>
          </div>
        </div>

        <CardContent className="p-3 pb-1">
          {/* Category */}
          <div className="text-[11px] text-orange-600 dark:text-orange-400 font-medium mb-1 uppercase tracking-widest">
            {course.category}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-[16.5px] leading-[1.18] text-foreground line-clamp-2 min-h-[2.3rem] mb-2">
            {course.title}
          </h3>

          {/* Stats */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span>{course?.rating?.toFixed(1) ?? '--'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{(course.students ?? 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
              </div>
              <div />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>
                  {course?.durationValue} {course?.durationUnit}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(course.updatedAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-3 pt-1">
          <div className="flex gap-2 w-full">
            <Button asChild variant="outline" size="sm" className="flex-1 min-w-0">
              <Link href={`/instructor/courses/${course.id}`}>
                <Eye className="w-3 h-3 mr-1" />
                View
              </Link>
            </Button>
            <Button asChild size="sm" className="flex-1 min-w-0">
              <Link href={`/instructor/courses/${course.id}/edit`}>
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
