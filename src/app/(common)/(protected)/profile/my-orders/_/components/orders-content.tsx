'use client';

import { memo, useTransition, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OrderCard } from './orders-card';
import { OrdersFilter } from './orders-filter';
import { EmptyState } from './empty-state';
import { useOrders } from '../hooks';
import OrdersSkeleton from '../../loading';

const PAGE_SIZE = 12;

export const OrdersContent = memo(function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Read page and status from search params (client-side)
  const status = useMemo(() => {
    const param = searchParams?.get('status');
    return param || '';
  }, [searchParams]);

  // Fetch orders with infinite loading via TanStack Query
  const {
    orders,
    lastElementRef,
    isFetchingNextPage,
    hasNextPage,
    error,
    isError,
    isLoading,
    data,
  } = useOrders({
    sortOrder: 'desc',
    pageSize: PAGE_SIZE,
    status: status && status !== 'all' ? status : undefined,
  });

  // Get pagination metadata (handling array existence)
  const lastPage = data?.pages?.[data.pages.length - 1];
  const isOrderDataReady = lastPage && lastPage.success && lastPage.pagination;
  const totalResults =
    isOrderDataReady && lastPage.pagination?.total ? lastPage.pagination.total : 0;

  // Handle filter/status change (updates URL, triggers refetch)
  const handleFilterChange = (newStatus: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      if (newStatus && newStatus !== 'all') {
        params.set('status', newStatus);
      } else {
        params.delete('status');
      }
      params.delete('page');
      router.push(`/profile/my-orders${params.size > 0 ? `?${params}` : ''}`, { scroll: false });
    });
  };

  if (isLoading) {
    return <OrdersSkeleton />;
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center sm:px-6 lg:px-8">
        <div className="text-destructive font-semibold mb-2">Failed to load orders.</div>
        {error && typeof error === 'object' ? (
          <pre className="text-sm text-muted-foreground">{JSON.stringify(error, null, 2)}</pre>
        ) : null}
      </div>
    );
  }

  // Page UI (mobile-first with mobile-friendly paddings)
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">My Orders</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          View and manage your course purchases
        </p>
        {typeof totalResults === 'number' && totalResults > 0 && (
          <div className="text-xs sm:text-sm text-muted-foreground mt-2">
            Showing {orders.length} order{orders.length !== 1 ? 's' : ''} out of {totalResults}
          </div>
        )}
      </header>

      {/* Filters */}
      <div className="mb-4 sm:mb-6">
        <OrdersFilter
          currentStatus={status || 'all'}
          onFilterChange={handleFilterChange}
          isPending={isPending}
        />
      </div>

      {/* Main Content */}
      {/* Show empty state below filters if no orders */}
      {!isOrderDataReady || !orders.length ? (
        <EmptyState status={status} />
      ) : (
        <>
          {/* Orders List */}
          <div className="space-y-4" role="list" aria-label="Orders">
            {orders.map((order, idx) => {
              // Attach infinite scroll ref to LAST item
              if (
                idx === orders.length - 1 &&
                hasNextPage &&
                typeof lastElementRef === 'function'
              ) {
                return (
                  <div ref={lastElementRef} key={order.id}>
                    <OrderCard order={order} />
                  </div>
                );
              }
              return <OrderCard key={order.id} order={order} />;
            })}
          </div>

          {/* Loading more spinner for infinite scroll */}
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground/60 border-t-primary" />
              <span className="ml-3 text-muted-foreground">Loading more...</span>
            </div>
          )}

          {/* End-of-orders message (only on full list, not when filtered to empty) */}
          {!hasNextPage && orders.length > 0 && (
            <div className="flex justify-center mt-8 text-muted-foreground text-xs sm:text-sm">
              You&apos;ve reached the end of your orders.
            </div>
          )}
        </>
      )}
    </div>
  );
});
