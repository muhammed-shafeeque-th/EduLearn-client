'use client';

import { useState, useCallback, useMemo, useDeferredValue, useEffect } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Grid3X3, List, Loader2 } from 'lucide-react';
import { CoursesSidebar } from './courses-sidebar';
import { CourseGrid } from './course-grid';
import CourseList from './course-list';
import { useDebounce } from '@/hooks/use-debounce';
import type { Course } from '@/types/course';
import { CourseFilters } from '../types';
import { useInfiniteCoursesLoader } from '../hooks/use-infinite-course';
import { CourseSortBy } from '@/services/course.service';
import { CoursesGridSkeleton } from './skeletons';

interface CoursesPageContainerProps {
  initialCourses: Course[];
  initialPagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const mockSuggestions = ['React', 'Python', 'Web Development', 'Data Science'];

function parseQueryArray(value: string | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value
    .split(',')
    .map((v) => decodeURIComponent(v.trim()))
    .filter(Boolean);
}

export function CoursesPageContainer({}: CoursesPageContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPage = parseInt(searchParams.get('page') ?? '1', 10);
  const initialPageSize = parseInt(searchParams.get('pageSize') ?? '12', 10);
  const initialCategories = parseQueryArray(searchParams.get('category'));
  const initialSearch = searchParams.get('q') ?? '';
  const initialSortBy = searchParams.get('sort') ?? 'trending';
  const initialRating = parseQueryArray(searchParams.get('rating'));

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState<CourseFilters>({
    categories: initialCategories,
    rating: initialRating,
    level: [],
    price: { min: 0, max: 3500, free: false, paid: false },
  });

  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') ?? '');
    setSortBy(searchParams.get('sort') ?? 'trending');
    setPage(parseInt(searchParams.get('page') ?? '1', 10));
    setPageSize(parseInt(searchParams.get('pageSize') ?? '12', 10));

    setFilters((prev) => ({
      ...prev,
      categories: parseQueryArray(searchParams.get('category')),
      rating: parseQueryArray(searchParams.get('rating')),
    }));
  }, [searchParams]);

  const updateQuery = useCallback(
    (updates: Record<string, any>, resetPage = true) => {
      const currentParams = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
          currentParams.delete(key);
        } else {
          if (Array.isArray(value)) {
            currentParams.set(key, value.map(String).join(','));
          } else {
            currentParams.set(key, String(value));
          }
        }
      });
      if (resetPage) currentParams.set('page', '1');
      router.replace(`${pathname}?${currentParams.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const debouncedSearch = useDebounce(searchQuery, 500);
  const deferredFilters = useDeferredValue(filters);

  const minRating = useMemo(() => {
    if (!deferredFilters.rating || deferredFilters.rating.length === 0) return undefined;
    return Math.min(...deferredFilters.rating.map((v) => parseInt(v, 10) || 0));
  }, [deferredFilters.rating]);

  const { courses, lastElementRef, isFetchingNextPage, hasNextPage, error, isError, isLoading } =
    useInfiniteCoursesLoader({
      category: deferredFilters.categories.join(','),
      level: deferredFilters.level.join(','),
      maxPrice: deferredFilters.price.max,
      minPrice: deferredFilters.price.min,

      rating: minRating ?? 0,
      search: debouncedSearch,
      sortBy: sortBy as CourseSortBy,
      pageSize,
    });

  const handleFiltersChange = useCallback(
    (newFilters: Partial<CourseFilters>) => {
      setFilters((prev) => {
        const updated = { ...prev, ...newFilters };
        if (JSON.stringify(prev) !== JSON.stringify(updated)) {
          updateQuery(
            {
              category: updated.categories,
              rating: updated.rating,
            },
            true
          );
        }
        return updated;
      });
    },
    [updateQuery]
  );

  const clearAllFilters = useCallback(() => {
    setFilters({
      categories: [],
      rating: [],
      level: [],
      price: { min: 0, max: 500, free: false, paid: false },
    });
    setSearchQuery('');
    updateQuery(
      {
        q: null,
        category: [],
        rating: [],
        page: 1,
      },
      false
    );
  }, [updateQuery]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      updateQuery({ q: value }, true);
    },
    [updateQuery]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      setSortBy(value);
      updateQuery({ sort: value });
    },
    [updateQuery]
  );

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    updateQuery({ q: suggestion }, true);
  };

  const activeFiltersCount = useMemo(() => {
    return (
      filters.categories.length +
      filters.rating.length +
      filters.level.length +
      (filters.price.free ? 1 : 0) +
      (filters.price.paid ? 1 : 0)
    );
  }, [filters]);

  const totalResults = courses.length;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block sticky top-0 h-screen overflow-y-auto">
        <CoursesSidebar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearAll={clearAllFilters}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Search Section */}
          <section className="mb-6" aria-label="Search courses">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="search"
                placeholder="What do you want to learn..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                aria-label="Search courses"
              />
            </div>

            {/* Search Suggestions */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Suggestions:</span>
              {mockSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </section>

          {/* Controls Bar */}
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Results Count */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {totalResults.toLocaleString()}
                  </span>{' '}
                  results
                  {debouncedSearch && ` for "${debouncedSearch}"`}
                </span>
                {(isLoading || isFetchingNextPage) && (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {/* <option value="trending">Trending</option> */}
                  <option value="latest">Latest</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'grid' ? 'bg-white shadow' : 'hover:bg-gray-200'
                  }`}
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'list' ? 'bg-white shadow' : 'hover:bg-gray-200'
                  }`}
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {filters.categories.map((category) => (
                <span
                  key={category}
                  className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-1"
                >
                  {category}
                  <button
                    onClick={() =>
                      handleFiltersChange({
                        categories: filters.categories.filter((c) => c !== category),
                      })
                    }
                    className="hover:text-red-600 ml-1"
                    aria-label={`Remove ${category} filter`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {filters.rating && filters.rating.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                  Rating: {minRating}+
                  <button
                    onClick={() => handleFiltersChange({ rating: [] })}
                    className="hover:text-red-600 ml-1"
                    aria-label="Remove rating filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {debouncedSearch && (
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                  Search: &quot;{debouncedSearch}&quot;
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      updateQuery({ q: null });
                    }}
                    className="hover:text-red-600 ml-1"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">Error loading courses: {error.message}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-600 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Courses Display */}

          {isLoading && !isError && <CoursesGridSkeleton />}

          {courses.length === 0 || isError ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <CourseGrid courses={courses} />
              ) : (
                <CourseList courses={courses} />
              )}

              {/* Infinite Scroll Trigger */}
              {hasNextPage && (
                <div ref={lastElementRef} className="h-20 flex items-center justify-center">
                  {hasNextPage && <Loader2 className="h-8 w-8 animate-spin text-blue-600" />}
                </div>
              )}

              {/* End of Results */}
              {!hasNextPage && courses.length > 0 && (
                <div className="text-center py-8 text-gray-600">
                  <p>You&apos;ve reached the end</p>
                  <p className="text-sm mt-1">Showing all {totalResults} results</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="lg:hidden">
          <CoursesSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearAll={clearAllFilters}
            isMobile
            onClose={() => setShowMobileFilters(false)}
          />
        </div>
      )}
    </div>
  );
}
