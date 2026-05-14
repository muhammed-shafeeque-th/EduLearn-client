export interface OrderFilters {
  userId?: string;
  status?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortOrder?: 'asc' | 'desc';
}

export function getOrderPaginationParams(params?: PaginationParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params?.sortOrder) {
    searchParams.set('sortOrder', params.sortOrder);
  }
  searchParams.set('page', params?.page?.toString() || '1');
  searchParams.set('pageSize', params?.pageSize?.toString() || '10');
  return searchParams;
}

export type OrderParams = OrderFilters & PaginationParams;
