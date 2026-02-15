import { BaseService, BaseServiceOptions, RequestOptions } from './base-service';
import { config } from '@/lib/config';
import { authRefreshToken, getClientAuthToken } from '@/lib/auth/auth-client-apis';

import { ApiResponse } from '@/types/api-response';
import { Review } from '@/types/review';

import {
  Course,
  Section,
  SectionPayload,
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

export interface CourseFilters {
  search?: string;
  category?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
}

export interface CourseAnalytics {
  courseId: string;
  totalStudents: number;
  completionRate: number;
  averageProgress: number;
  monthlyRevenue: number;
  engagementRate: number;
  revenueThisMonth: number;
  revenueTotal: number;
  ratingsBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  enrollmentTrend: {
    date: string;
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

function getPaginationParams(
  params?: PaginationParams | Partial<PaginationParams>
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  searchParams.set('page', params?.page?.toString() || '1');
  searchParams.set('pageSize', params?.pageSize?.toString() || '10');

  return searchParams;
}

export interface ICourseService {
  getCourses(
    filters?: Partial<CourseParams>,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseMeta[]>>;

  getCourseAnalytics(
    courseId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseAnalytics>>;

  getCoursesStats(options?: RequestOptions): Promise<ApiResponse<CoursesStats>>;

  getCourseById(courseId: string, options?: RequestOptions): Promise<ApiResponse<Course>>;

  getCourseBySlug(slug: string, options?: RequestOptions): Promise<ApiResponse<Course>>;

  createCourse(
    data: Partial<BasicInfoRequestPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Course>>;

  updateCourse(
    courseId: string,
    data: Partial<CoursePayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Course>>;

  publishCourse(courseId: string, options?: RequestOptions): Promise<ApiResponse<Course>>;
  unPublishCourse(courseId: string, options?: RequestOptions): Promise<ApiResponse<Course>>;

  deleteCourse(courseId: string, options?: RequestOptions): Promise<ApiResponse<void>>;

  getRelatedCourses(
    courseId: string,
    params?: PaginationParams,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseMeta[]>>;

  getSectionById(
    courseId: string,
    sectionId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Section>>;

  getSections(courseId: string, options?: RequestOptions): Promise<ApiResponse<Section[]>>;

  createSection(
    courseId: string,
    data: Partial<SectionPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Section>>;

  updateSection(
    courseId: string,
    sectionId: string,
    data: Partial<SectionPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Section>>;

  deleteSection(
    courseId: string,
    sectionId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<void>>;

  getLessons(
    courseId: string,
    sectionId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Lesson[]>>;

  getLessonById(
    courseId: string,
    sectionId: string,
    lessonId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Lesson>>;

  createLesson(
    courseId: string,
    sectionId: string,
    data: Partial<LessonPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Lesson>>;

  updateLesson(
    courseId: string,
    sectionId: string,
    lessonId: string,
    data: Partial<LessonPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Lesson>>;

  deleteLesson(
    courseId: string,
    sectionId: string,
    lessonId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<void>>;

  getQuizzes(
    courseId: string,
    sectionId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Quiz[]>>;

  getQuizById(
    courseId: string,
    sectionId: string,
    quizId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Quiz>>;

  createQuiz(
    courseId: string,
    sectionId: string,
    data: Partial<QuizPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Quiz>>;

  updateQuiz(
    courseId: string,
    sectionId: string,
    quizId: string,
    data: Partial<QuizPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Quiz>>;

  deleteQuiz(
    courseId: string,
    sectionId: string,
    quizId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<void>>;

  getCourseReviews(
    courseId: string,
    params?: PaginationParams,
    options?: RequestOptions
  ): Promise<ApiResponse<Review[]>>;

  getCoursesByInstructor(
    instructorId: string,
    params?: PaginationParams,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseMeta[]>>;

  enrollInCourse(courseId: string, options?: RequestOptions): Promise<ApiResponse<Course>>;

  getFeaturedCourses(
    params?: PaginationParams,
    options?: RequestOptions
  ): Promise<ApiResponse<CourseMeta[]>>;

  checkCourseTitle(
    params: CheckCourseTitleRequest,
    options?: RequestOptions
  ): Promise<ApiResponse<CheckCourseTitleResponse>>;

  duplicateCourse(
    sourceCourseId: string,
    data?: Partial<BasicInfoRequestPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Course>>;

  archiveCourse(courseId: string, options?: RequestOptions): Promise<ApiResponse<Course>>;
}

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

  getSectionById(
    courseId: string,
    sectionId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Section>> {
    return this.get<ApiResponse<Section>>(`/${courseId}/sections/${sectionId}`, options);
  }

  getSections(courseId: string, options?: RequestOptions): Promise<ApiResponse<Section[]>> {
    return this.get<ApiResponse<Section[]>>(`/${courseId}/sections`, options);
  }

  createSection(
    courseId: string,
    data: Partial<SectionPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Section>> {
    return this.post<ApiResponse<Section>>(`/${courseId}/sections`, data, options);
  }

  updateSection(
    courseId: string,
    sectionId: string,
    data: Partial<SectionPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Section>> {
    return this.patch<ApiResponse<Section>>(`/${courseId}/sections/${sectionId}`, data, options);
  }

  deleteSection(
    courseId: string,
    sectionId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/${courseId}/sections/${sectionId}`, options);
  }

  getLessons(
    courseId: string,
    sectionId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Lesson[]>> {
    return this.get<ApiResponse<Lesson[]>>(`/${courseId}/sections/${sectionId}/lessons`, options);
  }

  getLessonById(
    courseId: string,
    sectionId: string,
    lessonId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Lesson>> {
    return this.get<ApiResponse<Lesson>>(
      `/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
      options
    );
  }

  createLesson(
    courseId: string,
    sectionId: string,
    data: Partial<LessonPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Lesson>> {
    return this.post<ApiResponse<Lesson>>(
      `/${courseId}/sections/${sectionId}/lessons`,
      data,
      options
    );
  }

  updateLesson(
    courseId: string,
    sectionId: string,
    lessonId: string,
    data: Partial<LessonPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Lesson>> {
    return this.patch<ApiResponse<Lesson>>(
      `/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
      data,
      options
    );
  }

  deleteLesson(
    courseId: string,
    sectionId: string,
    lessonId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(
      `/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
      options
    );
  }

  getQuizzes(
    courseId: string,
    sectionId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Quiz[]>> {
    return this.get<ApiResponse<Quiz[]>>(`/${courseId}/sections/${sectionId}/quizzes`, options);
  }

  getQuizById(
    courseId: string,
    sectionId: string,
    quizId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Quiz>> {
    return this.get<ApiResponse<Quiz>>(
      `/${courseId}/sections/${sectionId}/quizzes/${quizId}`,
      options
    );
  }

  createQuiz(
    courseId: string,
    sectionId: string,
    data: Partial<QuizPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Quiz>> {
    return this.post<ApiResponse<Quiz>>(
      `/${courseId}/sections/${sectionId}/quizzes`,
      data,
      options
    );
  }

  updateQuiz(
    courseId: string,
    sectionId: string,
    quizId: string,
    data: Partial<QuizPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Quiz>> {
    return this.patch<ApiResponse<Quiz>>(
      `/${courseId}/sections/${sectionId}/quizzes/${quizId}`,
      data,
      options
    );
  }

  deleteQuiz(
    courseId: string,
    sectionId: string,
    quizId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(
      `/${courseId}/sections/${sectionId}/quizzes/${quizId}`,
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
