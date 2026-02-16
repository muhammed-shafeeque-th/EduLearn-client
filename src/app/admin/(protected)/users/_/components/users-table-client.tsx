'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronDown, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserRow } from './user-row';
import { UserActions } from './user-action';
import { TableSkeleton } from '../../../_components/__table/table-skeleton';
import { UserMeta } from '@/types/user';

interface UsersTableClientProps {
  users: UserMeta[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  isLoading: boolean;
  searchParams: {
    search?: string;
    status?: string;
    page?: string;
    searchField?: 'username' | 'email';
  };
  onUpdateSearchParams: (updates: Record<string, string | undefined>) => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
];

const SEARCH_FIELD_OPTIONS = [
  { value: 'username', label: 'Username' },
  { value: 'email', label: 'Email' },
];

const capitalize = (str: string) =>
  typeof str === 'string' && str.length ? str.charAt(0).toUpperCase() + str.slice(1) : str;

const truncateText = (str: string, length: number) => {
  if (typeof str !== 'string') return str;
  return str.length > length ? str.slice(0, length) + '...' : str;
};

function getPaginationRange(totalPages: number, currentPage: number): number[] {
  const delta = 2;
  let start = Math.max(currentPage - delta, 1);
  let end = Math.min(currentPage + delta, totalPages);

  if (currentPage <= delta) {
    end = Math.min(1 + 2 * delta, totalPages);
  }
  if (currentPage + delta > totalPages) {
    start = Math.max(totalPages - 2 * delta, 1);
  }

  return Array.from({ length: end - start + 1 }, (_v, k) => start + k);
}

export function UsersTableClient({
  users,
  totalPages,
  totalItems,
  currentPage,
  isLoading,
  searchParams,
  onUpdateSearchParams,
}: UsersTableClientProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const [searchField, setSearchField] = useState<'username' | 'email'>(
    searchParams.searchField || 'username'
  );

  const handleSearch = useCallback(
    (value: string) => {
      onUpdateSearchParams({
        search: value || undefined,
        page: undefined,
        searchField,
      });
    },
    [onUpdateSearchParams, searchField]
  );

  const handleStatusFilter = useCallback(
    (status: string) => {
      onUpdateSearchParams({
        status: status === 'all' ? undefined : status,
        page: undefined,
      });
    },
    [onUpdateSearchParams]
  );

  const handleSearchFieldChange = (field: 'username' | 'email') => {
    setSearchField(field);

    onUpdateSearchParams({
      searchField: field,
      page: undefined,

      search: searchParams.search,
    });
  };

  const columns: ColumnDef<UserMeta>[] = useMemo(
    () => [
      {
        accessorKey: 'username',
        accessorFn: (row) => row.firstName + ' ' + row.lastName,
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            User
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <UserRow user={row.original} />,
      },
      {
        accessorKey: 'email',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="font-medium text-sm">{row.original.email ?? '-'}</div>,
      },
      {
        accessorKey: 'bio',
        header: 'Bio',
        cell: ({ row }) => {
          const bio = row.original?.bio ?? '-';
          const truncatedBio = truncateText(bio, 15);
          return (
            <div className="font-medium text-sm" title={bio}>
              {truncatedBio}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status: string = row.getValue('status') as string;
          const display = capitalize(status);
          let colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
          if (status === 'active') {
            colorClass = 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
          } else if (status === 'pending') {
            colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
          }
          return (
            <div
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
            >
              {display}
            </div>
          );
        },
      },
      {
        accessorKey: 'city',
        accessorFn: (row) => row.city ?? '-',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            City
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-center font-medium">{row.getValue('city')}</div>,
      },
      {
        accessorKey: 'gender',
        accessorFn: (row) => row.gender ?? '-',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Gender
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-center font-medium">{row.getValue('gender')}</div>,
      },
      {
        accessorKey: 'country',
        accessorFn: (row) => row.country ?? '-',
        header: 'Country',
        cell: ({ row }) => <div className="text-center font-medium">{row.getValue('country')}</div>,
      },

      {
        accessorKey: 'phone',
        accessorFn: (row) => row.phone ?? '-',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Phone
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="text-center font-medium">{row.getValue('phone')}</div>,
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => <UserActions user={row.original} />,
      },
    ],
    []
  );

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
  });

  if (isLoading) {
    return <TableSkeleton />;
  }

  const paginationRange = getPaginationRange(totalPages, currentPage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Users Management</CardTitle>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search users by ${searchField}...`}
                  defaultValue={searchParams.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                  aria-label="Search users"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              {/* Field switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-[108px] flex items-center justify-between"
                    aria-haspopup="listbox"
                  >
                    {SEARCH_FIELD_OPTIONS.find((opt) => opt.value === searchField)?.label}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {SEARCH_FIELD_OPTIONS.map((opt) => (
                    <DropdownMenuCheckboxItem
                      key={opt.value}
                      checked={searchField === opt.value}
                      onCheckedChange={() =>
                        handleSearchFieldChange(opt.value as 'username' | 'email')
                      }
                    >
                      {opt.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" aria-haspopup="listbox">
                    <Filter className="mr-2 h-4 w-4" />
                    Status
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {STATUS_OPTIONS.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={
                        option.value === 'all'
                          ? !searchParams.status
                          : searchParams.status === option.value
                      }
                      onCheckedChange={() => handleStatusFilter(option.value)}
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          <nav className="flex items-center justify-between space-x-2 py-4" aria-label="pagination">
            <div className="text-sm text-muted-foreground">
              Showing {users.length} of {totalItems} users
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onUpdateSearchParams({
                    page: Math.max(1, currentPage - 1).toString(),
                  })
                }
                disabled={currentPage <= 1}
                aria-label="Previous page"
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {paginationRange.map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onUpdateSearchParams({ page: page.toString() })}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onUpdateSearchParams({
                    page: Math.min(totalPages, currentPage + 1).toString(),
                  })
                }
                disabled={currentPage >= totalPages}
                aria-label="Next page"
              >
                Next
              </Button>
            </div>
          </nav>
        </CardContent>
      </Card>
    </motion.div>
  );
}
