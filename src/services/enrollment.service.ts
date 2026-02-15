import { BaseService, BaseServiceOptions, RequestOptions } from './base-service';
import { config } from '@/lib/config';
import { ApiResponse } from '@/types/api-response';
import { authRefreshToken, getClientAuthToken } from '@/lib/auth/auth-client-apis';
import { Enrollment } from '@/types/enrollment';
import {
  EnrollmentDetail,
  EnrollmentProgressResponse,
  SignedVideoUrlResponse,
  SubmitCourseReviewPayload,
  SubmitQuizAttemptPayload,
  SubmitQuizAttemptResponse,
  UpdateLessonProgressPayload,
  UpdateLessonProgressResponse,
} from '@/types/enrollment/enrollment.type';
import { Review } from '@/types/review';
import {
  CertificateData,
  GenerateCertificateResponse,
  VerifyCertificateResponse,
} from '@/types/enrollment/enrollment-certificate.type';

// --- Types and Utilities ---
export interface SubmitQuizPayload {
  score: number;
}
export interface EnrollmentFilters {
  userId: string;
}

export type CourseSortBy = 'title' | 'price' | 'rating' | 'created_at';

export interface PaginationParams {
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export type EnrollmentParams = EnrollmentFilters & PaginationParams;

function buildEnrollmentSearchParams(params: Partial<EnrollmentParams> = {}): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  if (params?.userId) searchParams.set('userId', params.userId);
  searchParams.set('page', params?.page?.toString() || '1');
  searchParams.set('pageSize', params?.pageSize?.toString() || '10');
  return searchParams;
}

