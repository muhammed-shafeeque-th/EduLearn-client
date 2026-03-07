'use client';

import { useState, useCallback, useMemo, useDeferredValue, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { CoursesSidebar } from './courses-sidebar';
import { CourseGrid } from './course-grid';
// import CourseList from './course-list';
import { useDebounce } from '@/hooks/use-debounce';
// import type { Course } from '@/types/course';
import { CourseFilters } from '../types';
import { useInfiniteCoursesLoader } from '../hooks/use-infinite-course';
import { CourseSortBy } from '@/services/course.service';
import { CoursesGridSkeleton } from './skeletons';

// interface CoursesPageContainerProps {
//   initialCourses: Course[];
//   initialPagination: {
//     page: number;
//     pageSize: number;
//     total: number;
//     totalPages: number;
//   };
// }

const mockSuggestions = ['React', 'Python', 'Web Development', 'Data Science'];

function parseQueryArray(value: string | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value
    .split(',')
    .map((v) => decodeURIComponent(v.trim()))
    .filter(Boolean);
}

export function CoursesPageContainer() {
  // const router = useRouter();
  // const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPageSize = parseInt(searchParams.get('pageSize') ?? '12', 10);
  const initialCategories = parseQueryArray(searchParams.get('category'));
  const initialSearch = searchParams.get('q') ?? '';
  const initialSortBy = searchParams.get('sort') ?? 'trending';
  const initialRating = parseQueryArray(searchParams.get('rating'));

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState<CourseFilters>({
    categories: initialCategories,
    rating: initialRating,
    level: [],
    price: { min: 0, max: 3500, free: false, paid: false },
  });

  const [pageSize, setPageSize] = useState(initialPageSize);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') ?? '');
    setSortBy(searchParams.get('sort') ?? 'trending');
    setPageSize(parseInt(searchParams.get('pageSize') ?? '12', 10));

    setFilters((prev) => ({
      ...prev,
      categories: parseQueryArray(searchParams.get('category')),
      rating: parseQueryArray(searchParams.get('rating')),
    }));
  }, [searchParams]);

  // const updateQuery = useCallback(
  //   (updates: Record<string, string | number | string[] | null | undefined>, resetPage = true) => {
  //     const currentParams = new URLSearchParams(searchParams.toString());
  //     Object.entries(updates).forEach(([key, value]) => {
  //       if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
  //         currentParams.delete(key);
  //       } else {
  //         if (Array.isArray(value)) {
  //           currentParams.set(key, value.map(String).join(','));
  //         } else {
  //           currentParams.set(key, String(value));
  //         }
  //       }
  //     });
  //     if (resetPage) currentParams.set('page', '1');
  //     router.replace(`${pathname}?${currentParams.toString()}`, { scroll: false });
  //   },
  //   [router, pathname, searchParams]
  // );

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
        // if (JSON.stringify(prev) !== JSON.stringify(updated)) {
        //   updateQuery(
        //     {
        //       category: updated.categories,
        //       rating: updated.rating,
        //     },
        //     true
        //   );
        // }
        return updated;
      });
    },
    [setFilters]
  );

  const clearAllFilters = useCallback(() => {
    setFilters({
      categories: [],
      rating: [],
      level: [],
      price: { min: 0, max: 500, free: false, paid: false },
    });
    setSearchQuery('');
    // updateQuery(
    //   {
    //     q: null,
    //     category: [],
    //     rating: [],
    //     page: 1,
    //   },
    //   false
    // );
  }, [setSearchQuery]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      // updateQuery({ q: value }, true);
    },
    [setSearchQuery]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      setSortBy(value);
      // updateQuery({ sort: value });
    },
    [setSortBy]
  );

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    // updateQuery({ q: suggestion }, true);
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
      {/* Desktop Sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen overflow-y-auto border-r border-border/50">
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
          <section className="mb-8" aria-label="Search courses">
            <div className="relative mb-4 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
              <input
                type="search"
                placeholder="What do you want to learn..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-card text-card-foreground shadow-sm transition-all"
                aria-label="Search courses"
              />
            </div>

            {/* Search Suggestions */}
            <div className="flex items-center gap-2 flex-wrap px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground opacity-70">
                Popular:
              </span>
              {mockSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-1.5 text-xs font-medium border border-border rounded-full hover:bg-muted hover:border-primary/30 transition-all active:scale-95"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </section>

          {/* Controls Bar */}
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-4">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Results Count */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  <span className="text-primary font-bold">{totalResults.toLocaleString()}</span>{' '}
                  <span className="text-muted-foreground">results</span>
                  {debouncedSearch && (
                    <span className="text-muted-foreground italic ml-1">
                      for &quot;{debouncedSearch}&quot;
                    </span>
                  )}
                </span>
                {(isLoading || isFetchingNextPage) && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-muted-foreground hidden sm:inline uppercase tracking-tight">
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-sm font-medium cursor-pointer"
                >
                  <option value="latest">Latest</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 mb-8 flex-wrap px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2">
                Filters:
              </span>
              {filters.categories.map((category) => (
                <span
                  key={category}
                  className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 border border-primary/20"
                >
                  {category}
                  <button
                    onClick={() =>
                      handleFiltersChange({
                        categories: filters.categories.filter((c) => c !== category),
                      })
                    }
                    className="hover:text-destructive transition-colors text-lg leading-none"
                    aria-label={`Remove ${category} filter`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {filters.rating && filters.rating.length > 0 && (
                <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 border border-primary/20">
                  Rating: {minRating}+
                  <button
                    onClick={() => handleFiltersChange({ rating: [] })}
                    className="hover:text-destructive transition-colors text-lg leading-none"
                    aria-label="Remove rating filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {debouncedSearch && (
                <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 border border-primary/20">
                  Search: &quot;{debouncedSearch}&quot;
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      // updateQuery({ q: null });
                    }}
                    className="hover:text-destructive transition-colors text-lg leading-none"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors ml-2 underline underline-offset-4"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 mb-8 flex items-center justify-between">
              <div>
                <p className="text-destructive font-bold">Error loading courses</p>
                <p className="text-destructive/80 text-sm">{error.message}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-bold hover:bg-destructive/90 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Courses Display */}
          {isLoading && !isError && <CoursesGridSkeleton />}

          {courses.length === 0 || isError ? (
            <div className="text-center py-24 bg-card rounded-2xl border border-dashed border-border mt-4">
              <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                We couldn&apos;t find any courses matching your current search or filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <CourseGrid courses={courses} />

              {/* Infinite Scroll Trigger */}
              {hasNextPage && (
                <div ref={lastElementRef} className="h-40 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Loading more courses
                    </p>
                  </div>
                </div>
              )}

              {/* End of Results */}
              {!hasNextPage && courses.length > 0 && (
                <div className="text-center py-16 mt-8 border-t border-border/50">
                  <p className="font-bold text-lg mb-1">That&apos;s all for now!</p>
                  <p className="text-sm text-muted-foreground">
                    Showing all {totalResults} available courses
                  </p>
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
