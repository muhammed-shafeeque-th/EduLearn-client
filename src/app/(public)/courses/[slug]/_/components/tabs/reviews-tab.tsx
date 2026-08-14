'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Star, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Course } from '@/types/course';
import { cn, getErrorMessage } from '@/lib/utils';
import { useCourseReviewInfinite } from '@/states/server/review/use-review';
import { formatRelative } from 'date-fns';

interface CourseReviewsProps {
  course: Course;
}

type SortBy = 'newest' | 'oldest';

const REVIEWS_PER_PAGE = 5;

// Fallback avatar image URL
const DEFAULT_AVATAR = '/images/default-avatar.png';

function getAvatarSrc(avatar?: string): string {
  return typeof avatar === 'string' && avatar.trim() !== '' ? avatar : DEFAULT_AVATAR;
}

function getFormattedDate(isoDate: string): string {
  try {
    return formatRelative(new Date(isoDate), new Date());
  } catch {
    return '';
  }
}

export function CourseReviews({ course }: CourseReviewsProps) {
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);
  const listRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, isError, error } =
    useCourseReviewInfinite(course.id);

  // Flatten and memoize reviews
  const reviews = useMemo(() => data?.pages?.flatMap((page) => page.data ?? []) ?? [], [data]);

  // Memoize rating distribution
  const ratingDistribution = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const star = 5 - i;
      const count = reviews.filter((review) => Math.floor(review.rating) === star).length;
      const percentage = (course.totalRatings ?? 0) > 0 ? (count / course.totalRatings) * 100 : 0;
      return { star, count, percentage };
    });
  }, [reviews, course.totalRatings]);

  // Memoize sorted reviews (only "newest" and "oldest/")
  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      if (sortBy === 'oldest') {
        return aDate - bDate;
      }
      return bDate - aDate; // newest
    });
  }, [reviews, sortBy]);

  const displayedReviews = sortedReviews.slice(0, visibleCount);

  // Handle load more with scroll
  const handleLoadMore = useCallback(() => {
    if (hasNextPage) {
      // If there are more pages on backend, fetch next page
      fetchNextPage().then(() => {
        setVisibleCount((prev) => prev + REVIEWS_PER_PAGE);
        setTimeout(() => {
          // Scroll to the bottom of review list after loading
          if (listRef.current) {
            listRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }
        }, 100);
      });
    } else {
      // If all backend pages loaded, just increase local slice count
      setVisibleCount((prev) => prev + REVIEWS_PER_PAGE);
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 100);
    }
  }, [fetchNextPage, hasNextPage]);

  // Reset visibleCount when sort changes
  useEffect(() => {
    setVisibleCount(REVIEWS_PER_PAGE);
  }, [sortBy]);

  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Learner Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{course.rating?.toFixed(1) ?? '0.0'}</div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-5 h-5',
                      i < Math.floor(course.rating ?? 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {(course.totalRatings ?? 0).toLocaleString()} reviews
              </p>
            </div>
            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm">{star}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Reviews List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reviews ({reviews.length})</CardTitle>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="text-sm border rounded px-3 py-1 bg-background"
              aria-label="Sort reviews"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="py-10 text-center text-gray-500 dark:text-gray-400">
              Loading reviews...
            </div>
          )}
          {isError && (
            <div className="py-10 text-center text-red-600 dark:text-red-400">
              {getErrorMessage(error, 'Failed to load reviews.')}
            </div>
          )}
          <div className="space-y-6" ref={listRef}>
            {displayedReviews.length === 0 && !isLoading && (
              <div className="py-6 text-center text-gray-500 dark:text-gray-400">
                No reviews yet.
              </div>
            )}
            {displayedReviews.map((review) => (
              <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                <div className="flex items-start gap-4">
                  <Image
                    src={getAvatarSrc(review.user?.avatar)}
                    alt={review.user?.name || 'User avatar'}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{review.user?.name ?? 'Anonymous'}</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  'w-4 h-4',
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Reviewed on {getFormattedDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" aria-label="More options">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-muted-foreground mb-3 leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {(displayedReviews.length < sortedReviews.length || hasNextPage) && (
            <div className="text-center mt-6">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isFetchingNextPage}
                aria-label="Load more reviews"
              >
                {isFetchingNextPage ? 'Loading more...' : 'Load more reviews'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
