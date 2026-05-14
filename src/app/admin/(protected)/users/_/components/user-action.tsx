'use client';

import { useState, useCallback } from 'react';
import { MoreHorizontal, Ban, UserCheck } from 'lucide-react';
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
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { useQueryClient } from '@tanstack/react-query';

interface UserActionsProps {
  user: UserMeta;
}

export function UserActions({ user }: UserActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const { blockAccount, unblockAccount, deleteUser } = useAdminUser(user.id);
  const queryClient = useQueryClient();

  // Handle block/unblock action
  const handleBlockToggle = useCallback(() => {
    startTransition(async () => {
      try {
        let result;
        if (user.status === 'blocked') {
          result = await unblockAccount(user.id);
        } else {
          result = await blockAccount(user.id);
        }
        if (result?.success) {
          toast.success({
            title:
              result.message ||
              (user.status === 'blocked' ? 'Account unblocked' : 'Account blocked'),
          });
        } else {
          toast.error({ title: result?.message || 'Failed to update user status' });
        }
      } catch (error) {
        toast.error({ title: getErrorMessage(error) });
      } finally {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.list({}) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.usersStats() });
      }
    });
  }, [blockAccount, unblockAccount, user.id, user.status, queryClient]);

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
      } finally {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.list({}) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.usersStats() });
      }
    });
  }, [deleteUser, user.id, queryClient]);

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
            onClick={() => setShowBlockDialog(true)}
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
          {/* <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
            disabled={isPending}
            aria-label="Delete user"
          >
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Delete
          </DropdownMenuItem> */}
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

      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user.status === 'blocked' ? 'Unblock User Account' : 'Block User Account'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {user.status === 'blocked' ? 'unblock' : 'block'} this
              Account
              <span className="font-semibold">{user.firstName + ' ' + user.lastName}</span>?
              {user.status !== 'blocked' &&
                ' This will restrict their complete access to the platform'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleBlockToggle();
                setShowBlockDialog(false);
              }}
              disabled={isPending}
              className={
                user.status === 'blocked'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }
            >
              {user.status === 'blocked' ? 'Unblock' : 'Block'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
