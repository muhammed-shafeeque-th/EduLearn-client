import { BaseService, BaseServiceOptions, RequestOptions } from './base-service';
import { config } from '@/lib/config';
import { ApiResponse } from '@/types/api-response';
import { authRefreshToken, getClientAuthToken } from '@/lib/auth/auth-client-apis';
import {
  CheckUsernameRequest,
  CheckUsernameResponse,
  InstructorMeta,
  RegisterInstructorPayload,
  User,
  UserInfo,
  UserMeta,
  UserProfileUpdatePayload,
} from '@/types/user';
import { CourseAnalytics } from './course.service';

// Types & Helper for user/instructor stats and filtering
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
// export interface InstructorCoursesStats {
//   totalCourses: number;
//   totalStudents: number;
//   averageRating: number;
//   totalRevenue: number;
// }

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

function buildQueryParams(params: UsersParams = {}): URLSearchParams {
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

export interface IUserService {
  getCurrentUser(options?: RequestOptions): Promise<ApiResponse<User>>;
  updateUserProfile(
    data: Partial<UserProfileUpdatePayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<User>>;
  registerInstructor(
    credential: RegisterInstructorPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<User>>;
  getUsers(params?: UsersParams, options?: RequestOptions): Promise<ApiResponse<UserMeta[]>>;
  getStudentsOfInstructor(
    params?: UsersParams,
    options?: RequestOptions
  ): Promise<ApiResponse<UserInfo[]>>;
  getInstructorsOfStudent(
    params?: UsersParams,
    options?: RequestOptions
  ): Promise<ApiResponse<UserInfo[]>>;
  getInstructors(
    params?: UsersParams,
    options?: RequestOptions
  ): Promise<ApiResponse<InstructorMeta[]>>;
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

  getUser(userId: string, options?: RequestOptions): Promise<ApiResponse<User>>;
  checkUsername(
    params: CheckUsernameRequest,
    options?: RequestOptions
  ): Promise<ApiResponse<CheckUsernameResponse>>;

  getOnlineUsers(options?: RequestOptions): Promise<ApiResponse<string[]>>;
}

export class UserService extends BaseService implements IUserService {
  constructor({
    getToken = getClientAuthToken,
    authRefresh = authRefreshToken,
    ...options
  }: BaseServiceOptions = {}) {
    super(`${config.apiUrl}/users`, {
      ...options,
      getToken,
      authRefresh,
    });
  }

  public async getCurrentUser(options?: RequestOptions): Promise<ApiResponse<User>> {
    return this.get<ApiResponse<User>>('/me', options);
  }

  public getOnlineUsers(options?: RequestOptions): Promise<ApiResponse<string[]>> {
    return this.get<ApiResponse<string[]>>('/online', options);
  }

  public async updateUserProfile(
    data: Partial<UserProfileUpdatePayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<User>> {
    return this.patch<ApiResponse<User>>('/me', data, options);
  }

  public async checkUsername(
    params: CheckUsernameRequest,
    options: RequestOptions = {}
  ): Promise<ApiResponse<CheckUsernameResponse>> {
    return this.get<ApiResponse<CheckUsernameResponse>>('/username-check', { ...options, params });
  }

  public async registerInstructor(
    credential: RegisterInstructorPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<User>> {
    return this.post<ApiResponse<User>, RegisterInstructorPayload>(
      '/instructors/register',
      credential,
      options
    );
  }

  public async getUsers(
    params: UsersParams = {},
    options?: RequestOptions
  ): Promise<ApiResponse<UserMeta[]>> {
    const searchParams = buildQueryParams(params);
    const queryString = searchParams.toString();
    return this.get<ApiResponse<UserMeta[]>>(queryString ? `?${queryString}` : '', options);
  }

  public async getStudentsOfInstructor(
    params: UsersParams = {},
    options?: RequestOptions
  ): Promise<ApiResponse<UserInfo[]>> {
    const searchParams = buildQueryParams(params);
    const queryString = searchParams.toString();
    return this.get<ApiResponse<UserInfo[]>>(
      `/me/students${queryString ? `?${queryString}` : ''}`,
      options
    );
  }

  public async getInstructorsOfStudent(
    params: UsersParams = {},
    options?: RequestOptions
  ): Promise<ApiResponse<UserInfo[]>> {
    const searchParams = buildQueryParams(params);
    const queryString = searchParams.toString();
    return this.get<ApiResponse<UserInfo[]>>(
      `/me/instructors${queryString ? `?${queryString}` : ''}`,
      options
    );
  }

  public async getInstructors(
    params: UsersParams = {},
    options?: RequestOptions
  ): Promise<ApiResponse<InstructorMeta[]>> {
    const searchParams = buildQueryParams(params);
    const queryString = searchParams.toString();
    return this.get<ApiResponse<InstructorMeta[]>>(
      queryString ? `/instructors?${queryString}` : '/instructors',
      options
    );
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
    return this.get<ApiResponse<UsersStats>>(`/stats`, options);
  }

  public async getUser(userId: string, options?: RequestOptions): Promise<ApiResponse<User>> {
    return this.get<ApiResponse<User>>(`/${userId}`, options);
  }

  static create(serviceOptions: BaseServiceOptions): IUserService {
    return new UserService(serviceOptions);
  }
}

export const userService: IUserService = new UserService();
