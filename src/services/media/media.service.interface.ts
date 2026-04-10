import { RequestOptions } from '../base-service';
import { ApiResponse } from '@/types/api-response';
import {
  GetPresignedUrlPayload,
  MultipartUploadCompletePayload,
  MultipartUploadInitPayload,
  MultipartUploadResponse,
  PresignedUrlResponse,
  UploadSignatureResponse,
} from './media.types';

export interface IMediaService {
  generateAvatarUploadSignature(
    payload: {
      uploadType: string;
    },
    options?: RequestOptions
  ): Promise<ApiResponse<UploadSignatureResponse>>;
  generateSecureCourseUploadSignature(
    payload: GetPresignedUrlPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<PresignedUrlResponse>>;
  generateCourseUploadSignature(
    payload: GetPresignedUrlPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<PresignedUrlResponse>>;
  generateSignedCourseUrl(key: string): Promise<ApiResponse<{ url: string }>>;
  initiateMultipartCourseUpload(
    payload: MultipartUploadInitPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<MultipartUploadResponse>>;
  // courseMultipartUploadGetParts(payload: RegisterInstructorPayload): Promise<ApiResponse<User>>;
  courseMultipartUploadComplete(
    payload: MultipartUploadCompletePayload,
    options?: RequestOptions
  ): Promise<ApiResponse<string>>;
  // courseMultipartUploadAbort(payload: RegisterInstructorPayload): Promise<ApiResponse<User>>;
}
