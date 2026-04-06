import { ApiResponse } from '@/types/api-response';
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
import { RequestOptions } from '../base-service';

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
    certificateId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<CertificateData>>;
  getCertificateByEnrollmentId(
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
  getUserCertificates(options?: RequestOptions): Promise<ApiResponse<CertificateData[]>>;

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
