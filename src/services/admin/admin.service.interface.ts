import { RequestOptions } from '../base-service';
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
} from './admin.types';
import { InstructorMeta, User, UserMeta, UserProfileUpdatePayload } from '@/types/user';
import { AuthResponse } from '@/types/auth';
import { InstructorCoursesStats, InstructorsStats, InstructorStats, UsersStats } from '../user';
import { CourseAnalytics } from '../course';
import { Course, CourseMeta } from '@/types/course';
import { Category, CreateCategoryPayload, UpdateCategoryPayload } from '@/types/category';

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
  blockAccount(userId: string, options?: RequestOptions): Promise<ApiResponse<void>>;
  unblockAccount(userId: string, options?: RequestOptions): Promise<ApiResponse<void>>;
  blockInstructor(instructorId: string, options?: RequestOptions): Promise<ApiResponse<void>>;
  unblockInstructor(instructorId: string, options?: RequestOptions): Promise<ApiResponse<void>>;
  deleteUser(userId: string, options?: RequestOptions): Promise<ApiResponse<void>>;
  publishCourse(courseId: string, options?: RequestOptions): Promise<ApiResponse<Course>>;
  unPublishCourse(courseId: string, options?: RequestOptions): Promise<ApiResponse<Course>>;
  deleteCourse(courseId: string, options?: RequestOptions): Promise<ApiResponse<void>>;

  getSystemOverview(options?: RequestOptions): Promise<ApiResponse<SystemOverview>>;
  getRevenueStats(year?: string, options?: RequestOptions): Promise<ApiResponse<RevenueStats>>;
  getEnrollmentTrend(
    year?: string,
    options?: RequestOptions
  ): Promise<ApiResponse<EnrollmentTrend>>;
  getUserGrowthTrend(year?: string, options?: RequestOptions): Promise<ApiResponse<GrowthTrend>>;
  getInstructorGrowthTrend(
    year?: string,
    options?: RequestOptions
  ): Promise<ApiResponse<GrowthTrend>>;
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

  getCoursesByInstructor(
    instructorId: string,
    params?: PaginationParams,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseMeta[]>>;

  getCourseAnalytics(
    instructorId: string,
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseAnalytics>>;

  getInstructorsStats(options?: RequestOptions): Promise<ApiResponse<InstructorsStats>>;
  getUsersStats(options?: RequestOptions): Promise<ApiResponse<UsersStats>>;

  // Category
  createCategory(
    data: CreateCategoryPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<Category>>;
  updateCategory(
    id: string,
    data: UpdateCategoryPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<Category>>;
  deleteCategory(id: string, options?: RequestOptions): Promise<ApiResponse<void>>;
  getCategoriesStats(options?: RequestOptions): Promise<ApiResponse<CategoriesStats>>;
  toggleCategoryStatus(id: string, options?: RequestOptions): Promise<ApiResponse<Category>>;
}
