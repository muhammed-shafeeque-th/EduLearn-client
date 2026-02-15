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
  Download,
  ExternalLink,
  CheckCircle,
  Ban,
  Trash2,
  Loader2,
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

interface CourseDetailHeaderProps {
  course: Course;
}

const courseStatusColors: Record<CourseStatus, string> = {
  published:
    'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400',
  draft:
    'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400',
  unpublished:
    'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-400',
  deleted: 'bg-destructive text-destructive-foreground dark:bg-red-900/20 dark:text-red-400',
};

const courseStatusLabels: Record<CourseStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  unpublished: 'Unpublished',
  deleted: 'Deleted',
};

export function CourseDetailHeader({ course }: CourseDetailHeaderProps) {
  const [isExporting, setIsExporting] = useState(false);
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

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success({ title: 'Course data exported successfully!' });
    } catch (error) {
      toast.error({ title: 'Failed to export course data', description: getErrorMessage(error) });
    } finally {
      setIsExporting(false);
    }
  }, []);

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
      router.push('/instructor/courses');
    } catch (error) {
      toast.error({ title: 'Delete failed', description: getErrorMessage(error) });
    }
  }, [deleteCourse, course.id, router]);

  const statusColor = useMemo(() => {
    return (
      courseStatusColors[course.status as CourseStatus] ??
      'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900/20 dark:text-gray-400'
    );
  }, [course.status]);
  const statusLabel = useMemo(() => {
    return (
      courseStatusLabels[course.status as CourseStatus] ??
      course.status.charAt(0).toUpperCase() + course.status.slice(1)
    );
  }, [course.status]);

  const canEdit = course.status !== 'deleted';
  const canPublish = course.status === 'draft' || course.status === 'unpublished';
  const canUnpublish = course.status === 'published';
  const canDelete = course.status !== 'deleted';

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
            <Link href="/instructor/courses">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Link>
          </Button>
        </div>

        {/* Course Header */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={statusColor}>{statusLabel}</Badge>
                  <Badge variant="outline">{course.category}</Badge>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                  {course.title}
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  {course.description?.length && course.description.length > 300
                    ? `${course.description.slice(0, 300)} ...`
                    : course.description}
                </p>
              </div>

              {/* Actions Dropdown or Loading Spinner */}
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
                      <a href={`/courses/${course.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View as Student
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleShare}
                      disabled={isAnyActionLoading || !canEdit}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Course
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleExport}
                      disabled={isExporting || isAnyActionLoading || !canEdit}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isExporting ? 'Exporting...' : 'Export Data'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    {/* Publish/Unpublish options based on course status */}
                    {canPublish && (
                      <DropdownMenuItem
                        onClick={handlePublish}
                        disabled={isPublishing || isAnyActionLoading || !canEdit}
                      >
                        {isPublishing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin text-green-600" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        )}
                        {isPublishing ? 'Publishing...' : 'Publish Course'}
                      </DropdownMenuItem>
                    )}
                    {canUnpublish && (
                      <DropdownMenuItem
                        onClick={handleUnpublish}
                        disabled={isUnpublishing || isAnyActionLoading || !canEdit}
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

                    {/* Delete Option (not for already deleted course) */}
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

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button asChild disabled={isAnyActionLoading || !canEdit}>
                <Link href={`/instructor/courses/${course.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Course
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
                <a href={`/courses/${course.slug}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </a>
              </Button>
            </div>
          </div>

          {/* Course Thumbnail */}
          <div className="lg:col-span-1">
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
              <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
