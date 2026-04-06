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
