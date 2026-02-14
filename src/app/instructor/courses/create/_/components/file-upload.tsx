/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, Image as ImageLogo, Video, Download } from 'lucide-react';
import { formatFileSize } from '../utils/curriculum-utils';
import Image from 'next/image';
import { useFileUpload } from '../hooks/use-file-upload';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/utils';

interface FileUploadProps {
  title: string;
  description: string;
  accept: string;
  value?: string;
  courseId: string;
  onUpload: (resourseUrl: string) => void;
  // preview?: string | null;
  icon: React.ComponentType<any>;
  buttonText: string;
  maxSize?: number; // in bytes
  error?: string;
  className?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadId?: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  progress: number;
  preview?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  title,
  description,
  accept,
  onUpload,
  courseId,
  value,
  icon: Icon,
  buttonText,
  maxSize = 100 * 1024 * 1024, // 100MB default
  error,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [changeFile, setChangeFile] = useState(false);

  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const { uploadFile } = useFileUpload();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, []);

  const validateFile = useCallback(
    (file: File): boolean => {
      if (file.size > maxSize) {
        alert(`File size must be less than ${formatFileSize(maxSize)}`);
        return false;
      }

      const acceptedTypes = accept.split(',').map((type) => type.trim());
      const isValidType = acceptedTypes.some((type) => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type.match(type.replace('*', '.*'));
      });

      if (!isValidType) {
        alert('Invalid file type');
        return false;
      }

      return true;
    },
    [maxSize, accept]
  );

  // Remove file
  const removeFile = useCallback(() => {
    setUploadedFile((prev) => {
      if (prev?.preview) {
        URL.revokeObjectURL(prev.preview);
      }
      return null;
    });

    setChangeFile(true);
  }, []);

  const handleFileSelect = useCallback(
    async (files: FileList) => {
      const file = files[0];
      // Validate file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!validateFile(file)) {
        alert(`File type ${fileExtension} not supported for ${title}`);
        return;
      }

      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending',
        progress: 0,
      };

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        try {
          newFile.preview = URL.createObjectURL(file);
        } catch {
          console.warn('Failed to generate preview for', file.name);
        }
      }

      setUploadedFile((prev) => ({ ...prev, ...newFile }));

      // Start upload
      try {
        // Update file status to uploading
        setUploadedFile((prev) => prev && { ...prev, status: 'uploading' });

        await uploadFile({
          file,
          courseId,
          enableResume: true,
          onProgress: (progress) => {
            setUploadedFile(
              (prev) =>
                prev && {
                  ...prev,
                  progress: progress.progress!,
                  status: 'uploading' as const,
                }
            );
          },
          onSuccess: (uploadUrl, uploadId) => {
            setUploadedFile(
              (prev) =>
                prev && {
                  ...prev,
                  url: uploadUrl,
                  uploadId,
                  status: 'completed' as const,
                  progress: 100,
                }
            );

            onUpload(uploadUrl);

            toast.success({
              title: 'Upload successful',
              description: 'course resource uploaded successfully',
            });
          },
          onError: (error) => {
            setUploadedFile(
              (prev) =>
                prev && {
                  ...prev,
                  status: 'failed' as const,
                }
            );
            toast.error({
              title: 'Upload failed:',
              description: error || 'Something went wrong',
            });
            console.error(error);
          },
        });
      } catch (error) {
        console.error(error);
        toast.error({
          title: 'Upload error:',
          description: getErrorMessage(error, 'Something went wrong'),
        });
      }
    },
    [uploadFile, courseId, validateFile, title, onUpload]
  );

  const getFileIcon = () => {
    if (accept.includes('image')) return ImageLogo;
    if (accept.includes('video')) return Video;
    if (accept.includes('application')) return FileText;
    return Download;
  };

  const FileIcon = getFileIcon();

  return (
    <div className={className}>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{description}</p>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragOver
            ? 'border-primary bg-primary/5 dark:bg-orange-900/20'
            : error
              ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
              : uploadedFile?.preview
                ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50'
        }`}
      >
        <AnimatePresence mode="wait">
          {uploadedFile?.status == 'uploading' ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 mx-auto bg-primary/10 dark:bg-primary/30 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary/90 dark:text-primary animate-bounce" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Uploading...
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadedFile?.progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {Math.round(uploadedFile?.progress)}% complete
                </p>
              </div>
            </motion.div>
          ) : uploadedFile?.status == 'completed' || (value && !changeFile) ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative"
            >
              {(value || uploadedFile?.preview) && accept.includes('image') ? (
                <Image
                  src={value || uploadedFile!.preview!}
                  width={800}
                  height={400}
                  alt="Preview"
                  className="w-full h-auto max-h-96 mx-auto rounded-lg shadow-sm object-contain"
                  style={{ display: 'block' }}
                />
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <FileIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      File uploaded successfully
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">Ready to use</p>
                  </div>
                </div>
              )}

              {(uploadedFile?.preview || value) && (
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute -top-2 -right-2 bg-red-400 text-white rounded-full p-2 shadow-lg hover:bg-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Icon className="w-8 h-8 text-gray-400" />
              </div>

              <div className="space-y-3">
                <label className="cursor-pointer inline-block">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-6 py-3 bg-primary/90 text-white rounded-lg hover:bg-primary transition-colors font-medium shadow-lg hover:shadow-xl"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    {buttonText}
                  </motion.span>
                  <input
                    type="file"
                    accept={accept}
                    onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                </label>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  or drag and drop your file here
                </p>

                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <p>Accepted formats: {accept}</p>
                  <p>Maximum size: {formatFileSize(maxSize)}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center text-red-600 dark:text-red-400 text-sm"
        >
          <X className="w-4 h-4 mr-1" />
          {error}
        </motion.div>
      )}
    </div>
  );
};
