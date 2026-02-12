'use client';

import {
  CloudinaryUploadResponse,
  mediaService,
  UploadSignatureResponse,
} from '@/services/media.service';
import { useState, useCallback } from 'react';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File, uploadType: string = 'avatar') => {
    const validationRules = {
      avatar: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxDimensions: { width: 2000, height: 2000 },
      },
      document: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maxDimensions: null,
      },
    };

    const rules = validationRules[uploadType as keyof typeof validationRules];
    if (!rules) {
      throw new Error('Invalid upload type');
    }

    if (file.size > rules.maxSize) {
      throw new Error(`File size must be less than ${rules.maxSize / 1024 / 1024}MB`);
    }

    if (!rules.allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed: ${rules.allowedTypes.join(', ')}`);
    }

    return true;
  }, []);

  const getUploadSignature = useCallback(
    async (uploadType: string = 'avatar'): Promise<UploadSignatureResponse> => {
      const response = await mediaService.generateAvatarUploadSignature({ uploadType });
      if (!response.success) {
        throw new Error(response.message);
      }

      return response.data as UploadSignatureResponse;
    },
    []
  );

  const uploadToCloudinary = useCallback(
    async (
      file: File,
      signatureData: UploadSignatureResponse['data']
    ): Promise<CloudinaryUploadResponse> => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', signatureData.apiKey);
        formData.append('timestamp', signatureData.timestamp.toString());
        formData.append('public_id', signatureData.publicId);
        formData.append('signature', signatureData.signature);
        formData.append('folder', signatureData.uploadParams.folder);

        // Add conditional parameters
        if (signatureData.uploadParams.transformation) {
          formData.append('transformation', signatureData.uploadParams.transformation);
        }
        if (signatureData.uploadParams.allowed_formats) {
          formData.append('allowed_formats', signatureData.uploadParams.allowed_formats);
        }
        if (signatureData.uploadParams.resource_type) {
          formData.append('resource_type', signatureData.uploadParams.resource_type);
        }

        const xhr = new XMLHttpRequest();

        // Progress tracking
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setProgress(Math.round(percentComplete));
          }
        });

        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch {
              reject(new Error('Invalid response from Cloudinary'));
            }
          } else {
            try {
              const error = JSON.parse(xhr.responseText);
              reject(new Error(error.message || 'Upload failed'));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network error during upload'));
        };

        xhr.ontimeout = () => {
          reject(new Error('Upload timeout'));
        };

        xhr.timeout = 30000; // 30 second timeout

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;
        xhr.open('POST', cloudinaryUrl);
        xhr.send(formData);
      });
    },
    []
  );

  // const updateUserAvatar = useCallback(async (avatarUrl: string) => {
  //   const token = localStorage.getItem('token');
  //   if (!token) {
  //     throw new Error('Authentication required');
  //   }

  //   const response = await fetch('/api/users/me/avatar', {
  //     method: 'PUT',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${token}`,
  //     },
  //     body: JSON.stringify({ avatarUrl }),
  //   });

  //   if (!response.ok) {
  //     const error = await response.json();
  //     throw new Error(error.message || 'Failed to update avatar');
  //   }

  //   return response.json();
  // }, []);

  const uploadFile = useCallback(
    async (file: File, uploadType: string = 'avatar'): Promise<CloudinaryUploadResponse> => {
      setUploading(true);
      setError(null);
      setProgress(0);

      try {
        // 1. Validate file
        validateFile(file, uploadType);

        // 2. Get upload signature
        setProgress(10);
        const signatureResponse = await getUploadSignature(uploadType);

        console.log('signature resonse ' + JSON.stringify(signatureResponse, null, 2));

        // 3. Upload to Cloudinary
        setProgress(20);
        const uploadResult = await uploadToCloudinary(
          file,
          signatureResponse as unknown as UploadSignatureResponse['data']
        );

        // 4. Update user data if avatar
        // if (uploadType === 'avatar') {
        //   setProgress(90);
        //   await updateUserAvatar(uploadResult.secure_url);
        // }

        setProgress(100);
        return uploadResult;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        setError(errorMessage);
        throw err;
      } finally {
        setUploading(false);
        // Reset progress after a delay
        setTimeout(() => setProgress(0), 1000);
      }
    },
    [validateFile, getUploadSignature, uploadToCloudinary]
  );

  return {
    uploadFile,
    uploading,
    progress,
    error,
    setError: (error: string | null) => setError(error),
  };
};
