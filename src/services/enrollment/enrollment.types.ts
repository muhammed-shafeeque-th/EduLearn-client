// --- Types and Utilities ---
export interface SubmitQuizPayload {
  score: number;
}
export interface EnrollmentFilters {
  userId: string;
}

export type CourseSortBy = 'title' | 'price' | 'rating' | 'created_at';

export interface PaginationParams {
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export type EnrollmentParams = EnrollmentFilters & PaginationParams;

export function buildEnrollmentSearchParams(
  params: Partial<EnrollmentParams> = {}
): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  if (params?.userId) searchParams.set('userId', params.userId);
  searchParams.set('page', params?.page?.toString() || '1');
  searchParams.set('pageSize', params?.pageSize?.toString() || '10');
  return searchParams;
}
