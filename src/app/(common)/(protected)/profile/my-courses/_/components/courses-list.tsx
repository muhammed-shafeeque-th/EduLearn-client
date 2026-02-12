'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search, Clock, CheckCircle, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CourseCard } from './course-card';
import Pagination from '@/components/ui/pagination';
import type { Enrollment } from '@/types/enrollment';

interface CoursesListProps {
  enrollments: Enrollment[];
  onCourseClick?: (enrollment: Enrollment) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

type FilterStatus = 'all' | 'ACTIVE' | 'COMPLETED' | 'DROPPED';

// function getInstructorName(course: EnrollmentCourse) {
//   if (course && typeof course.instructor === 'object') {
//     if ('firstName' in course. && 'lastName' in course.instructor) {
//       return `${course.instructor.firstName} ${course.instructor.lastName}`;
//     }
//     // fallback to displayName or similar if exists
//     if ('displayName' in course.instructor) {
//       return course.instructor.displayName;
//     }
//   }
//   return '';
// }

export function CoursesList({
  enrollments,
  onCourseClick,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: CoursesListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 12;

  const categories = useMemo(() => {
    const found = new Set<string>();
    enrollments.forEach(({ course }) => {
      if (typeof course === 'object' && typeof course.category === 'string') {
        found.add(course.category);
      }
    });
    return Array.from(found).sort();
  }, [enrollments]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enrollment) => {
      const course = enrollment.course;
      if (typeof course !== 'object') return false;

      const q = searchQuery.trim().toLowerCase();
      let matchesSearch = true;
      if (q) {
        matchesSearch =
          course.title.toLowerCase().includes(q) ||
          course.instructor.name.toLowerCase().includes(q) ||
          course.category.toLowerCase().includes(q);
      }

      const matchesStatus = filterStatus === 'all' || enrollment.status === filterStatus;
      const matchesCategory = !selectedCategory || course.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [enrollments, searchQuery, filterStatus, selectedCategory]);
  const totalPages = Math.max(1, Math.ceil(filteredEnrollments.length / itemsPerPage));
  const paginatedEnrollments = filteredEnrollments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: FilterStatus) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = useCallback((value: string | null) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilterStatus('all');
    setSelectedCategory(null);
    setCurrentPage(1);
  }, []);
  const hasActiveFilters = !!searchQuery || filterStatus !== 'all' || !!selectedCategory;

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by course, instructor, or category"
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>

        <Select value={filterStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="DROPPED">Dropped</SelectItem>
          </SelectContent>
        </Select>

        {categories.length > 0 && (
          <Select
            value={selectedCategory ?? '__ALL_CATEGORIES__'}
            onValueChange={(v) => handleCategoryChange(v === '__ALL_CATEGORIES__' ? null : v)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL_CATEGORIES__">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem value={cat} key={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasActiveFilters && (
          <Button size="sm" variant="outline" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Results & Active Filters */}
      <div className="flex flex-wrap items-center gap-4 mt-2">
        <span className="text-sm text-muted-foreground">
          Showing {paginatedEnrollments.length} of {filteredEnrollments.length} courses
        </span>
        {hasActiveFilters && (
          <div className="flex gap-2 flex-wrap">
            {filterStatus !== 'all' && (
              <Badge variant="secondary">
                {filterStatus === 'ACTIVE' && <Clock className="inline w-3 h-3 mr-1" />}
                {filterStatus === 'COMPLETED' && <CheckCircle className="inline w-3 h-3 mr-1" />}
                {filterStatus === 'DROPPED' && <BookOpen className="inline w-3 h-3 mr-1" />}
                {filterStatus}
              </Badge>
            )}
            {selectedCategory && <Badge variant="secondary">{selectedCategory}</Badge>}
          </div>
        )}
      </div>

      {/* Courses List */}
      {paginatedEnrollments.length > 0 ? (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedEnrollments.map((enrollment) => (
              <CourseCard key={enrollment.id} enrollment={enrollment} onClick={onCourseClick} />
            ))}
          </div>

          {/* Paging */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

          {/* Optional: Load more (for legacy / extra fetch) */}
          {hasMore && currentPage === totalPages && (
            <div className="flex justify-center mt-6">
              <Button variant="outline" onClick={onLoadMore} disabled={isLoadingMore}>
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
          <p className="text-muted-foreground mb-4">
            Adjust your search or filters to see your enrollments.
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
