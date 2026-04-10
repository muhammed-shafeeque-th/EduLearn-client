import { RequestOptions } from '../../base-service';
import { ApiResponse } from '@/types/api-response';
import { InstructorMeta, RegisterInstructorPayload, User, UserInfo } from '@/types/user';
import { CourseAnalytics } from '../../course';
import {
  InstructorCoursesStats,
  InstructorStats,
  InstructorsStats,
  UsersParams,
} from '../types/user.types';

export interface IInstructorService {
  registerInstructor(
    credential: RegisterInstructorPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<User>>;
  getStudentsOfInstructor(
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
}