// --- Interface for EnrollmentService ---
export interface IEnrollmentService {
  // Enrollments
  getEnrollments(
    filters?: Partial<EnrollmentParams>,
    options?: RequestOptions
  ): Promise<ApiResponse<Enrollment[]>>;
  getUserEnrollments(
    userId: string,
    filters?: Partial<EnrollmentParams>,
    options?: RequestOptions
  ): Promise<ApiResponse<Enrollment[]>>;
  getEnrollment(
    enrollmentId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<EnrollmentDetail>>;

  // Certificates
  getCertificate(
    enrollmentId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<CertificateData>>;
  downloadCertificate(certificateId: string): string;
  getShareUrl(certificateId: string): string;
  verifyCertificate(
    certificateNumber: string,
    options?: RequestOptions
  ): Promise<ApiResponse<VerifyCertificateResponse>>;
  generateCertificate(
    enrollmentId: string,
    studentName: string,
    options?: RequestOptions
  ): Promise<ApiResponse<GenerateCertificateResponse>>;

  // Video URLs
  getSignedVideoUrl(
    enrollmentId: string,
    lessonId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<SignedVideoUrlResponse>>;
  refreshVideoUrl(
    enrollmentId: string,
    lessonId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<SignedVideoUrlResponse>>;

  // Progress
  getEnrollmentProgress(
    enrollmentId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<EnrollmentProgressResponse>>;
  updateLessonProgress(
    enrollmentId: string,
    lessonId: string,
    payload: UpdateLessonProgressPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<UpdateLessonProgressResponse>>;

  // Quiz
  submitQuizAttempt(
    enrollmentId: string,
    quizId: string,
    payload: SubmitQuizAttemptPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<SubmitQuizAttemptResponse>>;

  // Reviews
  submitCourseReview(
    enrollmentId: string,
    payload: SubmitCourseReviewPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<Review>>;
  updateCourseReview(
    enrollmentId: string,
    reviewId: string,
    payload: SubmitCourseReviewPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<Review>>;
  deleteCourseReview(
    enrollmentId: string,
    reviewId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Review>>;
  getCourseReviewByEnrollment(
    enrollmentId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Review>>;
}

// --- EnrollmentService Implementation ---
export class EnrollmentService extends BaseService implements IEnrollmentService {
  constructor({
    getToken = getClientAuthToken,
    authRefresh = authRefreshToken,
    ...options
  }: BaseServiceOptions = {}) {
    super(`${config.apiUrl}/enrollments`, {
      ...options,
      getToken,
      authRefresh,
    });
  }

  // Enrollments
  getEnrollments(
    filters?: Partial<EnrollmentParams>,
    options?: RequestOptions
  ): Promise<ApiResponse<Enrollment[]>> {
    const queryParams = buildEnrollmentSearchParams(filters);
    const queryString = queryParams.toString();
    return this.get<ApiResponse<Enrollment[]>>(queryString ? `?${queryString}` : '', options);
  }

  getUserEnrollments(
    userId: string,
    filters?: Partial<EnrollmentParams>,
    options?: RequestOptions
  ): Promise<ApiResponse<Enrollment[]>> {
    const queryParams = buildEnrollmentSearchParams({ ...filters, userId });
    const queryString = queryParams.toString();
    return this.get<ApiResponse<Enrollment[]>>(queryString ? `?${queryString}` : '', options);
  }

  getEnrollment(
    enrollmentId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<EnrollmentDetail>> {
    return this.get<ApiResponse<EnrollmentDetail>>(`/${enrollmentId}`, options);
  }

  // Certificates
  getCertificate(
    enrollmentId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<CertificateData>> {
    return this.get<ApiResponse<CertificateData>>(`/${enrollmentId}/certificate`, options);
  }

  downloadCertificate(certificateId: string): string {
    return `/api/certificates/${certificateId}/download`;
  }

  getShareUrl(certificateId: string): string {
    return `${window.location.origin}/certificates/${certificateId}`;
  }

  verifyCertificate(
    certificateNumber: string,
    options?: RequestOptions
  ): Promise<ApiResponse<VerifyCertificateResponse>> {
    return this.get<ApiResponse<VerifyCertificateResponse>>(
      `/certificates/${certificateNumber}`,
      options
    );
  }

  generateCertificate(
    enrollmentId: string,
    studentName: string,
    options?: RequestOptions
  ): Promise<ApiResponse<GenerateCertificateResponse>> {
    return this.post<ApiResponse<GenerateCertificateResponse>>(
      `/${enrollmentId}/certificate`,
      { studentName },
      options
    );
  }

  // Video URLs
  getSignedVideoUrl(
    enrollmentId: string,
    lessonId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<SignedVideoUrlResponse>> {
    return this.get<ApiResponse<SignedVideoUrlResponse>>(
      `/${enrollmentId}/lessons/${lessonId}/playback/url`,
      options
    );
  }

  refreshVideoUrl(
    enrollmentId: string,
    lessonId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<SignedVideoUrlResponse>> {
    return this.get<ApiResponse<SignedVideoUrlResponse>>(
      `/${enrollmentId}/lessons/${lessonId}/playback/url/refresh`,
      options
    );
  }

  // Progress
  getEnrollmentProgress(
    enrollmentId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<EnrollmentProgressResponse>> {
    return this.get<ApiResponse<EnrollmentProgressResponse>>(`/${enrollmentId}/progress`, options);
  }

  updateLessonProgress(
    enrollmentId: string,
    lessonId: string,
    payload: UpdateLessonProgressPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<UpdateLessonProgressResponse>> {
    return this.post<ApiResponse<UpdateLessonProgressResponse>>(
      `/${enrollmentId}/lessons/${lessonId}/progress`,
      payload,
      options
    );
  }

  // Quiz
  submitQuizAttempt(
    enrollmentId: string,
    quizId: string,
    payload: SubmitQuizAttemptPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<SubmitQuizAttemptResponse>> {
    return this.post<ApiResponse<SubmitQuizAttemptResponse>>(
      `/${enrollmentId}/quizzes/${quizId}/attempt`,
      payload,
      options
    );
  }

  // Course Reviews
  submitCourseReview(
    enrollmentId: string,
    payload: SubmitCourseReviewPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<Review>> {
    return this.post<ApiResponse<Review>>(`/${enrollmentId}/review`, payload, options);
  }

  updateCourseReview(
    enrollmentId: string,
    reviewId: string,
    payload: SubmitCourseReviewPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<Review>> {
    // PATCH is often used for update, but this depends on your API
    return this.patch<ApiResponse<Review>>(`/${enrollmentId}/review/${reviewId}`, payload, options);
  }

  deleteCourseReview(
    enrollmentId: string,
    reviewId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Review>> {
    return this.delete<ApiResponse<Review>>(`/${enrollmentId}/review/${reviewId}`, options);
  }

  getCourseReviewByEnrollment(
    enrollmentId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Review>> {
    return this.get<ApiResponse<Review>>(`/${enrollmentId}/review`, options);
  }

  // --- Additional methods ---

  checkEnrollment(
    enrollmentId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<{ enrolled: boolean }>> {
    return this.get<ApiResponse<{ enrolled: boolean }>>(`/${enrollmentId}/check`, options);
  }

  markLessonCompleted(
    enrollmentId: string,
    lessonId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Enrollment>> {
    return this.patch<ApiResponse<Enrollment>>(
      `/${enrollmentId}/lessons/${lessonId}/complete`,
      options
    );
  }

  submitQuizScore(
    enrollmentId: string,
    quizId: string,
    payload: SubmitQuizPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<Enrollment>> {
    return this.patch<ApiResponse<Enrollment>>(
      `/${enrollmentId}/quizzes/${quizId}/submit`,
      payload,
      options
    );
  }

  // Static factory for SSR usage (pass a token getter or headers)
  static create(serviceOptions: BaseServiceOptions) {
    return new EnrollmentService(serviceOptions);
  }
}

// Singleton for client-side usage
export const enrollmentService: IEnrollmentService = new EnrollmentService();
