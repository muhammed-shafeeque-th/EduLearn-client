export interface WalletParams {
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export function getPaginationParams(
  params?: WalletParams | Partial<WalletParams>
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  searchParams.set('page', params?.page?.toString() || '1');
  searchParams.set('pageSize', params?.pageSize?.toString() || '10');

  return searchParams;
}
