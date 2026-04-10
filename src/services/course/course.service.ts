import { ApiResponse } from '@/types/api-response';
import { Review } from '@/types/review';

import {
  Course,
  Module,
  ModulePayload,
  Lesson,
  LessonPayload,
  Quiz,
  QuizPayload,
  CourseMeta,
} from '@/types/course';

import {
  BasicInfoRequestPayload,
  CheckCourseTitleRequest,
  CheckCourseTitleResponse,
  CoursePayload,
} from '@/types/course/course-payload.type';
import { BaseService, BaseServiceOptions, RequestOptions } from '../base-service';
import {
  CourseAnalytics,
  CourseParams,
  CoursesStats,
  getPaginationParams,
  PaginationParams,
} from './course.type';
import { authRefreshToken, getClientAuthToken } from '@/lib/auth/auth-client-apis';
import { config } from '@/lib/config';
import { ICourseService } from './course.service.interface';

export class CourseService extends BaseService implements ICourseService {
  constructor({
    getToken = getClientAuthToken,
    authRefresh = authRefreshToken,
    ...options
  }: BaseServiceOptions = {}) {
    super(`${config.apiUrl}/courses`, {
      ...options,
      getToken,
      authRefresh,
    });
  }

  async getCourses(
    filters?: Partial<CourseParams>,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseMeta[]>> {
    const queryParams = getPaginationParams(filters);
    if (filters?.search) queryParams.append('search', filters.search.toString());
    if (filters?.category) queryParams.append('category', filters.category.toString());
    if (filters?.level) queryParams.append('level', filters.level.toString());
    if (filters?.minPrice !== undefined && filters.minPrice > 0)
      queryParams.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined && filters.maxPrice > 0)
      queryParams.append('maxPrice', filters.maxPrice.toString());
    if (filters?.rating !== undefined && filters.rating > 0)
      queryParams.append('rating', filters.rating.toString());
    const queryString = queryParams.toString();
    return this.get<ApiResponse<CourseMeta[]>>(queryString ? `?${queryString}` : '', options);
  }

