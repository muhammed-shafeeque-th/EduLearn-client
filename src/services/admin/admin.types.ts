export interface LoginCredentials {
  email: string;
  password: string;
}
export interface SystemOverview {
  totalUsers: number;
  activeInstructors: number;
  totalCourses: number;
  monthlyRevenue: number;
}
export type RevenueStats = {
  month: number;
  revenue: number;
}[];

export type CategoriesStats = {
  category: string;
  count: number;
}[];

export type EnrollmentTrend = {
  month: number;
  enrollments: number;
}[];
export interface GrowthTrend {
  trend: {
    month: number;
    count: number;
  }[];
}

export interface PaginationParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
export interface UsersFilters {
  name?: string;
  email?: string;
  search?: string;
  role?: string;
}
export type UsersParams = UsersFilters & PaginationParams;

export function buildQueryParams(params: UsersParams | Partial<UsersParams> = {}): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (params.name) searchParams.set('name', params.name);
  if (params.email) searchParams.set('email', params.email);
  if (params.search) searchParams.set('search', params.search);
  if (params.role) searchParams.set('role', params.role);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder!);
  if (typeof params.page !== 'undefined') searchParams.set('page', params.page.toString());
  if (typeof params.pageSize !== 'undefined')
    searchParams.set('pageSize', params.pageSize.toString());
  return searchParams;
}
