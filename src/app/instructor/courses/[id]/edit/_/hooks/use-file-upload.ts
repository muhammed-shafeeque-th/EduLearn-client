/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import axios, { AxiosProgressEvent, CancelTokenSource } from 'axios';
import { getFromLocalStorage, removeFromLocalStorage, saveToLocalStorage } from '@/lib/utils';
import { apiClient } from '@/lib/utils/api-client';
import {
  CompletedPart,
  MultipartUploadResponse,
  PresignedUrlResponse,
  mediaService,
} from '@/services/media.service';

interface UploadState {
  isUploading: boolean;
  isPaused: boolean;
  progress: number;
  uploadedBytes: number;
  totalBytes: number;
  speed: number; // bytes per second
  eta: number; // seconds remaining
  error: string | null;
  success: boolean;
  uploadedUrl?: string;
  uploadId?: string;
  retryCount: number;
  isMultipart: boolean;
  completedParts: number;
  totalParts: number;
  currentChunk: number;
}

interface UploadOptions {
  file: File;
  courseId: string;
  isSecure?: boolean;
  onProgress?: (progress: UploadProgressInfo) => void;
  onSuccess?: (url: string, uploadId: string) => void;
  onError?: (error: string) => void;
  onPause?: () => void;
  onResume?: () => void;
  enableResume?: boolean;
  enableMultipart?: boolean;
  chunkSize?: number;
}

interface UploadProgressInfo {
  progress: number;
  uploadedBytes: number;
  totalBytes: number;
  speed: number;
  eta: number;
  isMultipart: boolean;
  completedParts?: number;
  totalParts?: number;
  currentChunk?: number;
}

// Configuration
const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks
const MULTIPART_THRESHOLD = 100 * 1024 * 1024; // 100MB - use multipart for files larger than this
const MAX_RETRIES = 3;
const RETRIES_THRUSH_HOLD = 2;
const RETRY_DELAY_BASE = 1000;
const SPEED_CALCULATION_INTERVAL = 1000;
const AUTO_RESUME_DELAY = 5000;
const MAX_CONCURRENT_CHUNKS = 3;

// Storage keys for persistence
const STORAGE_KEYS = {
  UPLOADS: 'edulearn_uploads',
  UPLOAD_PREFIX: 'edulearn_upload_',
  MULTIPART_PREFIX: 'edulearn_multipart_',
};

