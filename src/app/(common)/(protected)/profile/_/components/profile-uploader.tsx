import React, { useState, useRef, useCallback } from 'react';
import { useFileUpload } from '../hooks/use-file-upload';
import Image from 'next/image';
import { toast } from '@/hooks/use-toast';
import { FieldError } from 'react-hook-form';

interface ProfileUploadProps {
  error?: FieldError;
  currentAvatarUrl?: string;
  onUploadSuccess?: (avatarUrl: string) => void;
  onUploadError?: (error: string) => void;
}

const ProfileUpload: React.FC<ProfileUploadProps> = ({
  error,
  currentAvatarUrl,
  onUploadSuccess,
  onUploadError,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading, progress, error: uploadError, setError } = useFileUpload();

  // Best practice: Validate before reading preview/uploading
  const validateFile = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeMB = 5;
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, or WebP files are allowed.');
      return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      return false;
    }
    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Clear previous errors before validating/selecting file
    setError(null);

    if (!validateFile(file)) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    handleUpload().catch((error) => console.error(error));
  };

  const handleUpload = useCallback(async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setError('Please select a file first.');
      return;
    }

    try {
      const file = fileInputRef.current.files[0];

      if (!validateFile(file)) return;

      const result = await uploadFile(file, 'avatar');

      if (onUploadSuccess) {
        onUploadSuccess(result.secure_url);
      }
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success({ title: 'Profile picture uploaded to cloud successfully!' });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : typeof err === 'string' ? err : 'Upload failed';
      if (onUploadError) {
        onUploadError(errorMessage);
      }
      setError(errorMessage);
    }
    // eslint-disable-next-line
  }, [onUploadSuccess, onUploadError, uploadFile, setError]);

  const handleCancel = () => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  // Enhanced: Combine upload error and field validation error, with strong UX semantics
  const errorMessage: string | undefined = uploadError
    ? String(uploadError)
    : error?.message
      ? error.message
      : undefined;

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
      {/* Avatar Display */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-gray-300">
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt="Profile picture"
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
        {/* Upload Progress Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center z-10">
            <div className="text-white text-center flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
              <div className="text-xs">{progress}%</div>
            </div>
          </div>
        )}
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        tabIndex={-1}
        disabled={uploading}
        aria-label="Choose new profile picture"
      />

      {/* Action Buttons */}
      <div className="flex flex-col items-center space-y-2 w-full">
        {!previewUrl ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-primary/80 text-white rounded hover:bg-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors w-md max-w-xs"
            aria-disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Choose New Picture'}
          </button>
        ) : (
          <div className="flex space-x-2 w-full max-w-xs">
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-primary/80 text-white rounded hover:bg-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              aria-disabled={uploading}
            >
              {uploading ? `Uploading... ${progress}%` : 'Upload'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              aria-disabled={uploading}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Error Display for upload error and validation/field error together */}
      {errorMessage && (
        <div
          className="w-full max-w-xs mt-2 flex items-start bg-red-50 border border-red-200 rounded-md px-3 py-2"
          role="alert"
          aria-live="assertive"
        >
          <svg
            className="w-4 h-4 text-red-500 mr-2 mt-1 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm text-red-700">{errorMessage}</span>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center max-w-xs mt-1">
        Supported formats: JPEG, PNG, WebP. Maximum size: 5MB. Images will be automatically resized
        to 400x400 pixels.
      </p>
    </div>
  );
};

export default ProfileUpload;
