import { config } from '@/lib/config';

import { BaseService, BaseServiceOptions, RequestOptions } from './base-service';

import { authAdminRefresh, getAdminAuthToken } from '@/lib/auth/auth-client-apis';

import { ApiResponse } from '@/types/api-response';
import { AuthResponse } from '@/types/auth';
import { User, UserProfileUpdatePayload, InstructorMeta, UserMeta } from '@/types/user';
import { Course } from '@/types/course';
import {
  InstructorCoursesStats,
  InstructorsStats,
  InstructorStats,
  UsersStats,
} from './user.service';
import { CourseAnalytics } from './course.service';

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
export interface RevenueStats {
  stats: {
    date: number;
    revenue: number;
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

function buildQueryParams(params: UsersParams | Partial<UsersParams> = {}): URLSearchParams {
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

export interface IAdminService {
  updateUser(
    userId: string,
    data: Partial<UserProfileUpdatePayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<User>>;
  logout(options?: RequestOptions): Promise<ApiResponse<void>>;

  login(
    credentials: LoginCredentials,
    options?: RequestOptions
  ): Promise<ApiResponse<AuthResponse>>;
  getUsers(
    params?: Partial<UsersParams>,
    options?: RequestOptions
  ): Promise<ApiResponse<UserMeta[]>>;
  getInstructors(
    params: PaginationParams,
    options?: RequestOptions
  ): Promise<ApiResponse<InstructorMeta[]>>;
  getUser(userId: string, options?: RequestOptions): Promise<ApiResponse<User>>;
  blockUser(userId: string, options?: RequestOptions): Promise<ApiResponse<void>>;
  unBlockUser(userId: string, options?: RequestOptions): Promise<ApiResponse<void>>;
  deleteUser(userId: string, options?: RequestOptions): Promise<ApiResponse<void>>;
  publishCourse(courseId: string, options?: RequestOptions): Promise<ApiResponse<Course>>;
  unPublishCourse(courseId: string, options?: RequestOptions): Promise<ApiResponse<Course>>;
  deleteCourse(courseId: string, options?: RequestOptions): Promise<ApiResponse<void>>;

  getSystemOverview(options?: RequestOptions): Promise<ApiResponse<SystemOverview>>;
  getRevenueStats(year?: string, options?: RequestOptions): Promise<ApiResponse<RevenueStats>>;
  getInstructorStats(
    instructorId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<InstructorStats>>;
  getInstructorCoursesStats(
    instructorId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<InstructorCoursesStats>>;
  getInstructorCourseStats(
    instructorId: string,
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseAnalytics>>;

  getCourseAnalytics(
    instructorId: string,
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseAnalytics>>;

  getInstructorsStats(options?: RequestOptions): Promise<ApiResponse<InstructorsStats>>;
  getUsersStats(options?: RequestOptions): Promise<ApiResponse<UsersStats>>;
}

export class AdminService extends BaseService implements IAdminService {
  constructor({
    getToken = getAdminAuthToken,
    authRefresh = authAdminRefresh,
    ...options
  }: BaseServiceOptions = {}) {
    super(`${config.apiUrl}`, {
      ...options,
      getToken,
      authRefresh,
    });
  }

  public async login(
    credentials: LoginCredentials,
    options?: RequestOptions
  ): Promise<ApiResponse<AuthResponse>> {
    return this.post<ApiResponse<AuthResponse>, LoginCredentials>(
      '/admin/auth/login',
      credentials,
      options
    );
  }

  public async logout(options?: RequestOptions): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>('/admin/auth/logout', undefined, options);
  }

  public async updateUser(
    userId: string,
    data: Partial<UserProfileUpdatePayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<User>> {
    return this.patch<ApiResponse<User>>(`/users/${userId}`, data, options);
  }

  public async getUsers(
    params: Partial<UsersParams> = {},
    options?: RequestOptions
  ): Promise<ApiResponse<UserMeta[]>> {
    const searchParams = buildQueryParams(params);
    const queryString = searchParams.toString();
    const endpoint = `/admin/users${queryString ? '?' + queryString : ''}`;
    return this.get<ApiResponse<UserMeta[]>>(endpoint, options);
  }

  public async getInstructors(
    params: PaginationParams,
    options?: RequestOptions
  ): Promise<ApiResponse<InstructorMeta[]>> {
    const searchParams = buildQueryParams(params);
    const endpoint = `/admin/instructors?${searchParams.toString()}`;
    return this.get<ApiResponse<InstructorMeta[]>>(endpoint, options);
  }

  public async getUser(userId: string, options?: RequestOptions): Promise<ApiResponse<User>> {
    return this.get<ApiResponse<User>>(`/users/${userId}`, options);
  }

  public async blockUser(userId: string, options?: RequestOptions): Promise<ApiResponse<void>> {
    return this.patch<ApiResponse<void>>(`/admin/users/${userId}/block`, {}, options);
  }

  public async unBlockUser(userId: string, options?: RequestOptions): Promise<ApiResponse<void>> {
    return this.patch<ApiResponse<void>>(`/admin/users/${userId}/unblock`, {}, options);
  }

  public async deleteUser(userId: string, options?: RequestOptions): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/admin/users/${userId}`, options);
  }

  public async publishCourse(
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Course>> {
    return this.patch<ApiResponse<Course>>(`/courses/${courseId}/publish`, {}, options);
  }

  public async unPublishCourse(
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Course>> {
    return this.patch<ApiResponse<Course>>(`/courses/${courseId}/unpublish`, {}, options);
  }

  public async deleteCourse(
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/courses/${courseId}`, options);
  }

  public async getSystemOverview(options?: RequestOptions): Promise<ApiResponse<SystemOverview>> {
    return this.get<ApiResponse<SystemOverview>>(`/admin/system-overview`, options);
  }

  public async getRevenueStats(
    year?: string,
    options?: RequestOptions
  ): Promise<ApiResponse<RevenueStats>> {
    const url = `/admin/revenue-stats` + year ? `?year=${year}` : '';
    return this.get<ApiResponse<RevenueStats>>(url, options);
  }

  async getInstructorCoursesStats(
    instructorId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<InstructorCoursesStats>> {
    return this.get<ApiResponse<InstructorCoursesStats>>(
      `/users/instructors/${instructorId}/courses/stats`,
      options
    );
  }
  async getInstructorCourseStats(
    instructorId: string,
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseAnalytics>> {
    return this.get<ApiResponse<CourseAnalytics>>(
      `/users/instructors/${instructorId}/courses/${courseId}/stats`,
      options
    );
  }

  async getCourseAnalytics(
    instructorId: string,
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseAnalytics>> {
    return this.get<ApiResponse<CourseAnalytics>>(
      `/users/instructors/${instructorId}/courses/${courseId}/stats`,
      options
    );
  }

  public async getInstructorStats(
    instructorId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<InstructorStats>> {
    return this.get<ApiResponse<InstructorStats>>(
      `/users/instructors/${instructorId}/stats`,
      options
    );
  }

  public async getInstructorsStats(
    options?: RequestOptions
  ): Promise<ApiResponse<InstructorsStats>> {
    return this.get<ApiResponse<InstructorsStats>>(`/users/instructors/stats`, options);
  }
  public async getUsersStats(options?: RequestOptions): Promise<ApiResponse<UsersStats>> {
    return this.get<ApiResponse<UsersStats>>(`/users/stats`, options);
  }

  static create(serviceOptions: BaseServiceOptions) {
    return new AdminService(serviceOptions);
  }
}

export const adminService: IAdminService = new AdminService();
