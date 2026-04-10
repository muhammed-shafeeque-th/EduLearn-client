import { BaseService, BaseServiceOptions, RequestOptions } from '../base-service';
import { config } from '@/lib/config';
import { ApiResponse } from '@/types/api-response';
import { authRefreshToken, getClientAuthToken } from '@/lib/auth/auth-client-apis';
import {
  GetPresignedUrlPayload,
  MultipartUploadCompletePayload,
  MultipartUploadInitPayload,
  MultipartUploadResponse,
  PresignedUrlResponse,
  UploadSignatureResponse,
} from './media.types';
import { IMediaService } from './media.service.interface';

export class MediaService extends BaseService implements IMediaService {
  constructor({
    getToken = getClientAuthToken,
    authRefresh = authRefreshToken,
    ...options
  }: BaseServiceOptions = {}) {
    super(`${config.apiUrl}/media`, {
      getToken,
      authRefresh,
      ...options,
    });
  }

  generateAvatarUploadSignature(
    payload: {
      uploadType: string;
    },
    options?: RequestOptions
  ): Promise<ApiResponse<UploadSignatureResponse>> {
    return this.post<ApiResponse<UploadSignatureResponse>>('/avatar/signature', payload, options);
  }

  generateCourseUploadSignature(
    payload: GetPresignedUrlPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<PresignedUrlResponse>> {
    return this.post<ApiResponse<PresignedUrlResponse>>('/course/signature', payload, options);
  }

  generateSecureCourseUploadSignature(
    payload: GetPresignedUrlPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<PresignedUrlResponse>> {
    return this.post<ApiResponse<PresignedUrlResponse>>(
      '/course/secure/signature',
      payload,
      options
    );
  }

  courseMultipartUploadComplete(
    payload: MultipartUploadCompletePayload,
    options?: RequestOptions
  ): Promise<ApiResponse<string>> {
    return this.post<ApiResponse<string>>(
      '/course/secure/signature/multipart/complete',
      payload,
      options
    );
  }

  initiateMultipartCourseUpload(
    payload: MultipartUploadInitPayload,
    options?: RequestOptions
  ): Promise<ApiResponse<MultipartUploadResponse>> {
    return this.post<ApiResponse<MultipartUploadResponse>>(
      '/course/secure/signature/multipart/init',
      payload,
      options
    );
  }

  generateSignedCourseUrl(key: string): Promise<ApiResponse<{ url: string }>> {
    return this.post<ApiResponse<{ url: string }>>('/course/signature', { key });
  }

  // Static factory for SSR usage (pass a token getter or headers)
  static create(serviceOptions: BaseServiceOptions) {
    return new MediaService(serviceOptions);
  }
}

// Singleton for client-side usage
export const mediaService: IMediaService = new MediaService();