  async getCourseAnalytics(
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseAnalytics>> {
    return this.get<ApiResponse<CourseAnalytics>>(`/${courseId}/analytics`, options);
  }

  async getCoursesStats(options?: RequestOptions): Promise<ApiResponse<CoursesStats>> {
    return this.get<ApiResponse<CoursesStats>>(`/stats`, options);
  }

  async getCourseById(courseId: string, options?: RequestOptions): Promise<ApiResponse<Course>> {
    return this.get<ApiResponse<Course>>(`/${courseId}`, options);
  }

  getCourseBySlug(slug: string, options?: RequestOptions): Promise<ApiResponse<Course>> {
    return this.get<ApiResponse<Course>>(`/slug/${slug}`, options);
  }

  createCourse(
    data: Partial<BasicInfoRequestPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Course>> {
    return this.post<ApiResponse<Course>>('/', data, options);
  }

  updateCourse(
    courseId: string,
    data: Partial<CoursePayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Course>> {
    return this.patch<ApiResponse<Course>>(`/${courseId}`, data, options);
  }

  publishCourse(courseId: string, options?: RequestOptions): Promise<ApiResponse<Course>> {
    return this.patch<ApiResponse<Course>>(`/${courseId}/publish`, {}, options);
  }

  unPublishCourse(courseId: string, options?: RequestOptions): Promise<ApiResponse<Course>> {
    return this.patch<ApiResponse<Course>>(`/${courseId}/unpublish`, {}, options);
  }

  async deleteCourse(courseId: string, options?: RequestOptions): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/${courseId}`, options);
  }

  async duplicateCourse(
    sourceCourseId: string,
    data: Partial<BasicInfoRequestPayload> = {},
    options?: RequestOptions
  ): Promise<ApiResponse<Course>> {
    return this.post<ApiResponse<Course>>(`/${sourceCourseId}/duplicate`, data, options);
  }

  async archiveCourse(courseId: string, options?: RequestOptions): Promise<ApiResponse<Course>> {
    return this.patch<ApiResponse<Course>>(`/${courseId}/archive`, {}, options);
  }

  async getRelatedCourses(
    courseId: string,
    params?: PaginationParams,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseMeta[]>> {
    const param = getPaginationParams(params || {});
    return this.get<ApiResponse<CourseMeta[]>>(`/${courseId}/related`, {
      ...options,
      params: param,
    });
  }

  getModuleById(
    courseId: string,
    moduleId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Module>> {
    return this.get<ApiResponse<Module>>(`/${courseId}/modules/${moduleId}`, options);
  }

  getModules(courseId: string, options?: RequestOptions): Promise<ApiResponse<Module[]>> {
    return this.get<ApiResponse<Module[]>>(`/${courseId}/modules`, options);
  }

  createModule(
    courseId: string,
    data: Partial<ModulePayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Module>> {
    return this.post<ApiResponse<Module>>(`/${courseId}/modules`, data, options);
  }

  updateModule(
    courseId: string,
    moduleId: string,
    data: Partial<ModulePayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Module>> {
    return this.patch<ApiResponse<Module>>(`/${courseId}/modules/${moduleId}`, data, options);
  }

  deleteModule(
    courseId: string,
    moduleId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/${courseId}/modules/${moduleId}`, options);
  }

  getLessons(
    courseId: string,
    moduleId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Lesson[]>> {
    return this.get<ApiResponse<Lesson[]>>(`/${courseId}/modules/${moduleId}/lessons`, options);
  }

  getLessonById(
    courseId: string,
    moduleId: string,
    lessonId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Lesson>> {
    return this.get<ApiResponse<Lesson>>(
      `/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
      options
    );
  }

  createLesson(
    courseId: string,
    moduleId: string,
    data: Partial<LessonPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Lesson>> {
    return this.post<ApiResponse<Lesson>>(
      `/${courseId}/modules/${moduleId}/lessons`,
      data,
      options
    );
  }

  updateLesson(
    courseId: string,
    moduleId: string,
    lessonId: string,
    data: Partial<LessonPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Lesson>> {
    return this.patch<ApiResponse<Lesson>>(
      `/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
      data,
      options
    );
  }

  deleteLesson(
    courseId: string,
    moduleId: string,
    lessonId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(
      `/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
      options
    );
  }

  getQuizzes(
    courseId: string,
    moduleId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Quiz[]>> {
    return this.get<ApiResponse<Quiz[]>>(`/${courseId}/modules/${moduleId}/quizzes`, options);
  }

  getQuizById(
    courseId: string,
    moduleId: string,
    quizId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Quiz>> {
    return this.get<ApiResponse<Quiz>>(
      `/${courseId}/modules/${moduleId}/quizzes/${quizId}`,
      options
    );
  }

  createQuiz(
    courseId: string,
    moduleId: string,
    data: Partial<QuizPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Quiz>> {
    return this.post<ApiResponse<Quiz>>(`/${courseId}/modules/${moduleId}/quizzes`, data, options);
  }

  updateQuiz(
    courseId: string,
    moduleId: string,
    quizId: string,
    data: Partial<QuizPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Quiz>> {
    return this.patch<ApiResponse<Quiz>>(
      `/${courseId}/modules/${moduleId}/quizzes/${quizId}`,
      data,
      options
    );
  }

  deleteQuiz(
    courseId: string,
    moduleId: string,
    quizId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(
      `/${courseId}/modules/${moduleId}/quizzes/${quizId}`,
      options
    );
  }

  async getCourseReviews(
    courseId: string,
    params?: PaginationParams,
    options?: RequestOptions
  ): Promise<ApiResponse<Review[]>> {
    const queryParams = getPaginationParams(params);
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/${courseId}/reviews?${queryString}` : `/${courseId}/reviews`;
    return this.get<ApiResponse<Review[]>>(endpoint, options);
  }

  getCoursesByInstructor(
    instructorId: string,
    params?: PaginationParams,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseMeta[]>> {
    const pageParams = getPaginationParams(params);
    return this.get<ApiResponse<CourseMeta[]>>(`/instructor/${instructorId}`, {
      ...options,
      params: pageParams,
    });
  }

  enrollInCourse(courseId: string, options?: RequestOptions): Promise<ApiResponse<Course>> {
    return this.post<ApiResponse<Course>>(`/${courseId}/enroll`, undefined, options);
  }

  getFeaturedCourses(
    params?: PaginationParams,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseMeta[]>> {
    const pageParams = getPaginationParams(params);
    return this.get<ApiResponse<CourseMeta[]>>(`/featured`, { ...options, params: pageParams });
  }

  checkCourseTitle(
    params: CheckCourseTitleRequest,
    options: RequestOptions = {}
  ): Promise<ApiResponse<CheckCourseTitleResponse>> {
    return this.get<ApiResponse<CheckCourseTitleResponse>>('/title-check', { ...options, params });
  }

  static create(serviceOptions: BaseServiceOptions) {
    return new CourseService(serviceOptions);
  }
}

export const courseService: ICourseService = new CourseService();
