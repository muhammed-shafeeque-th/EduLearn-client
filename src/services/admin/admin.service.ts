import { BaseService, BaseServiceOptions, RequestOptions } from '../base-service';
import { config } from '@/lib/config';
import { ApiResponse } from '@/types/api-response';
import {
  CategoriesStats,
  EnrollmentTrend,
  GrowthTrend,
  LoginCredentials,
  PaginationParams,
  RevenueStats,
  SystemOverview,
  UsersParams,
  buildQueryParams,
} from './admin.types';
import { InstructorMeta, User, UserMeta, UserProfileUpdatePayload } from '@/types/user';
import { AuthResponse } from '@/types/auth';
import {
  getPaginationParams,
  InstructorCoursesStats,
  InstructorsStats,
  InstructorStats,
  UsersStats,
} from '../user';
import { CourseAnalytics } from '../course';
import { Course, CourseMeta } from '@/types/course';
import { authAdminRefresh, getAdminAuthToken } from '@/lib/auth/auth-client-apis';
import { IAdminService } from './admin.service.interface';
import { Category, CreateCategoryPayload, UpdateCategoryPayload } from '@/types/category';

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

  public async blockAccount(userId: string, options?: RequestOptions): Promise<ApiResponse<void>> {
    return this.patch<ApiResponse<void>>(`/admin/users/${userId}/block-account`, {}, options);
  }

  public async unblockAccount(
    userId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.patch<ApiResponse<void>>(`/admin/users/${userId}/unblock-account`, {}, options);
  }

  public async blockInstructor(
    instructorId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.patch<ApiResponse<void>>(`/admin/instructors/${instructorId}/block`, {}, options);
  }

  public async unblockInstructor(
    instructorId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.patch<ApiResponse<void>>(`/admin/instructors/${instructorId}/unblock`, {}, options);
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
    const url = `/admin/revenue-stats` + (year ? `?year=${year}` : '');
    return this.get<ApiResponse<RevenueStats>>(url, options);
  }
  public async getEnrollmentTrend(
    year?: string,
    options?: RequestOptions
  ): Promise<ApiResponse<EnrollmentTrend>> {
    const url = `/admin/enrollment-trend` + (year ? `?year=${year}` : '');
    return this.get<ApiResponse<EnrollmentTrend>>(url, options);
  }

  async getInstructorCoursesStats(
    instructorId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<InstructorCoursesStats>> {
    return this.get<ApiResponse<InstructorCoursesStats>>(
      `/instructors/${instructorId}/courses/stats`,
      options
    );
  }
  async getInstructorCourseStats(
    instructorId: string,
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseAnalytics>> {
    return this.get<ApiResponse<CourseAnalytics>>(
      `/instructors/${instructorId}/courses/${courseId}/stats`,
      options
    );
  }

  async getCourseAnalytics(
    instructorId: string,
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseAnalytics>> {
    return this.get<ApiResponse<CourseAnalytics>>(
      `/instructors/${instructorId}/courses/${courseId}/stats`,
      options
    );
  }

  public async getUserGrowthTrend(
    year?: string,
    options?: RequestOptions
  ): Promise<ApiResponse<GrowthTrend>> {
    const url = `/admin/user-growth-trend` + (year ? `?year=${year}` : '');
    return this.get<ApiResponse<GrowthTrend>>(url, options);
  }
  public async getInstructorGrowthTrend(
    year?: string,
    options?: RequestOptions
  ): Promise<ApiResponse<GrowthTrend>> {
    const url = `/admin/instructor-growth-trend` + (year ? `?year=${year}` : '');
    return this.get<ApiResponse<GrowthTrend>>(url, options);
  }

  public async getInstructorStats(
    instructorId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<InstructorStats>> {
    return this.get<ApiResponse<InstructorStats>>(`/instructors/${instructorId}/stats`, options);
  }

  public async getInstructorsStats(
    options?: RequestOptions
  ): Promise<ApiResponse<InstructorsStats>> {
    return this.get<ApiResponse<InstructorsStats>>(`/instructors/stats`, options);
  }
  public async getUsersStats(options?: RequestOptions): Promise<ApiResponse<UsersStats>> {
    return this.get<ApiResponse<UsersStats>>(`/users/stats`, options);
  }

  getCoursesByInstructor(
    instructorId: string,
    params?: PaginationParams,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseMeta[]>> {
    const pageParams = getPaginationParams(params);
    return this.get<ApiResponse<CourseMeta[]>>(`courses/instructor/${instructorId}`, {
      ...options,
      params: pageParams,
    });
  }

  // Category

  async createCategory(
    data: CreateCategoryPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<Category>> {
    return this.post<ApiResponse<Category>>('/courses/categories', data, options);
  }

  async updateCategory(
    id: string,
    data: UpdateCategoryPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<Category>> {
    return this.patch<ApiResponse<Category>>(`/courses/categories/${id}`, data, options);
  }

  async deleteCategory(id: string, options?: RequestOptions): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/courses/categories/${id}`, options);
  }
  async getCategoriesStats(options?: RequestOptions): Promise<ApiResponse<CategoriesStats>> {
    return this.get<ApiResponse<CategoriesStats>>(`/courses/categories/stats`, options);
  }

  async toggleCategoryStatus(id: string, options?: RequestOptions): Promise<ApiResponse<Category>> {
    return this.patch<ApiResponse<Category>>(
      `/courses/categories/${id}/toggle-status`,
      {},
      options
    );
  }

  static create(serviceOptions: BaseServiceOptions) {
    return new AdminService(serviceOptions);
  }
}

export const adminService: IAdminService = new AdminService();
