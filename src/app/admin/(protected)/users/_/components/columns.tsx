'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useHandleDelete } from './block-user-alert';
import { getNavigator } from '@/lib/utils';
import { User } from '@/types/user';

export const columns: ColumnDef<Partial<User>>[] = [
  {
    accessorKey: 'userId',
    header: 'ID',
  },

  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          {/* <ArrowUpDown /> */}
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue('email')}</div>,
  },
  {
    accessorKey: 'username',
    header: 'Name',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    // cell: ({ row }) => {
    //   const isBlocked = row.getValue('isBlocked') == true;
    //   return isBlocked ? 'Blocked' : 'Active';
    // },
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return date.toLocaleDateString();
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => getNavigator()?.clipboard.writeText(user.userId!)}>
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                useHandleDelete(
                  row.getValue('userId'),
                  row.getValue('status') === 'blocked' ? 'blocked' : 'active'
                )
              }
            >
              {row.getValue('status') ? 'Unblock User' : 'Block User'}
            </DropdownMenuItem>
            {/* <DropdownMenuItem>Edit user</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
