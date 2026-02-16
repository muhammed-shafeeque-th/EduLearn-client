'use client';

import { useState, useCallback } from 'react';
import { Ban, UserCheck, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import { Instructor } from '@/types/user';
import { useAdminUser } from '@/states/server/admin/use-admin-users';
import { getErrorMessage } from '@/lib/utils';

interface InstructorSettingsProps {
  instructor: Instructor;
}

export function InstructorSettings({ instructor }: InstructorSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { blockUser, unblockUser, deleteUser } = useAdminUser(instructor.id);

  // Handle block/unblock action
  const handleBlockToggle = useCallback(() => {
    startTransition(async () => {
      try {
        let result;
        if (instructor.status === 'blocked') {
          result = await unblockUser(instructor.id);
        } else {
          result = await blockUser(instructor.id);
        }
        if (result?.success) {
          toast.success({
            title:
              result.message ||
              (instructor.status === 'blocked' ? 'User unblocked' : 'User blocked'),
          });
        } else {
          toast.error({ title: result?.message || 'Failed to update instructor status' });
        }
      } catch (error) {
        toast.error({ title: getErrorMessage(error) });
      }
    });
  }, [blockUser, unblockUser, instructor.instructorProfile, instructor.status]);

  // Handle delete action
  const handleDelete = useCallback(() => {
    startTransition(async () => {
      try {
        const result = await deleteUser(instructor.id);
        if (result?.success) {
          toast.success({ title: result.message || 'User deleted successfully.' });
        } else {
          toast.error({ title: result?.message || 'Failed to delete user' });
        }
      } catch (error) {
        toast.error({ title: getErrorMessage(error) });
      }
    });
  }, [deleteUser, instructor.id]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            aria-label="Account Settings"
            disabled={isPending}
          >
            <Settings className="mr-2 h-4 w-4" />
            Account Settings
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={handleBlockToggle}
            className={instructor.status === 'blocked' ? 'text-green-600' : 'text-orange-600'}
            disabled={isPending}
            aria-label={instructor.status === 'blocked' ? 'Unblock user' : 'Block user'}
          >
            {instructor.status === 'blocked' ? (
              <>
                <UserCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                Unblock
              </>
            ) : (
              <>
                <Ban className="mr-2 h-4 w-4" aria-hidden="true" />
                Block
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
            disabled={isPending}
            aria-label="Delete user"
          >
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">{instructor.username}</span>? This action cannot be
              undone and will remove all associated courses and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDelete();
                setShowDeleteDialog(false);
              }}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
