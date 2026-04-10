export interface PaginationParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface UsersStats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
}

export interface InstructorsStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  newThisMonth: number;
  totalCourses: number;
  newCourses: number;
  averageRating: number;
  ratingChange: number;
}

export interface InstructorCoursesStats {
  published: number;
  averageRating: number;
  totalHoursTaught: number;
  totalReviews: number;
  draft: number;
  totalEnrollments: number;
  enrollmentGrowth: number;
  activeStudents: number;
  monthlyRevenue: number;
  revenueGrowth: string;
  avgCompletionRate: number;
}

export interface InstructorStats {
  totalStudents: number;
  totalRevenue: number;
  activeCourses: number;
  rating: number;
  totalHours: number;
  completionRate: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  monthlyEnrollments: number;
  totalReviews: number;
  averageRating: number;
}

export interface UsersFilters {
  name?: string;
  email?: string;
  role?: string;
  search?: string;
  status?: string;
}

export type UsersParams = UsersFilters & PaginationParams;

export function buildQueryParams(params: UsersParams = {}): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  if (params.page !== undefined) searchParams.set('page', params.page.toString());
  if (params.pageSize !== undefined) searchParams.set('pageSize', params.pageSize.toString());
  if (params.name) searchParams.set('name', params.name);
  if (params.email) searchParams.set('email', params.email);
  if (params.role) searchParams.set('role', params.role);
  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  return searchParams;
}
