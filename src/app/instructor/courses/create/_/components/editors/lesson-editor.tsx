'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  PlayCircle,
  FileText,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Lesson, Content } from '../../schemas/curriculum-schema';
import { ContentModal } from '../contents/content-modal';
import { formatDuration } from '../../utils/curriculum-utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface LessonEditorProps {
  lesson: Lesson;
  lessonIndex: number;
  sectionIndex: number;
  courseId: string;
  onUpdate: (updates: Partial<Lesson>) => void;
  onRemove: () => void;
  onMove: (direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  lessonError?: any;
}

export const LessonEditor = ({
  lesson,
  lessonIndex,
  courseId,
  onUpdate,
  onRemove,
  onMove,
  canMoveUp,
  canMoveDown,
  lessonError,
}: LessonEditorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const titleError = lessonError?.title?.message;
  const descriptionError = lessonError?.description?.message;
  const contentError = lessonError?.content?.message;
  const estimatedDurationError = lessonError?.estimatedDuration?.message;

  const stats = useMemo(() => {
    return {
      hasContent: !!lesson.content,
      duration: 0,
      contentType: lesson.content?.type,
    };
  }, [lesson.content]);

  const handleFieldUpdate = useCallback(
    async (field: keyof Lesson, value: any) => {
      onUpdate({ [field]: value });
    },
    [onUpdate]
  );

  const handleAddContent = useCallback(
    async (content: Omit<Content, 'id'>) => {
      const newContent: Content = {
        ...content,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      onUpdate({ content: newContent });

      setShowContentModal(false);
    },
    [onUpdate]
  );

  const handleUpdateContent = useCallback(
    async (updates: Partial<Content>) => {
      if (!lesson.content) return;
      onUpdate({
        content: { ...lesson.content, ...updates },
      });
    },
    [lesson.content, onUpdate]
  );

  const handleDeleteContent = useCallback(async () => {
    onUpdate({ content: undefined });
  }, [onUpdate]);

  return (
    <div
      className={`bg-white dark:bg-gray-800 border rounded-lg overflow-hidden hover:shadow-md transition-all ${
        titleError || contentError
          ? 'border-red-300 dark:border-red-700'
          : 'border-gray-200 dark:border-gray-700'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      role="region"
      aria-label={`Lesson ${lessonIndex + 1}: ${lesson.title}`}
    >
      {/* Lesson Header */}
      <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-750">
        <div className="flex items-center flex-1 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-medium mr-3 shrink-0">
            {lessonIndex + 1}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors mr-2"
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5 rotate-180" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div>
                <Input
                  value={lesson.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  className={`w-full text-base font-medium ${
                    titleError ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  onBlur={(e) => handleFieldUpdate('title', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditing(false);
                    if (e.key === 'Escape') setIsEditing(false);
                  }}
                />
                {titleError && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                    {titleError}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <div>
                  <h4 className="text-base font-medium text-gray-900 dark:text-white truncate">
                    {lesson.title}
                  </h4>
                  {titleError && (
                    <AlertCircle
                      className="w-4 h-4 text-red-500 ml-2 shrink-0"
                      aria-label={titleError}
                    />
                  )}
                </div>
                <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  {stats.hasContent && (
                    <>
                      <div className="flex items-center">
                        <PlayCircle className="w-4 h-4 mr-1" />
                        {stats.contentType}
                      </div>
                      {stats.duration > 0 && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDuration(stats.duration)}
                        </div>
                      )}
                    </>
                  )}
                  {!stats.hasContent && (
                    <span className="text-amber-600 dark:text-amber-400">No content</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center space-x-2 ml-4 shrink-0"
            >
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              {canMoveUp && (
                <button
                  onClick={() => onMove('up')}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded"
                >
                  <ChevronDown className="w-4 h-4 rotate-180" />
                </button>
              )}

              {canMoveDown && (
                <button
                  onClick={() => onMove('down')}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={onRemove}
                className="p-2 text-red-400 hover:text-red-600 transition-colors rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lesson Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </Label>
                <Textarea
                  value={lesson.description || ''}
                  onChange={(e) => handleFieldUpdate('description', e.target.value)}
                  rows={3}
                  className={`w-full resize-none ${
                    descriptionError ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="Lesson description..."
                />
                {descriptionError && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {descriptionError}
                  </p>
                )}
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-lg font-medium text-gray-900 dark:text-white">Content</h5>
                  {contentError && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {contentError}
                    </p>
                  )}
                  <button
                    onClick={() => !stats.hasContent && setShowContentModal(true)}
                    disabled={stats.hasContent}
                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Content
                  </button>
                </div>

                {stats.hasContent ? (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          {lesson.content?.type === 'video' && (
                            <PlayCircle className="w-5 h-5 text-red-500" />
                          )}
                          {/* {lesson.content?.type === 'document' && (
                              <FileText className="w-5 h-5 text-blue-500" />
                            )} */}
                          <h6 className="font-medium text-gray-900 dark:text-white">
                            {lesson.content?.file?.name || lesson.content?.url || 'Content'}
                          </h6>
                        </div>

                        {/* {lesson.content?.duration && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              Duration: {formatDuration(lesson.content.duration)}
                            </p>
                          )} */}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowContentModal(true)}
                          className="p-2 text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleDeleteContent}
                          className="p-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`text-center py-8 border-2 border-dashed rounded-lg ${
                      contentError
                        ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <FileText
                      className={`w-12 h-12 mx-auto mb-4 ${
                        contentError ? 'text-red-400' : 'text-gray-400'
                      }`}
                    />
                    <p
                      className={`mb-4 ${
                        contentError
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {contentError || 'No content added yet'}
                    </p>
                    <button
                      onClick={() => setShowContentModal(true)}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Add content to this lesson
                    </button>
                  </div>
                )}
              </div>

              {/* Lesson Settings */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Settings</h5>

                <div className="space-y-3">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estimated Duration (minutes)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={lesson.estimatedDuration || ''}
                      onChange={(e) =>
                        handleFieldUpdate(
                          'estimatedDuration',
                          parseInt(e.target.value) || undefined
                        )
                      }
                      className={`w-full ${
                        estimatedDurationError ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      placeholder="Auto-calculated"
                    />
                    {estimatedDurationError && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {estimatedDurationError}
                      </p>
                    )}
                  </div>

                  <Label className="flex items-start cursor-pointer">
                    <Input
                      type="checkbox"
                      checked={lesson.isPublished}
                      onChange={(e) => handleFieldUpdate('isPublished', e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mt-0.5"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Published
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Visible to students
                      </p>
                    </div>
                  </Label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Modal */}
      <ContentModal
        isOpen={showContentModal}
        onClose={() => setShowContentModal(false)}
        onAdd={lesson.content ? (updates) => handleUpdateContent(updates) : handleAddContent}
        existingContent={lesson.content}
        courseId={courseId}
      />
    </div>
  );
};

LessonEditor.displayName = 'LessonEditor';
