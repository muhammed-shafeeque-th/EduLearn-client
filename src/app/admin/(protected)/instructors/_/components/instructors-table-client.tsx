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
import { InstructorRow } from './instructor-row';
import { InstructorActions } from './instructor-action';
import { InstructorMeta } from '@/types/user';
import { TableSkeleton } from './skeletons/table-skeleton';

type InstructorsTableClientProps = {
  instructors: InstructorMeta[];
  isLoading: boolean;
  pageCount: number;
  pagination: PaginationState;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  onRefresh: () => Promise<void>;
  onPaginationChange: (updater: Updater<PaginationState>) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
  onColumnFiltersChange: (updater: Updater<ColumnFiltersState>) => void;
  searchField: 'username' | 'email';
  onSearchFieldChange: (field: 'username' | 'email') => void;
};

const SEARCH_FIELD_OPTIONS = [
  { value: 'username', label: 'Instructor' },
  { value: 'email', label: 'Email' },
];

export function InstructorsTableClient({
  instructors,
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
}: InstructorsTableClientProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [searchValue, setSearchValue] = useState('');

  const currentSearchValue = useMemo(() => {
    return (columnFilters.find((f) => f.id === searchField)?.value as string) || '';
  }, [columnFilters, searchField]);

  const [prevPropSearchValue, setPrevPropSearchValue] = useState(currentSearchValue);
  if (currentSearchValue !== prevPropSearchValue) {
    setSearchValue(currentSearchValue);
    setPrevPropSearchValue(currentSearchValue);
  }

  // Debounce search update
  useEffect(() => {
    const timer = setTimeout(() => {
      onColumnFiltersChange((prev: ColumnFiltersState) => {
        const newer = prev.filter((f) => f.id !== 'username' && f.id !== 'email');
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

  const handleStatusFilter = useCallback(
    (status: string) => {
      onColumnFiltersChange((prev: ColumnFiltersState) => {
        const newer = prev.filter((f) => f.id !== 'status');
        if (status !== 'all') {
          newer.push({ id: 'status', value: status });
        }
        return newer;
      });
    },
    [onColumnFiltersChange]
  );

  const columns: ColumnDef<InstructorMeta>[] = useMemo(
    () => [
      {
        accessorKey: 'username',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Instructor
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <InstructorRow instructor={row.original} />,
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
        cell: ({ row }) => <div className="font-medium text-sm">{row.original.email}</div>,
      },
      {
        accessorKey: 'specialization',
        header: 'Specialization',
        cell: ({ row }) => {
          // instructorProfile.tags (string[]), or instructorProfile.expertise (string | undefined)
          const instructor = row.original;
          // Prefer expertise, fallback to tags, or show '-'
          const specialization =
            instructor.expertise ||
            (instructor.tags && instructor.tags.length > 0 ? instructor.tags.join(', ') : '-') ||
            '-';
          return <div className="font-medium text-sm">{specialization}</div>;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          return (
            <div
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                status === 'active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.totalCourses ?? '-',
        id: 'totalCourses',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Courses
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        // The 'cell' property lets you customize how the cell is rendered.
        // It receives a context object as its argument, which includes 'row'.
        // Because the column uses accessorFn to flatten instructor.totalCourses
        // into the 'totalCourses' column, calling row.getValue('totalCourses') here will return the
        // value produced by accessorFn (which is row.instructorProfile?.totalCourses ?? '-').

        cell: ({ row }) => {
          // If the accessorFn is correct, this works:
          return <div className="text-center font-medium">{row.getValue('totalCourses')}</div>;
        },
      },
      {
        accessorKey: 'totalStudents',
        accessorFn: (row) => row.totalStudents ?? '-',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Students
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-center font-medium">{row.getValue('totalStudents')}</div>
        ),
      },
      {
        accessorKey: 'rating',
        accessorFn: (row) => row.rating ?? '-',
        header: 'Rating',
        cell: ({ row }) => {
          const rating = row.getValue('rating') as number;
          return (
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">★</span>
              <span className="font-medium">{rating.toFixed(1)}</span>
            </div>
          );
        },
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => <InstructorActions instructor={row.original} />,
      },
    ],
    []
  );

  const table = useReactTable({
    data: instructors,
    columns,
    state: {
      pagination,
      sorting,
      columnFilters,
      rowSelection,
    },
    pageCount,
    manualPagination: true,
    manualSorting: false, // Client side sorting
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
          <CardTitle>Instructors Management</CardTitle>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search instructors by ${searchField === 'username' ? 'name' : 'email'}...`}
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="min-w-[100px]">
                    {SEARCH_FIELD_OPTIONS.find((opt) => opt.value === searchField)?.label}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {SEARCH_FIELD_OPTIONS.map((opt) => (
                    <DropdownMenuCheckboxItem
                      key={opt.value}
                      checked={searchField === opt.value}
                      onCheckedChange={() => onSearchFieldChange(opt.value as 'username' | 'email')}
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
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Status
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem
                    checked={!columnFilters.find((f) => f.id === 'status')}
                    onCheckedChange={() => handleStatusFilter('all')}
                  >
                    All Status
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnFilters.find((f) => f.id === 'status')?.value === 'active'}
                    onCheckedChange={() => handleStatusFilter('active')}
                  >
                    Active
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnFilters.find((f) => f.id === 'status')?.value === 'pending'}
                    onCheckedChange={() => handleStatusFilter('pending')}
                  >
                    Pending
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnFilters.find((f) => f.id === 'status')?.value === 'inactive'}
                    onCheckedChange={() => handleStatusFilter('inactive')}
                  >
                    Inactive
                  </DropdownMenuCheckboxItem>
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
                      No instructors found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

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
                  of {table.getFilteredRowModel().rows.length} instructors
                </>
              ) : (
                'No instructors found'
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
