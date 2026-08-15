'use client';

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Share2,
  MoreVertical,
  Eye,
  ExternalLink,
  CheckCircle,
  Ban,
  Trash2,
  Loader2,
  BarChart3,
  MessageSquare,
  Globe,
  GraduationCap,
  Award,
  Star,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Course, CourseStatus } from '@/types/course';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/utils';
import { useCourse } from '@/states/server/course/use-course';
import { ROUTES } from '@/lib/constants/routes';

interface CourseDetailHeaderProps {
  course: Course;
}

const statusStyles: Record<CourseStatus, string> = {
  published:
    'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400',
  draft: 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/20 dark:text-amber-400',
  unpublished:
    'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-400',
  deleted: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

const statusLabels: Record<CourseStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  unpublished: 'Unpublished',
  deleted: 'Deleted',
};

export function CourseDetailHeader({ course }: CourseDetailHeaderProps) {
  // const [, setIsExporting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const { deleteCourse, isDeleting, publishCourse, isPublishing, unPublishCourse, isUnpublishing } =
    useCourse(course.id);

  const isAnyActionLoading = isPublishing || isUnpublishing || isDeleting;

  const handleShare = useCallback(async () => {
    try {
      if (typeof window === 'undefined') {
        toast.error({ title: 'Sharing not supported in this environment.' });
        return;
      }
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: course.title,
          text: course.description,
          url,
        });
        toast.success({ title: 'Course shared successfully!' });
      } else if (navigator.clipboard && url) {
        await navigator.clipboard.writeText(url);
        toast.success({ title: 'Course link copied to clipboard!' });
      } else {
        toast.error({ title: 'Sharing not supported in this browser.' });
      }
    } catch (error) {
      toast.error({ title: 'Failed to share', description: getErrorMessage(error) });
    }
  }, [course.title, course.description]);

  // const handleExport = useCallback(async () => {
  //   return toast.info({ title: 'Coming soon' });
  //   setIsExporting(true);
  //   try {
  //     await new Promise((resolve) => setTimeout(resolve, 2000));
  //     toast.success({ title: 'Course data exported successfully!' });
  //   } catch (error) {
  //     toast.error({ title: 'Failed to export course data', description: getErrorMessage(error) });
  //   } finally {
  //     setIsExporting(false);
  //   }
  // }, []);

  const handlePublish = useCallback(async () => {
    try {
      await publishCourse({ courseId: course.id });
      toast.success({ title: 'Course published successfully!' });
    } catch (error) {
      toast.error({ title: 'Failed to publish course', description: getErrorMessage(error) });
    }
  }, [publishCourse, course.id]);

  const handleUnpublish = useCallback(async () => {
    try {
      await unPublishCourse({ courseId: course.id });
      toast.success({ title: 'Course marked as unpublished.' });
    } catch (error) {
      toast.error({ title: 'Failed to unpublish course', description: getErrorMessage(error) });
    }
  }, [unPublishCourse, course.id]);

  const handleDeleteCourse = useCallback(async () => {
    try {
      await deleteCourse({ courseId: course.id });
      toast.success({ title: 'Course has been deleted and cannot be restored.' });
      setIsDeleteDialogOpen(false);
      router.push(ROUTES.instructor.courses.root);
    } catch (error) {
      toast.error({ title: 'Delete failed', description: getErrorMessage(error) });
    }
  }, [deleteCourse, course.id, router]);

  const statusColor = useMemo(
    () =>
      statusStyles[course.status as CourseStatus] ??
      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    [course.status]
  );

  const statusLabel = useMemo(
    () =>
      statusLabels[course.status as CourseStatus] ??
      course.status.charAt(0).toUpperCase() + course.status.slice(1),
    [course.status]
  );

  const canEdit = course.status !== 'deleted';
  const canPublish = course.status === 'draft' || course.status === 'unpublished';
  const canUnpublish = course.status === 'published';
  const canDelete = course.status !== 'deleted';

  const formatDuration = () => {
    if (!course.durationValue) return null;
    const unit = course.durationUnit || 'hours';
    return `${course.durationValue} ${unit}`;
  };

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete course</DialogTitle>
            <DialogDescription>
              Are you sure you want to <span className="font-semibold">permanently delete</span>{' '}
              this course?
              <br />
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting || isAnyActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCourse}
              disabled={isDeleting || isAnyActionLoading}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              {isDeleting ? 'Deleting...' : 'Delete Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Back Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild disabled={isAnyActionLoading}>
            <Link href={ROUTES.instructor.courses.root}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Link>
          </Button>
        </div>

        {/* Course Header */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course Info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                {/* Status + Category */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={statusColor}>{statusLabel}</Badge>
                  <Badge variant="outline">{course.category}</Badge>
                  {course.subCategory && (
                    <Badge variant="outline" className="text-muted-foreground">
                      {course.subCategory}
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                  {course.title}
                </h1>

                {course.subTitle && (
                  <p className="text-base text-muted-foreground">{course.subTitle}</p>
                )}

                {/* Description */}
                <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed text-wrap">
                  {course.description?.length && course.description.length > 300
                    ? `${course.description.slice(0, 300)}...`
                    : course.description}
                </p>

                {/* Metadata Badges */}
                <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
                  {course.level && (
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </span>
                  )}
                  {course.language && (
                    <span className="inline-flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" />
                      {course.language}
                    </span>
                  )}
                  {course.certificate && (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <Award className="w-3.5 h-3.5" />
                      Certificate
                    </span>
                  )}
                  {formatDuration() && (
                    <span className="inline-flex items-center gap-1">⏱ {formatDuration()}</span>
                  )}
                  {course.students > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {course.students.toLocaleString()} students
                    </span>
                  )}
                  {course.rating > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {course.rating.toFixed(1)}
                      {course.totalRatings > 0 && (
                        <span className="text-xs">({course.totalRatings})</span>
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Dropdown */}
              {isAnyActionLoading ? (
                <div className="flex items-center justify-center h-10 w-10">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="More actions"
                      disabled={!canEdit}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <a
                        href={ROUTES.public.courses.course(course.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View as Student
                      </a>
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem
                      onClick={handleShare}
                      disabled={isAnyActionLoading || !canEdit}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Course
                    </DropdownMenuItem> */}
                    {/* <DropdownMenuItem
                      onClick={handleExport}
                      disabled={isExporting || isAnyActionLoading || !canEdit}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isExporting ? 'Exporting...' : 'Export Data'}
                    </DropdownMenuItem> */}
                    <DropdownMenuSeparator />

                    {canPublish && (
                      <DropdownMenuItem
                        onClick={handlePublish}
                        disabled={isPublishing || isAnyActionLoading}
                      >
                        {isPublishing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin text-emerald-600" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                        )}
                        {isPublishing ? 'Publishing...' : 'Publish Course'}
                      </DropdownMenuItem>
                    )}
                    {canUnpublish && (
                      <DropdownMenuItem
                        onClick={handleUnpublish}
                        disabled={isUnpublishing || isAnyActionLoading}
                      >
                        {isUnpublishing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin text-orange-600" />
                        ) : (
                          <Ban className="w-4 h-4 mr-2 text-orange-600" />
                        )}
                        {isUnpublishing ? 'Unpublishing...' : 'Unpublish'}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />

                    {canDelete && (
                      <DropdownMenuItem
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="text-destructive"
                        disabled={isAnyActionLoading}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Course
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Action Buttons + Quick Links */}
            <div className="flex flex-wrap gap-3">
              <Button asChild disabled={isAnyActionLoading || !canEdit}>
                <Link href={ROUTES.instructor.courses.edit(course.id)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Course
                </Link>
              </Button>
              <Button variant="outline" asChild disabled={isAnyActionLoading}>
                <Link href={ROUTES.instructor.courses.analytics(course.id)}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Link>
              </Button>
              <Button variant="outline" asChild disabled={isAnyActionLoading}>
                <Link href={ROUTES.instructor.courses.discussion(course.id)}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Discussion
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                disabled={isAnyActionLoading || !canEdit}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" asChild disabled={isAnyActionLoading}>
                <Link
                  href={ROUTES.public.courses.course(course.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Link>
              </Button>
            </div>
          </div>

          {/* Course Thumbnail */}
          <div className="lg:col-span-1">
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg border border-border/50">
              <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
              {/* Price overlay */}
              {course.price > 0 && (
                <div className="absolute bottom-3 left-3">
                  <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm border border-border/50">
                    {course.discountPrice > 0 && course.discountPrice < course.price ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-foreground">
                          {course.currency ?? '$'}
                          {course.discountPrice}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {course.currency ?? '$'}
                          {course.price}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-foreground">
                        {course.currency ?? '$'}
                        {course.price}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {course.price === 0 && (
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 text-sm px-3 py-1">
                    Free
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
