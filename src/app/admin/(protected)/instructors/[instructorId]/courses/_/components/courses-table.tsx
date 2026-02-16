'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { Search, ArrowUpDown, MoreHorizontal, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/ui/pagination';
import { CourseMeta } from '@/types/course';
import { useInstructorCourses } from '@/states/server/course/use-courses';
import Image from 'next/image';

interface CoursesTableProps {
  instructorId: string;
  searchParams: { search?: string; status?: string; page?: string };
}

export type CourseStatus = 'draft' | 'published' | 'unpublished' | 'deleted';

const PAGE_LIMIT = 12;
const DESCRIPTION_MAX_LENGTH = 80;

function truncateDescription(description: string, maxLength: number): string {
  if (!description) return '';
  if (description.length <= maxLength) return description;
  return description.slice(0, maxLength).trim() + '...';
}

export function CoursesTable({ instructorId, searchParams }: CoursesTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const urlSearchParams = useSearchParams();

  const [page, setPage] = useState<number>(() => {
    const pageNum = Number(searchParams.page);
    return Number.isInteger(pageNum) && pageNum > 0 ? pageNum : 1;
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState(searchParams.search || '');

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const apiParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_LIMIT,
      ...(search ? { search } : {}),
      ...(searchParams.status ? { status: searchParams.status } : {}),
    }),
    [page, search, searchParams.status]
  );

  const { courses, isLoading, isError, totalPages } = useInstructorCourses(instructorId, apiParams);

  const coursesData: CourseMeta[] = useMemo(() => {
    return courses.map((d) => ({
      ...d,
      enrolledStudents: typeof d?.students === 'number' ? d.students : 0,
      rating: typeof d?.rating === 'number' ? d.rating : 0,
    }));
  }, [courses]);

  const pageCount: number = totalPages;

  const updateQuery = useCallback(
    (params: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(urlSearchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === '') next.delete(key);
        else next.set(key, String(value));
      });
      router.push(`${pathname}?${next.toString()}`);
    },
    [router, pathname, urlSearchParams]
  );

  const handleNavigateToCourse = useCallback(
    (courseId: string) => {
      router.push(`/admin/instructors/${instructorId}/courses/${courseId}`);
    },
    [router, instructorId]
  );

  const columns: ColumnDef<CourseMeta>[] = useMemo(
    () => [
      {
        accessorKey: 'thumbnail',
        header: 'Thumbnail',
        enableSorting: false,
        cell: ({ row }) => {
          const thumbnailUrl = row.original.thumbnail ?? '/images/course-placeholder.png';
          return (
            <button
              type="button"
              tabIndex={0}
              aria-label={`Go to course ${row.original.title}`}
              className="p-0 border-none bg-transparent cursor-pointer focus:outline-none"
              style={{ lineHeight: 0 }}
              onClick={() => handleNavigateToCourse(row.original.id)}
            >
              <Image
                src={thumbnailUrl}
                alt={row.original.title ? row.original.title : 'Course thumbnail'}
                className="w-14 h-14 rounded object-cover border bg-muted"
                width={56}
                height={56}
                priority={false}
              />
            </button>
          );
        },
      },
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            type="button"
            tabIndex={0}
            aria-label="Sort by title"
          >
            Course Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const course = row.original;
          return (
            <div>
              <div className="font-medium">{course.title}</div>
              {course.description && (
                <div className="text-sm text-muted-foreground" title={course.description}>
                  {truncateDescription(course.description, DESCRIPTION_MAX_LENGTH)}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as CourseMeta['status'];
          const variants = {
            published: 'default',
            draft: 'secondary',
            deleted: 'destructive',
            unpublished: 'secondary',
          } as const;
          return (
            <Badge variant={variants[status as keyof typeof variants] ?? 'secondary'}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'enrolledStudents',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            type="button"
            tabIndex={0}
            aria-label="Sort by Students"
          >
            Students
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-center font-medium">{row.getValue('enrolledStudents')}</div>
        ),
      },
      {
        accessorKey: 'rating',
        header: 'Rating',
        cell: ({ row }) => {
          const rating = row.getValue('rating') as number;
          const course = row.original;
          if (course.status === 'draft') {
            return <span className="text-muted-foreground">N/A</span>;
          }
          return (
            <div className="flex items-center space-x-1">
              <span role="img" aria-label="star" className="text-yellow-400">
                ★
              </span>
              <span className="font-medium">{Number(rating || 0).toFixed(1)}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'price',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            type="button"
            tabIndex={0}
            aria-label="Sort by price"
          >
            Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const price = row.getValue('price') as number | undefined;
          return (
            <div className="font-medium">
              {typeof price === 'number' && !isNaN(price) ? (
                <>${price}</>
              ) : (
                <span className="text-muted-foreground">&mdash;</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'updatedAt',
        header: 'Last Updated',
        cell: ({ row }) => {
          const dateVal = row.getValue('updatedAt');
          const date = dateVal ? new Date(dateVal?.toString()) : null;
          return <div className="text-sm">{date ? date.toLocaleDateString() : '—'}</div>;
        },
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const course = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  type="button"
                  tabIndex={0}
                  aria-label="Open actions menu"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleNavigateToCourse(course.id)}
                  tabIndex={0}
                  aria-label="View course details"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleNavigateToCourse]
  );

  const table = useReactTable({
    data: coursesData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    manualPagination: true,
    pageCount,
  });

  const handlePageChange = useCallback(
    (nextPage: number) => {
      setPage(nextPage);
      updateQuery({ page: nextPage });
    },
    [updateQuery]
  );

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearch(value);
      setPage(1);

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        updateQuery({ search: value || undefined, page: 1 });
      }, 300);
    },
    [updateQuery]
  );

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>Courses</CardTitle>
            <div className="relative max-w-sm w-full">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={handleSearch}
                className="pl-10"
                aria-label="Search courses"
                autoComplete="off"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Loading courses...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-red-600">
                      Failed to load courses.
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
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
                      No courses found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <Pagination currentPage={page} totalPages={pageCount} onPageChange={handlePageChange} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
