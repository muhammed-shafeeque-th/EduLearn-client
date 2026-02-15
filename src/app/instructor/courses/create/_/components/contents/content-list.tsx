'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, FileText, Headphones, ExternalLink, Eye } from 'lucide-react';
import { Content } from '../../schemas/curriculum-schema';
import { formatFileSize } from '../../utils/curriculum-utils';
import { ContentType } from '../../../__/schemas/curriculum-schema';

interface ContentListProps {
  content?: Content;
  onEdit: (content: Content) => void;
  onDelete: () => void;
}

export const ContentList = React.memo(({ content }: ContentListProps) => {
  const [isExpanded] = useState(false);

  const contentIcon = useMemo(() => {
    const iconMap: Record<ContentType, React.ComponentType> = {
      video: Video,
      audio: Headphones,
      document: FileText,
      link: ExternalLink,
      slides: FileText,
      quiz: FileText,
      assignment: FileText,
    };
    return content ? iconMap[content.type] : FileText;
  }, [content?.type]);

  const contentLabel = useMemo(() => {
    const labelMap: Record<ContentType, string> = {
      video: 'Video',
      audio: 'Audio',
      document: 'Document',
      link: 'Link',
      slides: 'Slides',
      quiz: 'Quiz',
      assignment: 'Assignment',
    };
    return content ? labelMap[content.type] : 'Content';
  }, [content?.type]);

  // const uploadProgress = useMemo(() => {
  //   if (!content?.file?.s3Upload) return null;

  //   const status = content.file.s3Upload.status;
  //   const progress = content.file.s3Upload.progress?.percentage || 0;

  //   return { status, progress };
  // }, [content?.file?.s3Upload]);

  const IconComponent = contentIcon;

  if (!content) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-sm">No content added yet</p>
      </div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
      role="article"
      aria-label={`Content: ${content.id}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 flex-shrink-0">
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                {content.file?.name || 'Content'}
              </h4>

              {content.isPreview && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 flex-shrink-0">
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </span>
              )}

              {content.isRequired && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 flex-shrink-0">
                  Required
                </span>
              )}
            </div>

            <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{contentLabel}</span>

              {content.file?.size && (
                <>
                  <span>•</span>
                  <span>{formatFileSize(parseInt(content.file.size))}</span>
                </>
              )}

              {/* {content.duration && (
                <>
                  <span>•</span>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDuration(content.duration)}
                  </div>
                </>
              )} */}
            </div>
          </div>
        </div>

        {/* Status and Actions */}
        {/* {uploadProgress && (
          <div className="flex items-center space-x-2 mr-4">
            {uploadProgress.status === 'uploading' && (
              <div className="flex items-center text-blue-600 dark:text-blue-400">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs ml-1">{uploadProgress.progress}%</span>
              </div>
            )}

            {uploadProgress.status === 'completed' && (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}

            {uploadProgress.status === 'failed' && (
              <div className="flex items-center text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
              </div>
            )}
          </div>
        )} */}

        {/* Action Buttons */}
        {/* <div className="flex items-center space-x-2">
          {content.file?.url && uploadProgress?.status === 'completed' && (
            <button
              onClick={() => window.open(content.file!.url, '_blank')}
              className="p-2 text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
              aria-label="Download file"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onEdit(content)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Edit content"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={onDelete}
            className="p-2 text-red-400 hover:text-red-600 transition-colors"
            aria-label="Delete content"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div> */}
      </div>

      {/* Upload Progress Bar */}
      {/* {uploadProgress?.status === 'uploading' && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 px-4 py-3"
        >
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${uploadProgress.progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Uploading: {uploadProgress.progress}%
          </p>
        </motion.div>
      )} */}

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && content.file && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-4"
          >
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">File Name:</span>
                <p className="text-gray-900 dark:text-white break-all">{content.file.name}</p>
              </div>

              <div>
                <span className="text-gray-600 dark:text-gray-400">File Type:</span>
                <p className="text-gray-900 dark:text-white">{content.file.type}</p>
              </div>

              {content.file.size && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">File Size:</span>
                  <p className="text-gray-900 dark:text-white">
                    {formatFileSize(parseInt(content.file.size || '0'))}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

ContentList.displayName = 'ContentList';
