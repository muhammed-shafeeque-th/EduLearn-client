import { BaseService, BaseServiceOptions, RequestOptions } from './base-service';
import { config } from '@/lib/config';
import { ApiResponse } from '@/types/api-response';
import { authRefreshToken, getClientAuthToken } from '@/lib/auth/auth-client-apis';

export interface UploadSignatureResponse {
  success: boolean;
  data: {
    signature: string;
    timestamp: number;
    publicId: string;
    apiKey: string;
    cloudName: string;
    uploadParams: {
      folder: string;
      transformation?: string;
      allowed_formats?: string;
      resource_type?: string;
    };
  };
}

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
}

export interface GetPresignedUrlPayload {
  fileName: string;
  fileType: string;
  fileSize: number;
  courseId: string;
  checksum?: string;
}
export interface MultipartUploadInitPayload {
  fileName: string;
  fileType: string;
  fileSize: number;
  courseId: string;
  chunkSize: number;
}
export interface MultipartUploadCompletePayload {
  uploadId: string;
  parts: CompletedPart[];
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expires: number;
  uploadId: string;
}

export interface MultipartUploadResponse {
  uploadId: string;
  fileUrl: string;
  key: string;
  parts: Array<{
    partNumber: number;
    uploadUrl: string;
  }>;
}

export interface CompletedPart {
  partNumber: number;
  etag: string;
}

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
