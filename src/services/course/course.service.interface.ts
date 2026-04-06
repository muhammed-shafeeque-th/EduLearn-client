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
import { RequestOptions } from '../base-service';
import { CourseAnalytics, CourseParams, CoursesStats, PaginationParams } from './course.type';

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

  getModuleById(
    courseId: string,
    moduleId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Module>>;

  getModules(courseId: string, options?: RequestOptions): Promise<ApiResponse<Module[]>>;

  createModule(
    courseId: string,
    data: Partial<ModulePayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Module>>;

  updateModule(
    courseId: string,
    moduleId: string,
    data: Partial<ModulePayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Module>>;

  deleteModule(
    courseId: string,
    moduleId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<void>>;

  getLessons(
    courseId: string,
    moduleId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Lesson[]>>;

  getLessonById(
    courseId: string,
    moduleId: string,
    lessonId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Lesson>>;

  createLesson(
    courseId: string,
    moduleId: string,
    data: Partial<LessonPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Lesson>>;

  updateLesson(
    courseId: string,
    moduleId: string,
    lessonId: string,
    data: Partial<LessonPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Lesson>>;

  deleteLesson(
    courseId: string,
    moduleId: string,
    lessonId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<void>>;

  getQuizzes(
    courseId: string,
    moduleId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Quiz[]>>;

  getQuizById(
    courseId: string,
    moduleId: string,
    quizId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Quiz>>;

  createQuiz(
    courseId: string,
    moduleId: string,
    data: Partial<QuizPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Quiz>>;

  updateQuiz(
    courseId: string,
    moduleId: string,
    quizId: string,
    data: Partial<QuizPayload>,
    options?: RequestOptions
  ): Promise<ApiResponse<Quiz>>;

  deleteQuiz(
    courseId: string,
    moduleId: string,
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
