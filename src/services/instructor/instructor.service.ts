import { BaseService, BaseServiceOptions, RequestOptions } from '../base-service';
import { config } from '@/lib/config';
import { ApiResponse } from '@/types/api-response';
import { authRefreshToken, getClientAuthToken } from '@/lib/auth/auth-client-apis';
import { InstructorMeta, RegisterInstructorPayload, User, UserInfo } from '@/types/user';
import {
  buildQueryParams,
  InstructorCoursesStats,
  InstructorStats,
  InstructorsStats,
  UsersParams,
} from './types/user.types';
import { IInstructorService } from './interfaces/instructor.service.interface';
import { CourseAnalytics } from '../course';

export class InstructorService extends BaseService implements IInstructorService {
  constructor({
    getToken = getClientAuthToken,
    authRefresh = authRefreshToken,
    ...options
  }: BaseServiceOptions = {}) {
    super(`${config.apiUrl}/instructors`, {
      ...options,
      getToken,
      authRefresh,
    });
  }

  public async registerInstructor(
    credential: RegisterInstructorPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<User>> {
    return this.post<ApiResponse<User>, RegisterInstructorPayload>(
      '/register',
      credential,
      options
    );
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
      queryString ? `/?${queryString}` : '/instructors',
      options
    );
  }

  public async getInstructorCoursesStats(
    instructorId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<InstructorCoursesStats>> {
    return this.get<ApiResponse<InstructorCoursesStats>>(`/${instructorId}/courses/stats`, options);
  }

  public async getInstructorCourseStats(
    instructorId: string,
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseAnalytics>> {
    return this.get<ApiResponse<CourseAnalytics>>(
      `/${instructorId}/courses/${courseId}/stats`,
      options
    );
  }

  public async getCourseAnalytics(
    instructorId: string,
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseAnalytics>> {
    return this.get<ApiResponse<CourseAnalytics>>(
      `/${instructorId}/courses/${courseId}/stats`,
      options
    );
  }

  public async getInstructorStats(
    instructorId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<InstructorStats>> {
    return this.get<ApiResponse<InstructorStats>>(`/${instructorId}/stats`, options);
  }

  public async getInstructorsStats(
    options?: RequestOptions
  ): Promise<ApiResponse<InstructorsStats>> {
    return this.get<ApiResponse<InstructorsStats>>(`/stats`, options);
  }

  static create(serviceOptions: BaseServiceOptions): IInstructorService {
    return new InstructorService(serviceOptions);
  }
}

export const instructorService: IInstructorService = new InstructorService();
