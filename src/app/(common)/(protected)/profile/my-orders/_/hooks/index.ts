'use client';

import { useOrdersInfinite } from '@/states/server/orders/use-orders';
import { OrderParams } from '@/services/order.service';
import { useCallback, useEffect, useRef } from 'react';

export function useOrders(params: Partial<Omit<OrderParams, 'page'>>) {
  const query = useOrdersInfinite(params);

  // Intersection observer ref
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load more when the last item becomes visible
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

  // Clean up observer on unmount
  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  return {
    ...query,
    lastElementRef,
    orders: query.data?.pages.flatMap((page) => (page.success ? page.data : [])) ?? [],
  };
}
