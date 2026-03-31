export interface MessageFilters {
  userId?: string;
  status?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortMessage?: 'asc' | 'desc';
}

export function getMessagePaginationParams(params?: PaginationParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  // Note: PaginationParams contains only page, pageSize, sortMessage
  if (params?.sortMessage) {
    searchParams.set('sortOrder', params.sortMessage);
  }
  searchParams.set('page', params?.page?.toString() || '1');
  searchParams.set('pageSize', params?.pageSize?.toString() || '10');
  return searchParams;
}

export type MessagesParams = MessageFilters & PaginationParams;
