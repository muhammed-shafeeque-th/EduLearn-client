'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useCoursesInfinite } from '@/states/server/course/use-courses';
import type { CourseParams } from '@/services/course.service';

export function useInfiniteCoursesLoader(params: Partial<Omit<CourseParams, 'page'>>) {
  const query = useCoursesInfinite(params);

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