export const useFileUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    isPaused: false,
    progress: 0,
    uploadedBytes: 0,
    totalBytes: 0,
    speed: 0,
    eta: 0,
    error: null,
    success: false,
    retryCount: 0,
    isMultipart: false,
    completedParts: 0,
    totalParts: 0,
    currentChunk: 0,
  });

  const cancelTokenRef = useRef<CancelTokenSource | null>(null);
  const uploadStartTimeRef = useRef<number>(0);
  const lastProgressTimeRef = useRef<number>(0);
  const lastProgressBytesRef = useRef<number>(0);
  const speedSamplesRef = useRef<number[]>([]);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentFileRef = useRef<File | null>(null);
  const currentOptionsRef = useRef<UploadOptions | null>(null);
  const multipartStateRef = useRef<{
    uploadId?: string;
    completedParts: CompletedPart[];
    pendingChunks: Array<{ partNumber: number; chunk: Blob; retryCount: number }>;
    activeUploads: number;
  }>({
    completedParts: [],
    pendingChunks: [],
    activeUploads: 0,
  });

  // Utility functions
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const calculateChecksum = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
          resolve(hashHex);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file for checksum'));
      reader.readAsArrayBuffer(file);
    });
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024 * 1024; // 5GB for large files
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/zip',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
    ];

    if (file.size > maxSize) {
      return `File size must be less than ${maxSize / (1024 * 1024 * 1024)}GB`;
    }

    if (!allowedTypes.includes(file.type)) {
      return 'File type not supported. Please check allowed file types.';
    }

    return null;
  };

  const updateSpeed = useCallback(
    (uploadedBytes: number) => {
      const now = Date.now();
      const timeDiff = now - lastProgressTimeRef.current;

      if (timeDiff >= SPEED_CALCULATION_INTERVAL) {
        const bytesDiff = uploadedBytes - lastProgressBytesRef.current;
        const currentSpeed = (bytesDiff / timeDiff) * 1000; // bytes per second

        // Keep last 5 speed samples for smoothing
        speedSamplesRef.current.push(currentSpeed);
        if (speedSamplesRef.current.length > 5) {
          speedSamplesRef.current.shift();
        }

        // Calculate average speed
        const avgSpeed =
          speedSamplesRef.current.reduce((sum, speed) => sum + speed, 0) /
          speedSamplesRef.current.length;

        // Calculate ETA
        const remainingBytes = uploadState.totalBytes - uploadedBytes;
        const eta = avgSpeed > 0 ? Math.ceil(remainingBytes / avgSpeed) : 0;

        setUploadState((prev) => ({
          ...prev,
          speed: Math.round(avgSpeed),
          eta,
          uploadedBytes,
        }));

        lastProgressTimeRef.current = now;
        lastProgressBytesRef.current = uploadedBytes;
      }
    },
    [uploadState.totalBytes]
  );

  const saveUploadProgress = useCallback(
    (uploadId: string, progress: Partial<UploadState>, isMultipart = false) => {
      if (typeof window !== 'undefined') {
        try {
          const storageKey = `${isMultipart ? STORAGE_KEYS.MULTIPART_PREFIX : STORAGE_KEYS.UPLOAD_PREFIX}${uploadId}`;
          const data = {
            ...progress,
            timestamp: Date.now(),
            ...(isMultipart && {
              completedParts: multipartStateRef.current.completedParts,
            }),
          };
          saveToLocalStorage(storageKey, data);
        } catch (error) {
          console.warn('Failed to save upload progress:', error);
        }
      }
    },
    []
  );

  const getUploadProgress = useCallback((uploadId: string, isMultipart = false): any => {
    if (typeof window !== 'undefined') {
      try {
        const storageKey = `${isMultipart ? STORAGE_KEYS.MULTIPART_PREFIX : STORAGE_KEYS.UPLOAD_PREFIX}${uploadId}`;
        const stored = getFromLocalStorage(storageKey);
        return stored;
      } catch (error) {
        console.warn('Failed to get upload progress:', error);
        return null;
      }
    }
    return null;
  }, []);

  const clearUploadProgress = useCallback((uploadId: string, isMultipart = false) => {
    if (typeof window !== 'undefined') {
      try {
        const storageKey = `${isMultipart ? STORAGE_KEYS.MULTIPART_PREFIX : STORAGE_KEYS.UPLOAD_PREFIX}${uploadId}`;
        removeFromLocalStorage(storageKey);
      } catch (error) {
        console.warn('Failed to clear upload progress:', error);
      }
    }
  }, []);

  // Regular upload for smaller files
  const getPresignedUrl = async (
    fileName: string,
    fileType: string,
    fileSize: number,
    courseId: string,
    checksum?: string
  ): Promise<PresignedUrlResponse> => {
    const response = await mediaService.generateCourseUploadSignature({
      fileName,
      fileType,
      fileSize,
      courseId,
      checksum,
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to get presigned URL');
    }

    return response.data;
  };

  const getSecurePresignedUrl = async (
    fileName: string,
    fileType: string,
    fileSize: number,
    courseId: string,
    checksum?: string
  ): Promise<PresignedUrlResponse> => {
    const response = await mediaService.generateSecureCourseUploadSignature({
      fileName,
      fileType,
      fileSize,
      courseId,
      checksum,
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to get presigned URL');
    }

    return response.data;
  };

  // Multipart upload initialization
  const initializeMultipartUpload = async (
    fileName: string,
    fileType: string,
    fileSize: number,
    courseId: string,
    chunkSize: number
  ): Promise<MultipartUploadResponse> => {
    const response = await mediaService.initiateMultipartCourseUpload(
      {
        fileName,
        fileType,
        fileSize,
        courseId,
        chunkSize,
      },
      {
        timeout: 30000,
      }
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to initialize multipart upload');
    }

    return response.data;
  };

  // Complete multipart upload
  const completeMultipartUpload = async (
    uploadId: string,
    parts: CompletedPart[]
  ): Promise<string> => {
    const response = await mediaService.courseMultipartUploadComplete(
      {
        uploadId,
        parts: parts.sort((a, b) => a.partNumber - b.partNumber),
      },
      {
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to complete multipart upload');
    }

    return response.data;
  };

  // Upload single chunk
  const uploadChunk = async (
    chunk: Blob,
    uploadUrl: string,
    partNumber: number,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const etag = xhr.getResponseHeader('ETag');
          if (etag) {
            resolve(etag.replace(/"/g, ''));
          } else {
            reject(new Error('No ETag received'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during chunk upload'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.send(chunk);
    });
  };

  // Multipart upload implementation
  const uploadMultipart = async (
    file: File,
    uploadData: MultipartUploadResponse,
    onProgress?: (progress: UploadProgressInfo) => void
  ): Promise<void> => {
    const { uploadId, parts } = uploadData;
    const chunkSize = currentOptionsRef.current?.chunkSize || DEFAULT_CHUNK_SIZE;

    multipartStateRef.current = {
      uploadId,
      completedParts: [],
      pendingChunks: [],
      activeUploads: 0,
    };

    // Load previous progress if resuming
    const savedProgress = getUploadProgress(uploadId, true);
    if (savedProgress?.completedParts) {
      multipartStateRef.current.completedParts = savedProgress.completedParts;
    }

    // Create chunks that haven't been completed yet
    const completedPartNumbers = new Set(
      multipartStateRef.current.completedParts.map((p) => p.partNumber)
    );

    for (const part of parts) {
      if (!completedPartNumbers.has(part.partNumber)) {
        const start = (part.partNumber - 1) * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        multipartStateRef.current.pendingChunks.push({
          partNumber: part.partNumber,
          chunk,
          retryCount: 0,
        });
      }
    }

    const totalParts = parts.length;
    const initialCompletedParts = multipartStateRef.current.completedParts.length;

    setUploadState((prev) => ({
      ...prev,
      isMultipart: true,
      totalParts,
      completedParts: initialCompletedParts,
      uploadedBytes: initialCompletedParts * chunkSize,
    }));

    // Process chunks with concurrency control
    const processChunk = async (): Promise<void> => {
      if (multipartStateRef.current.pendingChunks.length === 0) return;
      if (multipartStateRef.current.activeUploads >= MAX_CONCURRENT_CHUNKS) return;

      const chunkData = multipartStateRef.current.pendingChunks.shift();
      if (!chunkData) return;

      multipartStateRef.current.activeUploads++;

      try {
        const partData = parts.find((p) => p.partNumber === chunkData.partNumber);
        if (!partData) throw new Error(`Part ${chunkData.partNumber} not found`);

        const etag = await uploadChunk(
          chunkData.chunk,
          partData.uploadUrl,
          chunkData.partNumber,
          (chunkProgress) => {
            // Update progress for this specific chunk
            const baseProgress =
              (multipartStateRef.current.completedParts.length / totalParts) * 100;
            const chunkWeight = (1 / totalParts) * (chunkProgress / 100) * 100;
            const totalProgress = Math.min(baseProgress + chunkWeight, 100);

            setUploadState((prev) => ({
              ...prev,
              progress: Math.round(totalProgress),
              currentChunk: chunkData.partNumber,
            }));
          }
        );

        // Mark part as completed
        const completedPart: CompletedPart = {
          partNumber: chunkData.partNumber,
          etag,
        };

        multipartStateRef.current.completedParts.push(completedPart);

        const completedParts = multipartStateRef.current.completedParts.length;
        const uploadedBytes = completedParts * chunkSize;

        setUploadState((prev) => ({
          ...prev,
          completedParts,
          uploadedBytes: Math.min(uploadedBytes, file.size),
          progress: Math.round((completedParts / totalParts) * 100),
        }));

        updateSpeed(uploadedBytes);

        // Save progress
        saveUploadProgress(
          uploadId,
          {
            completedParts,
            uploadedBytes,
            progress: Math.round((completedParts / totalParts) * 100),
          },
          true
        );

        onProgress?.({
          progress: Math.round((completedParts / totalParts) * 100),
          uploadedBytes,
          totalBytes: file.size,
          speed: uploadState.speed,
          eta: uploadState.eta,
          isMultipart: true,
          completedParts,
          totalParts,
          currentChunk: chunkData.partNumber,
        });
      } catch (error) {
        chunkData.retryCount++;

        if (chunkData.retryCount < MAX_RETRIES) {
          // Retry the chunk
          multipartStateRef.current.pendingChunks.push(chunkData);
        } else {
          throw new Error(
            `Failed to upload chunk ${chunkData.partNumber}: ${(error as Error).message}`
          );
        }
      } finally {
        multipartStateRef.current.activeUploads--;
      }
    };

    // Process chunks concurrently
    const processAllChunks = async (): Promise<void> => {
      const promises: Promise<void>[] = [];

      while (
        multipartStateRef.current.pendingChunks.length > 0 ||
        multipartStateRef.current.activeUploads > 0
      ) {
        // Start new chunks if we can
        while (
          multipartStateRef.current.activeUploads < MAX_CONCURRENT_CHUNKS &&
          multipartStateRef.current.pendingChunks.length > 0
        ) {
          promises.push(processChunk());
        }

        // Wait for at least one chunk to complete
        if (promises.length > 0) {
          await Promise.race(promises);
        }

        // Remove completed promises
        for (let i = promises.length - 1; i >= 0; i--) {
          const promise = promises[i];
          if ((await Promise.race([promise, Promise.resolve('pending')])) !== 'pending') {
            promises.splice(i, 1);
          }
        }

        // Small delay to prevent busy waiting
        await sleep(50);
      }

      // Wait for all remaining promises
      await Promise.all(promises);
    };

    await processAllChunks();

    // Complete the multipart upload
    await completeMultipartUpload(uploadId, multipartStateRef.current.completedParts);

    // Clear progress
    clearUploadProgress(uploadId, true);
  };

  // Regular upload for smaller files
  const uploadToS3 = async (
    file: File,
    uploadUrl: string,
    onProgress?: (progress: UploadProgressInfo) => void
  ): Promise<void> => {
    let retryCount = 0;

    while (retryCount <= MAX_RETRIES) {
      try {
        cancelTokenRef.current = axios.CancelToken.source();

        await apiClient.put(uploadUrl, file, {
          headers: {
            'Content-Type': file.type,
            // 'Content-Length': file.size.toString(),
          },
          timeout: 600000, // 10 minutes timeout
          cancelToken: cancelTokenRef.current.token,
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (progressEvent.total && !uploadState.isPaused) {
              const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
              const uploadedBytes = progressEvent.loaded;

              updateSpeed(uploadedBytes);

              const progressInfo: UploadProgressInfo = {
                progress,
                uploadedBytes,
                totalBytes: progressEvent.total,
                speed: uploadState.speed,
                eta: uploadState.eta,
                isMultipart: false,
              };

              setUploadState((prev) => ({
                ...prev,
                progress,
                uploadedBytes,
                totalBytes: progressEvent.total!,
              }));

              onProgress?.(progressInfo);

              // Save progress periodically
              if (uploadState.uploadId && progress % 10 === 0) {
                saveUploadProgress(uploadState.uploadId, { progress, uploadedBytes });
              }
            }
          },
        });

        break; // Success, exit retry loop
      } catch (error: any) {
        if (axios.isCancel(error)) {
          throw new Error('Upload cancelled');
        }

        retryCount++;

        setUploadState((prev) => ({
          ...prev,
          retryCount,
        }));

        if (retryCount > MAX_RETRIES) {
          throw new Error(
            `Upload failed after ${MAX_RETRIES} retries: ${error.response?.data?.message || error.message}`
          );
        }

        // Exponential backoff with jitter
        const delay = RETRY_DELAY_BASE * Math.pow(2, retryCount - 1) + Math.random() * 1000;
        await sleep(delay);
      }
    }
  };

  let refreshCount = 0;
  // Main upload function
  const uploadFile = useCallback(
    async (options: UploadOptions): Promise<void> => {
      const {
        file,
        courseId,
        onProgress,
        onSuccess,
        onError,
        isSecure = false,
        enableResume = true,
        enableMultipart = true,
        chunkSize = DEFAULT_CHUNK_SIZE,
      } = options;

      currentFileRef.current = file;
      currentOptionsRef.current = options;

      // Reset state
      setUploadState({
        isUploading: true,
        isPaused: false,
        progress: 0,
        uploadedBytes: 0,
        totalBytes: file.size,
        speed: 0,
        eta: 0,
        error: null,
        success: false,
        retryCount: 0,
        isMultipart: enableMultipart && file.size > MULTIPART_THRESHOLD,
        completedParts: 0,
        totalParts: 0,
        currentChunk: 0,
      });

      uploadStartTimeRef.current = Date.now();
      lastProgressTimeRef.current = Date.now();
      lastProgressBytesRef.current = 0;
      speedSamplesRef.current = [];

      try {
        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
          throw new Error(validationError);
        }

        // Calculate checksum for integrity verification
        let checksum: string | undefined;
        try {
          if (file.size < MULTIPART_THRESHOLD) {
            // Only calculate checksum for smaller files
            checksum = await calculateChecksum(file);
          }
        } catch (error) {
          console.warn('Failed to calculate checksum:', error);
        }

        const useMultipart = enableMultipart && file.size > MULTIPART_THRESHOLD;

        if (useMultipart) {
          // Use multipart upload for large files
          const uploadData = await initializeMultipartUpload(
            file.name,
            file.type,
            file.size,
            courseId,
            chunkSize
          );

          setUploadState((prev) => ({
            ...prev,
            uploadId: uploadData.uploadId,
            totalParts: uploadData.parts.length,
          }));

          await uploadMultipart(file, uploadData, onProgress);

          // The final URL is returned from completeMultipartUpload
          // const s3Url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${uploadData.key}`;

          setUploadState((prev) => ({
            ...prev,
            isUploading: false,
            progress: 100,
            success: true,
            uploadedUrl: uploadData.fileUrl,
          }));

          onSuccess?.(uploadData.key, uploadData.uploadId);
        } else {
          let presignedData: PresignedUrlResponse;
          // Use regular upload for smaller files
          if (isSecure) {
            presignedData = await getSecurePresignedUrl(
              file.name,
              file.type,
              file.size,
              courseId,
              checksum
            );
          } else {
            presignedData = await getPresignedUrl(
              file.name,
              file.type,
              file.size,
              courseId,
              checksum
            );
          }

          setUploadState((prev) => ({
            ...prev,
            uploadId: presignedData.uploadId,
          }));

          // Check if presigned URL has expired
          if (Date.now() > presignedData.expires) {
            throw new Error('Presigned URL has expired. Please try again.');
          }

          // Check for resumable upload
          if (enableResume) {
            const savedProgress = getUploadProgress(presignedData.uploadId);
            if (savedProgress && savedProgress.progress && savedProgress.progress > 0) {
              const shouldResume = window.confirm(
                `Found a previous upload at ${savedProgress.progress}%. Do you want to resume?`
              );

              if (shouldResume) {
                setUploadState((prev) => ({
                  ...prev,
                  progress: savedProgress.progress || 0,
                  uploadedBytes: savedProgress.uploadedBytes || 0,
                }));
              }
            }
          }

          // Upload to S3
          await uploadToS3(file, presignedData.uploadUrl, onProgress);

          // Construct final S3 URL
          // const s3Url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${presignedData.key}`;

          // Clear saved progress
          clearUploadProgress(presignedData.uploadId);

          setUploadState((prev) => ({
            ...prev,
            isUploading: false,
            progress: 100,
            success: true,
            uploadedUrl: isSecure ? presignedData.key : presignedData.fileUrl,
          }));

          onSuccess?.(isSecure ? presignedData.key : presignedData.fileUrl, presignedData.uploadId);
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Upload failed';

        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          error: errorMessage,
          success: false,
        }));

        // Auto-retry with exponential backoff for network errors
        if (error.message.includes('Network Error') || error.code === 'ECONNABORTED') {
          if (refreshCount < RETRIES_THRUSH_HOLD) {
            refreshCount++;

            const delay = AUTO_RESUME_DELAY * Math.pow(2, uploadState.retryCount);
            retryTimeoutRef.current = setTimeout(() => {
              uploadFile(options);
            }, delay);
          }
        }

        onError?.(errorMessage);
      }
    },
    [
      updateSpeed,
      saveUploadProgress,
      getUploadProgress,
      clearUploadProgress,
      uploadState.retryCount,
      uploadState.uploadId,
      uploadState.speed,
      uploadState.eta,
      uploadMultipart,
      uploadToS3,
      uploadState,
      saveUploadProgress,
      saveUploadProgress,
      updateSpeed,
      uploadState,
    ]
  );

  const pauseUpload = useCallback(() => {
    if (cancelTokenRef.current && uploadState.isUploading) {
      cancelTokenRef.current.cancel('Upload paused');
      setUploadState((prev) => ({
        ...prev,
        isPaused: true,
        isUploading: false,
      }));
      currentOptionsRef.current?.onPause?.();
    }
  }, [uploadState.isUploading]);

  const resumeUpload = useCallback(() => {
    if (uploadState.isPaused && currentFileRef.current && currentOptionsRef.current) {
      setUploadState((prev) => ({
        ...prev,
        isPaused: false,
        error: null,
      }));
      uploadFile(currentOptionsRef.current);
      currentOptionsRef.current?.onResume?.();
    }
  }, [uploadState.isPaused, uploadFile]);

  const cancelUpload = useCallback(() => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('Upload cancelled by user');
    }

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Clear saved progress
    if (uploadState.uploadId) {
      clearUploadProgress(uploadState.uploadId, uploadState.isMultipart);
    }

    setUploadState((prev) => ({
      ...prev,
      isUploading: false,
      isPaused: false,
      error: 'Upload cancelled',
      success: false,
    }));
  }, [uploadState.uploadId, uploadState.isMultipart, clearUploadProgress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted');
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const formatBytes = useCallback((bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }, []);

  const formatSpeed = useCallback(
    (bytesPerSecond: number): string => {
      return `${formatBytes(bytesPerSecond)}/s`;
    },
    [formatBytes]
  );

  const formatTime = useCallback((seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  }, []);

  return {
    uploadState,
    uploadFile,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    formatBytes,
    formatSpeed,
    formatTime,
  };
};
