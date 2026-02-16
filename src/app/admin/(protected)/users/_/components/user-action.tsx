'use client';

import { useState, useCallback } from 'react';
import { MoreHorizontal, Ban, UserCheck, Trash2 } from 'lucide-react';
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
import { UserMeta } from '@/types/user';
import { useAdminUser } from '@/states/server/admin/use-admin-users';
import { getErrorMessage } from '@/lib/utils';

interface UserActionsProps {
  user: UserMeta;
}

export function UserActions({ user }: UserActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { blockUser, unblockUser, deleteUser } = useAdminUser(user.id);

  // Handle block/unblock action
  const handleBlockToggle = useCallback(() => {
    startTransition(async () => {
      try {
        let result;
        if (user.status === 'blocked') {
          result = await unblockUser(user.id);
        } else {
          result = await blockUser(user.id);
        }
        if (result?.success) {
          toast.success({
            title:
              result.message || (user.status === 'blocked' ? 'User unblocked' : 'User blocked'),
          });
        } else {
          toast.error({ title: result?.message || 'Failed to update user status' });
        }
      } catch (error) {
        toast.error({ title: getErrorMessage(error) });
      }
    });
  }, [blockUser, unblockUser, user.id, user.status]);

  // Handle delete action
  const handleDelete = useCallback(() => {
    startTransition(async () => {
      try {
        const result = await deleteUser(user.id);
        if (result?.success) {
          toast.success({ title: result.message || 'User deleted successfully.' });
        } else {
          toast.error({ title: result?.message || 'Failed to delete user' });
        }
      } catch (error) {
        toast.error({ title: getErrorMessage(error) });
      }
    });
  }, [deleteUser, user.id]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            disabled={isPending}
            aria-label="Open user actions menu"
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={handleBlockToggle}
            className={user.status === 'blocked' ? 'text-green-600' : 'text-orange-600'}
            disabled={isPending}
            aria-label={user.status === 'blocked' ? 'Unblock user' : 'Block user'}
          >
            {user.status === 'blocked' ? (
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
              <span className="font-semibold">{user.firstName + ' ' + user.lastName}</span>? This
              action cannot be undone and will remove all associated courses and data.
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
