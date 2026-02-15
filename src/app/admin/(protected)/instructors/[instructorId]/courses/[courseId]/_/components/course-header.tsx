'use client';

import React, { useState, useCallback } from 'react';
import { Eye, Edit, Trash2, Ban, Loader2, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Course } from '@/types/course';
import { Instructor } from '@/types/user';
import Image from 'next/image';

import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAdminCourse } from '@/states/server/admin/use-admin-course';

interface CourseHeaderProps {
  course: Course;
  instructor: Instructor;
}

export function CourseHeader({ course: c, instructor }: CourseHeaderProps) {
  const router = useRouter();

  // State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Course action hooks
  const {
    course: courseRes,
    deleteCourse,
    isDeleting,
    publishCourse,
    isPublishing,
    unPublishCourse,
    isUnpublishing,
  } = useAdminCourse(c.id);

  const course = courseRes || c;

  // Handlers
  const handlePublish = useCallback(
    async (courseId: string) => {
      try {
        await publishCourse({ courseId });
        toast.success({ title: 'Course published successfully!' });
      } catch (error) {
        toast.error({
          title: 'Failed to publish course',
          description: getErrorMessage(error),
        });
      }
    },
    [publishCourse]
  );

  const handleUnpublish = useCallback(
    async (courseId: string) => {
      try {
        await unPublishCourse({ courseId });
        toast.success({ title: 'Course marked as unpublished.' });
      } catch (error) {
        toast.error({
          title: 'Failed to unpublish course',
          description: getErrorMessage(error),
        });
      }
    },
    [unPublishCourse]
  );

  const handleDeleteDialogOpen = useCallback((courseId: string) => {
    setDeleteTargetId(courseId);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteCourse = useCallback(async () => {
    if (!deleteTargetId) return;
    try {
      await deleteCourse({ courseId: deleteTargetId });
      toast.success({ title: 'Course has been deleted and cannot be restored.' });
      setIsDeleteDialogOpen(false);
      setDeleteTargetId(null);
      // Optionally navigate elsewhere after delete
      // router.push('/admin/instructors/[instructorId]/courses');
    } catch (error) {
      toast.error({
        title: 'Delete failed',
        description: getErrorMessage(error),
      });
    }
  }, [deleteCourse, deleteTargetId]);

  // Guard for menu loading state (disable while deleting/publishing/unpublishing)
  const isAnyActionLoading = isDeleting || isPublishing || isUnpublishing;

  // Helper for status badge
  const getStatusBadge = (status: Course['status']) => {
    const variants = {
      published: 'default',
      draft: 'secondary',
      unpublished: 'secondary',
      deleted: 'outline',
    } as const;
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  // For better practice: edit and preview navigation as handlers
  const handleEdit = () => {
    return;
    // Takes user to the edit page for current course and instructor
    router.push(`/admin/instructors/${instructor.id}/courses/${course.id}/edit`);
  };

  const handlePreview = () => {
    // Replace below with actual destination for course preview if applicable
    router.push(`/courses/${course.id}/preview`);
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
              disabled={isAnyActionLoading}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCourse}
              disabled={isAnyActionLoading}
              type="button"
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
        className="space-y-4"
      >
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="h-8 w-8 p-0"
            aria-label="Back"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm text-muted-foreground">
            <span>Instructors</span> / <span>{instructor.username}</span> / <span>Courses</span> /{' '}
            <span className="text-foreground">{course.title}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start space-x-4">
            {course.thumbnail && (
              <Image
                src={course.thumbnail}
                alt={course.title.slice(0, 15)}
                className="rounded-lg w-16 h-16 object-cover"
                width={64}
                height={64}
                priority
              />
            )}
            {!course.thumbnail && (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {course.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">{course.title}</h2>
                {getStatusBadge(course.status)}
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={instructor.avatar} alt={instructor.username} />
                    <AvatarFallback>
                      {instructor.username
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{instructor.username}</span>
                </div>
                <span>•</span>
                <span>{course.students} students</span>
                <span>•</span>
                <span>Updated {new Date(course.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              aria-label="Preview course"
              type="button"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              aria-label="Edit course"
              type="button"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  aria-label="More actions"
                  type="button"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleEdit}
                  disabled={isAnyActionLoading}
                  aria-label="Edit Course"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Course
                </DropdownMenuItem>
                {course.status === 'published' ? (
                  <DropdownMenuItem
                    onClick={() => handleUnpublish(course.id)}
                    className="text-yellow-600"
                    disabled={isAnyActionLoading}
                    aria-label="Unpublish Course"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Unpublish Course
                  </DropdownMenuItem>
                ) : (
                  course.status === 'unpublished' && (
                    <DropdownMenuItem
                      onClick={() => handlePublish(course.id)}
                      className="text-green-600"
                      disabled={isAnyActionLoading}
                      aria-label="Unpublish Course"
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Publish Course
                    </DropdownMenuItem>
                  )
                )}
                <DropdownMenuItem
                  onClick={() => handleDeleteDialogOpen(course.id)}
                  className="text-red-600"
                  disabled={isAnyActionLoading}
                  aria-label="Delete Course"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Course
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>
    </>
  );
}
