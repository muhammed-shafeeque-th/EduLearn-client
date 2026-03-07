'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ColumnDef,
  flexRender,
  useReactTable,
  ColumnFiltersState,
  getCoreRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  Updater,
} from '@tanstack/react-table';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  ChevronDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
} from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { TableSkeleton } from './skeletons/table-skeleton';
import { UserMeta } from '@/types/user';
import { truncateText } from '@/lib/utils';

function capitalize(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

type UsersTableClientProps = {
  users: UserMeta[];
  isLoading: boolean;
  pageCount: number;
  pagination: PaginationState;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  onPaginationChange: (updater: Updater<PaginationState>) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
  onColumnFiltersChange: (updater: Updater<ColumnFiltersState>) => void;
  searchField: 'username' | 'email';
  onSearchFieldChange: (field: 'username' | 'email') => void;
  onRefresh: () => Promise<void>;
};

const SEARCH_FIELD_OPTIONS = [
  { value: 'username', label: 'Username' },
  { value: 'email', label: 'Email' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'rejected', label: 'Rejected' },
];

export function UsersTableClient({
  users,
  isLoading,
  pageCount,
  pagination,
  sorting,
  columnFilters,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  searchField,
  onSearchFieldChange,
  onRefresh,
}: UsersTableClientProps) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [searchValue, setSearchValue] = useState('');

  // Sync searchValue with columnFilters if needed, but since we control it externally,
  // we just need to update the parent's filter when input changes.

  // Helper to get current search value from columnFilters
  const currentSearchValue = useMemo(() => {
    return (columnFilters.find((f) => f.id === searchField)?.value as string) || '';
  }, [columnFilters, searchField]);

  // Update local state when prop changes (ONLY when prop changes, not when local state changes)
  const [prevPropSearchValue, setPrevPropSearchValue] = useState(currentSearchValue);
  if (currentSearchValue !== prevPropSearchValue) {
    setSearchValue(currentSearchValue);
    setPrevPropSearchValue(currentSearchValue);
  }

  // Debounce search update
  useEffect(() => {
    const timer = setTimeout(() => {
      onColumnFiltersChange((prev: ColumnFiltersState) => {
        const newer = prev.filter(
          (f) => f.id !== searchField && f.id !== 'email' && f.id !== 'username'
        );
        if (searchValue) {
          newer.push({ id: searchField, value: searchValue });
        }
        return newer;
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, searchField, onColumnFiltersChange]);

  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSearchFieldChange = useCallback(
    (field: 'username' | 'email') => {
      // Notify parent about field change
      onSearchFieldChange(field);
      // Determine if we should clear or keep search value
      // Keeping it is usually better UX
    },
    [onSearchFieldChange]
  );

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
    state: {
      pagination,
      sorting,
      columnFilters,
      rowSelection,
    },
    pageCount,
    manualPagination: true,
    manualSorting: false, // Client-side sorting
    manualFiltering: true,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return <TableSkeleton />;
  }

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
                  value={searchValue}
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
              <Button variant="outline" size="sm" onClick={() => onRefresh()} title="Refresh">
                <RotateCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
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
                          ? !columnFilters.find((f) => f.id === 'status')
                          : columnFilters.find((f) => f.id === 'status')?.value === option.value
                      }
                      onCheckedChange={() =>
                        table
                          .getColumn('status')
                          ?.setFilterValue(option.value === 'all' ? undefined : option.value)
                      }
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
          {/* Pagination */}
          <div className="flex items-center justify-between px-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length > 0 ? (
                <>
                  Showing{' '}
                  {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}{' '}
                  to{' '}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) *
                      table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length
                  )}{' '}
                  of {table.getFilteredRowModel().rows.length} users
                </>
              ) : (
                'No users found'
              )}
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
