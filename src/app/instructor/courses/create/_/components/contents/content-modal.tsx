'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Content } from '../../schemas/curriculum-schema';
import { useFileUpload } from '../../hooks/use-file-upload';
import { toast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ContentType } from '@/types/course';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (content: Omit<Content, 'id'>) => void;
  existingContent?: Content;
  courseId: string;
}

const CONTENT_TYPES = [
  {
    type: 'video' as ContentType,
    label: 'Video Content',
    icon: Video,
    description: 'Upload or link video files',
    accepts: ['.mp4', '.webm', '.mov'],
    maxSize: 500 * 1024 * 1024,
  },
  // {
  //   type: 'document' as ContentType,
  //   label: 'Documents',
  //   icon: FileText,
  //   description: 'PDF, Word documents, text files',
  //   accepts: ['.pdf', '.doc', '.docx', '.txt'],
  //   maxSize: 50 * 1024 * 1024,
  // },
];

interface FormState {
  type: ContentType;
  url: string;
  isPreview: boolean;
  isRequired: boolean;
  uploadedFile?: File;
}

export const ContentModal = ({
  isOpen,
  onClose,
  onAdd,
  existingContent,
  courseId,
}: ContentModalProps) => {
  const [formState, setFormState] = useState<FormState>({
    type: existingContent?.type || 'video',
    url: existingContent?.url || '',
    isPreview: existingContent?.isPreview ?? true,
    isRequired: existingContent?.isRequired ?? true,
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { uploadState, uploadFile, cancelUpload, formatBytes } = useFileUpload();

  const selectedTypeConfig = useMemo(
    () => CONTENT_TYPES.find((t) => t.type === formState.type),
    [formState.type]
  );

  const isFormValid = useMemo(() => {
    if (formState.type === 'video' || formState.type === 'document') {
      return uploadedFile || formState.url;
    }
    return formState.url;
  }, [formState.type, uploadedFile, formState.url]);

  const handleFileSelect = useCallback(
    async (files: FileList) => {
      if (!files.length || !selectedTypeConfig) return;

      const file = files[0];

      if (file.size > selectedTypeConfig.maxSize) {
        toast.error({
          title: 'File too large',
          description: `Max size: ${formatBytes(selectedTypeConfig.maxSize)}`,
        });
        return;
      }

      setUploadedFile(file);

      // Auto-start upload
      await uploadFile({
        file,
        courseId,
        isSecure: !formState.isPreview,
        onSuccess: (_url) => {
          toast.success({
            title: 'Upload complete',
            description: 'File ready to use',
          });
        },
        onError: (error) => {
          toast.error({
            title: 'Upload failed',
            description: error,
          });
        },
      });
    },
    [selectedTypeConfig, uploadFile, courseId, formatBytes, formState.isPreview]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files?.length) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [handleFileSelect]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!isFormValid) {
        toast.error({
          title: 'Invalid form',
          description: 'Please add file or URL',
        });
        return;
      }

      if (uploadState.isUploading) {
        toast.error({
          title: 'Upload in progress',
          description: 'Wait for upload to complete',
        });
        return;
      }

      if (uploadedFile && !uploadState.uploadedUrl) {
        toast.error({
          title: 'Upload not finished',
          description: 'Please wait for upload to complete',
        });
        return;
      }

      const newContent: Omit<Content, 'id'> = {
        type: formState.type as any,
        file:
          uploadedFile && uploadState.uploadedUrl
            ? {
                id: `file_${Date.now()}`,
                name: uploadedFile.name,
                size: uploadedFile.size ? String(uploadedFile.size) : undefined,
                type: uploadedFile.type,
                url: uploadState.uploadedUrl,
              }
            : undefined,
        url: formState.url || undefined,
        isPreview: formState.isPreview,
        isRequired: formState.isRequired,
      };

      onAdd(newContent);
      onClose();
    },
    [
      isFormValid,
      uploadState.isUploading,
      uploadState.uploadedUrl,
      formState,
      uploadedFile,
      onAdd,
      onClose,
    ]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {existingContent ? 'Edit' : 'Add'} Content
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Upload or link your learning material
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Content Type Selection */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Content Type
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CONTENT_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formState.type === type.type;

                  return (
                    <button
                      key={type.type}
                      type="button"
                      onClick={() =>
                        setFormState((prev) => ({
                          ...prev,
                          type: type.type,
                        }))
                      }
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 dark:bg-primary/10'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 mb-2 ${isSelected ? 'text-primary' : 'text-gray-400'}`}
                      />
                      <p
                        className={`font-medium text-sm ${
                          isSelected ? 'text-primary' : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {type.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.isPreview}
                  disabled={uploadState.isUploading || uploadState.success}
                  onChange={(e) => {
                    // Prevent toggling mid-upload to avoid sending to wrong bucket
                    if (uploadState.isUploading) {
                      toast.error({
                        title: 'Upload in progress',
                        description: 'Cancel current upload to change preview setting',
                      });
                      return;
                    }
                    setFormState((prev) => ({
                      ...prev,
                      isPreview: e.target.checked,
                    }));
                    // If a file was already selected but not uploading, reset to force re-upload to correct bucket
                    if (uploadedFile && !uploadState.success) {
                      setUploadedFile(null);
                      cancelUpload();
                    }
                  }}
                  className="h-4 w-4 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Allow preview for non-enrolled
                </span>
              </label>
            </div>

            {/* File Upload */}
            {selectedTypeConfig && (
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Upload File
                </Label>

                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                    dragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-300 dark:border-gray-600'
                  } ${uploadState.isUploading ? 'pointer-events-none opacity-70' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Drag and drop or{' '}
                    <label className="text-primary cursor-pointer hover:underline">
                      choose file
                      <input
                        type="file"
                        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                        accept={selectedTypeConfig.accepts.join(',')}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Max: {formatBytes(selectedTypeConfig.maxSize)}
                  </p>
                </div>

                {/* Upload Status */}
                {uploadedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {uploadedFile.name}
                      </p>
                      {uploadState.success && <CheckCircle className="w-5 h-5 text-green-500" />}
                      {uploadState.error && <AlertCircle className="w-5 h-5 text-red-500" />}
                    </div>

                    {uploadState.isUploading && (
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <motion.div
                          className="bg-primary h-2 rounded-full"
                          initial={{ width: '0%' }}
                          animate={{
                            width: `${uploadState.progress}%`,
                          }}
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {/* URL Alternative */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL (Optional)
              </Label>
              <Input
                type="url"
                value={formState.url}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    url: e.target.value,
                  }))
                }
                placeholder="https://..."
                className="w-full"
              />
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.isRequired}
                  disabled={uploadState.isUploading}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      isRequired: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Required to complete
                </span>
              </label>
            </div>
          </form>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={!isFormValid || uploadState.isUploading || uploadState.error !== null}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {uploadState.isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  Uploading...
                </>
              ) : (
                'Add Content'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

ContentModal.displayName = 'ContentModal';
