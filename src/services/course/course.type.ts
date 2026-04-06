export interface CourseFilters {
  search?: string;
  category?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
}

export interface CourseAnalytics {
  totalStudents: number;
  completionRate: number;
  averageProgress: number;
  averageRating: number;
  totalRevenue: number;
  monthlyRevenue: number;
  engagementRate: number;
  revenueThisMonth: number;
  revenueGrowth: number;
  totalReviews: number;
  certificatesIssued: number;
  ratingsBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  enrollmentTrend: {
    month: number;
    enrollments: number;
  }[];
}
export interface CoursesStats {
  totalCourses: number;
  totalStudents: number;
  averageRating: number;
  totalRevenue: number;
}

export type CourseSortBy = 'title' | 'price' | 'rating' | 'created_at';

export interface PaginationParams {
  sortBy?: CourseSortBy;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export type CourseParams = CourseFilters & PaginationParams;

export function getPaginationParams(
  params?: PaginationParams | Partial<PaginationParams>
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  searchParams.set('page', params?.page?.toString() || '1');
  searchParams.set('pageSize', params?.pageSize?.toString() || '10');

  return searchParams;
}
