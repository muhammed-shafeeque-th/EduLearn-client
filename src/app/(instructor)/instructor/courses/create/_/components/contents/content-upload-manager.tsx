'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  File,
  Video,
  FileText,
  Presentation,
  Headphones,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Pause,
} from 'lucide-react';
import { S3UploadService } from '@/services/__s3-upload';
import { formatFileSize } from '../../utils/curriculum-utils';
import { ContentType } from '@/types/course';
import { ContentFile } from '../../../__/schemas/curriculum-schema';

interface ContentUploadManagerProps {
  contentType: ContentType;
  files: ContentFile[];
  onFilesChange: (files: ContentFile[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
}

export const ContentUploadManager: React.FC<ContentUploadManagerProps> = ({
  contentType,
  files,
  onFilesChange,
  maxFiles = 10,
  acceptedTypes,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadService = useRef(new S3UploadService());
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  const getContentIcon = (type: ContentType) => {
    switch (type) {
      case 'video':
        return Video;
      case 'audio':
        return Headphones;
      case 'document':
        return FileText;
      case 'slides':
        return Presentation;
      default:
        return File;
    }
  };

  const getAcceptedTypes = () => {
    if (acceptedTypes) return acceptedTypes.join(',');

    switch (contentType) {
      case 'video':
        return 'video/mp4,video/webm,video/ogg,video/avi,video/mov,video/wmv';
      case 'audio':
        return 'audio/mp3,audio/wav,audio/ogg,audio/aac,audio/m4a';
      case 'document':
        return '.pdf,.doc,.docx,.txt,.rtf';
      case 'slides':
        return '.ppt,.pptx,.key,.odp';
      default:
        return '*';
    }
  };

  const handleFileSelect = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      const newFiles = Array.from(selectedFiles).map((file) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: contentType as any,
        file,
        size: file.size,
        mimeType: file.type,
        s3Upload: {
          key: '',
          bucket: '',
          url: '',
          status: 'idle' as const,
        },
      }));

      const updatedFiles = [...files, ...newFiles].slice(0, maxFiles);
      onFilesChange(updatedFiles);

      // Start uploads
      newFiles.forEach((fileItem) => startUpload(fileItem));
    },
    [files, contentType, maxFiles, onFilesChange]
  );

  const startUpload = useCallback(
    async (fileItem: ContentFile) => {
      if (!fileItem.file) return;

      const controller = new AbortController();
      abortControllers.current.set(fileItem.id, controller);

      // Update status to uploading
      updateFileStatus(fileItem.id, {
        status: 'uploading',
        progress: { loaded: 0, total: fileItem.file.size, percentage: 0 },
      });

      try {
        const result = await uploadService.current.uploadFile(fileItem.file, contentType, {
          onProgress: (progress) => {
            updateFileStatus(fileItem.id, { progress });
          },
          onError: (error) => {
            updateFileStatus(fileItem.id, {
              status: 'failed',
              error: error.message,
            });
          },
          signal: controller.signal,
        });

        // Upload completed
        updateFileStatus(fileItem.id, {
          status: 'completed',
          key: result.key,
          url: result.url,
          progress: { loaded: fileItem.file!.size, total: fileItem.file!.size, percentage: 100 },
        });

        // Start processing if it's a video
        if (contentType === 'video') {
          updateFileStatus(fileItem.id, { status: 'processing' });
          // Simulate processing time
          setTimeout(() => {
            updateFileStatus(fileItem.id, { status: 'completed' });
          }, 3000);
        }
      } catch (error: any) {
        if (error.message !== 'Upload aborted') {
          updateFileStatus(fileItem.id, {
            status: 'failed',
            error: error.message,
          });
        }
      } finally {
        abortControllers.current.delete(fileItem.id);
      }
    },
    [contentType]
  );

  const updateFileStatus = useCallback(
    (fileId: string, updates: Partial<ContentFile['s3Upload']>) => {
      onFilesChange(
        files.map((file) =>
          file.id === fileId ? { ...file, s3Upload: { ...file.s3Upload!, ...updates } } : file
        )
      );
    },
    [files, onFilesChange]
  );

  const cancelUpload = useCallback(
    (fileId: string) => {
      const controller = abortControllers.current.get(fileId);
      if (controller) {
        controller.abort();
        updateFileStatus(fileId, { status: 'failed', error: 'Upload cancelled' });
      }
    },
    [updateFileStatus]
  );

  const removeFile = useCallback(
    (fileId: string) => {
      cancelUpload(fileId);
      onFilesChange(files.filter((file) => file.id !== fileId));
    },
    [files, onFilesChange, cancelUpload]
  );

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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const Icon = getContentIcon(contentType);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragOver
            ? 'border-primary bg-primary/5 dark:bg-orange-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary'
        }`}
      >
        <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />

        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Upload {contentType} files
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Drag and drop your files here, or click to browse
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary transition-colors font-medium"
          >
            <Upload className="w-5 h-5 mr-2" />
            Choose Files
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Accepted formats: {getAcceptedTypes().split(',').join(', ')}
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={getAcceptedTypes()}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h4 className="font-medium text-gray-900 dark:text-white">
              Uploaded Files ({files.length})
            </h4>

            {files.map((file) => (
              <FileUploadItem
                key={file.id}
                file={file}
                onRemove={() => removeFile(file.id)}
                onCancel={() => cancelUpload(file.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// File Upload Item Component
interface FileUploadItemProps {
  file: ContentFile;
  onRemove: () => void;
  onCancel: () => void;
}

const FileUploadItem: React.FC<FileUploadItemProps> = ({ file, onRemove, onCancel }) => {
  const getStatusIcon = () => {
    switch (file.s3Upload?.status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (file.s3Upload?.status) {
      case 'uploading':
        return `Uploading... ${file.s3Upload.progress?.percentage || 0}%`;
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Upload complete';
      case 'failed':
        return `Failed: ${file.s3Upload.error}`;
      default:
        return 'Ready to upload';
    }
  };

  const canCancel = file.s3Upload?.status === 'uploading' || file.s3Upload?.status === 'processing';
  const progress = file.s3Upload?.progress?.percentage || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
    >
      <div className="flex items-center flex-1 min-w-0">
        {getStatusIcon()}

        <div className="ml-3 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {file.name}
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {file.size ? formatFileSize(file.size) : ''}
            </span>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400">{getStatusText()}</p>

          {/* Progress Bar */}
          {(file.s3Upload?.status === 'uploading' || file.s3Upload?.status === 'processing') && (
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 ml-4">
        {canCancel && (
          <button
            onClick={onCancel}
            className="p-1 text-yellow-500 hover:text-yellow-700 transition-colors"
            title="Cancel upload"
          >
            <Pause className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onRemove}
          className="p-1 text-red-500 hover:text-red-700 transition-colors"
          title="Remove file"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
