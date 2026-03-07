'use client';

import { useState } from 'react';
import { MoreHorizontal, Eye, Ban, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { handleInstructorAction } from '../libs/actions';
import { InstructorMeta } from '@/types/user';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';

interface InstructorActionsProps {
  instructor: InstructorMeta;
}

export function InstructorActions({ instructor }: InstructorActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const queryClient = useQueryClient();

  const handleAction = (action: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('instructorId', instructor.id);
      formData.append('action', action);

      const result = await handleInstructorAction(null, formData);

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.instructors() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.usersStats() });

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push(`/admin/instructors/${instructor.id}`)}>
            <Eye className="mr-2 h-4 w-4" />
            View Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {instructor.status === 'not-verified' && (
            <DropdownMenuItem onClick={() => handleAction('approve')} className="text-green-600">
              <UserCheck className="mr-2 h-4 w-4" />
              Approve
            </DropdownMenuItem>
          )}

          {/* Block/Unblock */}
          <DropdownMenuItem
            onClick={() => setShowBlockDialog(true)}
            className={instructor.status === 'blocked' ? 'text-green-600' : 'text-orange-600'}
          >
            {instructor.status === 'blocked' ? (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Unblock
              </>
            ) : (
              <>
                <Ban className="mr-2 h-4 w-4" />
                Block
              </>
            )}
          </DropdownMenuItem>

          {/* <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setShowDeleteDialog(true);
            }}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {instructor.status === 'blocked' ? 'Unblock Instructor' : 'Block Instructor'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {instructor.status === 'blocked' ? 'unblock' : 'block'}{' '}
              <span className="font-semibold">{instructor.username}</span>?
              {instructor.status !== 'blocked' &&
                ' This will restrict their access to the platform.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleAction(instructor.status === 'blocked' ? 'unblock' : 'block');
                setShowBlockDialog(false);
              }}
              className={
                instructor.status === 'blocked'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }
            >
              {instructor.status === 'blocked' ? 'Unblock' : 'Block'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Instructor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {instructor.username}? This action cannot be undone
              and will remove all associated courses and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleAction('delete');
                setShowDeleteDialog(false);
              }}
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
