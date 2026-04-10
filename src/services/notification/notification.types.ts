import { NotificationFilters } from '@/types/notification';

export function getFilterParams(params?: NotificationFilters): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (params?.isRead) {
    searchParams.set('isRead', String(params?.isRead));
  }
  if (params?.category) {
    searchParams.set('category', params?.category);
  }
  // if (params?.sortBy) {
  //   searchParams.set('sortBy', params.sortBy);
  // }
  // if (params?.sortOrder) {
  //   searchParams.set('sortOrder', params.sortOrder);
  // }
  searchParams.set('page', params?.page?.toString() || '1');
  searchParams.set('pageSize', params?.pageSize?.toString() || '10');
  return searchParams;
}
