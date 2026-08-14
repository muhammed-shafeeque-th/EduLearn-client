'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  useCoursesInfinite,
  type CoursesInfiniteInitialPage,
} from '@/states/server/course/use-courses';
import type { CourseParams } from '@/services/course';

export function useInfiniteCoursesLoader(
  params: Partial<Omit<CourseParams, 'page'>>,
  options?: { initialPage?: CoursesInfiniteInitialPage }
) {
  const query = useCoursesInfinite(params, options);

  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node || query.isFetchingNextPage || !query.hasNextPage) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && query.hasNextPage && !query.isFetchingNextPage) {
            query.fetchNextPage();
          }
        },
        { rootMargin: '200px', threshold: 0.1 }
      );

      observerRef.current.observe(node);
    },
    [query]
  );

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  return {
    ...query,
    lastElementRef,
    courses: query.data?.pages.flatMap((page) => (page.success ? page.data : [])) ?? [],
  };
}
