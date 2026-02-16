'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  // getPaginationRowModel,
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
import { InstructorRow } from './instructor-row';
import { InstructorActions } from './instructor-action';
import { TableSkeleton } from '../../../_components/__table/table-skeleton';
import { InstructorMeta } from '@/types/user';

interface InstructorsTableClientProps {
  instructors: InstructorMeta[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  isLoading: boolean;
  searchParams: { search?: string; status?: string; page?: string };
  onUpdateSearchParams: (updates: Record<string, string | undefined>) => void;
}

export function InstructorsTableClient({
  instructors,
  totalPages,
  totalItems,
  currentPage,
  isLoading,
  searchParams,
  onUpdateSearchParams,
}: InstructorsTableClientProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const handleSearch = useCallback(
    (value: string) => {
      onUpdateSearchParams({ search: value || undefined, page: undefined });
    },
    [onUpdateSearchParams]
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
        // The correct approach is to use 'accessorFn' when accessing nested properties:
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
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search instructors..."
                defaultValue={searchParams.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
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
                    checked={!searchParams.status}
                    onCheckedChange={() => handleStatusFilter('all')}
                  >
                    All Status
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={searchParams.status === 'active'}
                    onCheckedChange={() => handleStatusFilter('active')}
                  >
                    Active
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={searchParams.status === 'pending'}
                    onCheckedChange={() => handleStatusFilter('pending')}
                  >
                    Pending
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={searchParams.status === 'inactive'}
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
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {instructors.length} of {totalItems} instructors
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
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onUpdateSearchParams({ page: page.toString() })}
                    >
                      {page}
                    </Button>
                  );
                })}
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
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
