'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, ChevronDown, PlayCircle, FileText, AlertCircle } from 'lucide-react';
import { Lesson, Content, CurriculumFormData } from '../../schemas/curriculum-schema';
import { ContentModal } from '../contents/content-modal';
import { formatDuration } from '../../utils/curriculum-utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CourseControllerAPI } from '../../hooks/use-course-controller';
import { Control, useWatch } from 'react-hook-form';
import { BlurInput } from '../ui/blur-inputs';
import { BlurTextarea } from '../ui/blur-text-area';

// Strongly type errors for better understanding and robustness
interface LessonFieldError {
  title?: { message?: string };
  description?: { message?: string };
  content?: { message?: string };
  estimatedDuration?: { message?: string };
}

interface LessonEditorProps {
  control: Control<CurriculumFormData>;
  lessonIndex: number;
  sectionIndex: number;
  courseId: string;
  controller: CourseControllerAPI;
  canMoveUp: boolean;
  canMoveDown: boolean;
  lessonError?: LessonFieldError;
}

export const LessonEditor = ({
  control,
  lessonIndex,
  sectionIndex,
  courseId,
  controller,
  canMoveUp,
  canMoveDown,
  lessonError,
}: LessonEditorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Watch section and lesson for controller operations
  // const section = useWatch({ control, name: `sections.${sectionIndex}` });
  const lesson = useWatch({ control, name: `sections.${sectionIndex}.lessons.${lessonIndex}` });

  // Extract field-specific errors safely
  const titleError = lessonError?.title?.message ?? '';
  const descriptionError = lessonError?.description?.message ?? '';
  const contentError = lessonError?.content?.message ?? '';
  const estimatedDurationError = lessonError?.estimatedDuration?.message ?? '';

  // Memoized stats for improved re-renders
  const stats = useMemo(() => {
    return {
      hasContent: !!lesson?.content,
      contentType: lesson?.content?.type ?? '',
    };
  }, [lesson?.content]);

  /**
   * Updates a single field in the lesson. Only triggers when value is changed.
   * Sends sectionIndex and lessonIndex as required by controller handler.
   */
  const handleFieldUpdate = useCallback(
    async <T extends keyof Lesson>(field: T, value: Lesson[T]) => {
      if (!lesson) return;
      if (lesson[field] === value) return;
      // Controller expects: sectionIdx, lessonIdx, field, value
      await controller.updateLessonField(sectionIndex, lessonIndex, field, value);
    },
    [controller, sectionIndex, lessonIndex, lesson]
  );

  /**
   * Add new content to the lesson (content gets a generated id).
   * Sends sectionIndex, lessonIndex as required by controller handler.
   */
  const handleAddContent = useCallback(
    async (content: Omit<Content, 'id'>) => {
      if (!lesson) return;

      // Controller expects: sectionIdx, lessonIdx, content
      await controller.addLessonContent(sectionIndex, lessonIndex, content);
      setShowContentModal(false);
    },
    [controller, sectionIndex, lessonIndex, lesson]
  );

  /**
   * Updates existing content in the lesson (in-place merge).
   * Passes sectionIndex, lessonIndex, updates as required.
   */
  const handleUpdateContent = useCallback(
    async (updates: Partial<Content>) => {
      if (!lesson?.content) return;
      // Controller expects: sectionIdx, lessonIdx, updates
      await controller.updateLessonContent(sectionIndex, lessonIndex, updates);
    },
    [controller, sectionIndex, lessonIndex, lesson]
  );

  /**
   * Moves the lesson up or down within its section.
   * Passes sectionIndex, lessonIndex, direction.
   */
  const handleMoveLesson = useCallback(
    (direction: 'up' | 'down') => {
      if (!lesson) return;
      const newIdx = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
      // Controller expects: sectionIdx, fromLessonIdx, toLessonIdx
      controller.reorderLessons(sectionIndex, lessonIndex, newIdx);
    },
    [controller, sectionIndex, lessonIndex, lesson]
  );

  /**
   * Deletes the lesson after confirmation.
   * Passes sectionIndex, lessonIndex to the controller as required.
   */
  const handleDeleteLesson = useCallback(() => {
    if (!lesson) return;
    const confirmed = window.confirm(`Delete "${lesson.title}"? This cannot be undone.`);
    if (confirmed) {
      // Controller expects: sectionIdx, lessonIdx
      controller.deleteLesson(sectionIndex, lessonIndex);
    }
  }, [controller, sectionIndex, lessonIndex, lesson]);

  /**
   * Deletes content from the lesson after confirmation.
   * Passes sectionIndex, lessonIndex to the controller as required.
   */
  const handleDeleteContent = useCallback(async () => {
    if (!lesson) return;
    if (window.confirm('Delete lesson content? This cannot be undone.')) {
      // Controller expects: sectionIdx, lessonIdx
      await controller.updateLessonContent(sectionIndex, lessonIndex, {});
    }
  }, [controller, sectionIndex, lessonIndex, lesson]);

  // Accessibility: generate a unique id for use in ARIA attributes
  const lessonHeaderId = lesson?.id ? `lesson-header-${lesson.id}` : undefined;

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
      aria-labelledby={lessonHeaderId}
    >
      {/* Lesson Header */}
      <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-750">
        <div className="flex items-center flex-1 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-medium mr-3 flex-shrink-0">
            {lessonIndex + 1}
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors mr-2"
            aria-expanded={isExpanded}
            aria-controls={`lesson-panel-${lesson?.id ?? ''}`}
          >
            <ChevronDown className={`w-5 h-5 ${isExpanded ? '' : 'rotate-180'}`} />
          </button>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div>
                <BlurInput
                  value={lesson?.title || ''}
                  onSave={(val) => handleFieldUpdate('title', val)}
                  className={`w-full text-base font-medium ${
                    titleError ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  onBlur={() => setIsEditing(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Escape') setIsEditing(false);
                  }}
                  aria-label="Lesson Title"
                />
                {titleError && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {titleError}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center">
                  <h4
                    className="text-base font-medium text-gray-900 dark:text-white truncate"
                    id={lessonHeaderId}
                  >
                    {lesson?.title}
                  </h4>
                  {titleError && (
                    <AlertCircle
                      className="w-4 h-4 text-red-500 ml-2 flex-shrink-0"
                      aria-label={titleError}
                    />
                  )}
                </div>
                <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  {stats.hasContent ? (
                    <>
                      <div className="flex items-center">
                        <PlayCircle className="w-4 h-4 mr-1" />
                        {stats.contentType}
                      </div>
                      {/* {!!stats.duration && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDuration(stats.duration)}
                          </div>
                        )} */}
                    </>
                  ) : (
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
              className="flex items-center space-x-2 ml-4 flex-shrink-0"
            >
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded"
                aria-label="Edit lesson title"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              {canMoveUp && (
                <button
                  type="button"
                  onClick={() => handleMoveLesson('up')}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded"
                  aria-label="Move lesson up"
                >
                  <ChevronDown className="w-4 h-4 rotate-180" />
                </button>
              )}

              {canMoveDown && (
                <button
                  type="button"
                  onClick={() => handleMoveLesson('down')}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded"
                  aria-label="Move lesson down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handleDeleteLesson}
                className="p-2 text-red-400 hover:text-red-600 transition-colors rounded"
                aria-label="Delete lesson"
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
            id={`lesson-panel-${lesson?.id ?? ''}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 dark:border-gray-700"
            aria-labelledby={lessonHeaderId}
          >
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <Label
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  htmlFor={`description-${lesson?.id ?? ''}`}
                >
                  Description
                </Label>
                <BlurTextarea
                  id={`description-${lesson?.id ?? ''}`}
                  value={lesson?.description || ''}
                  onSave={(val) => handleFieldUpdate('description', val)}
                  rows={3}
                  className={`w-full resize-none ${
                    descriptionError ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="Lesson description..."
                  aria-invalid={!!descriptionError}
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
                    type="button"
                    onClick={() => !stats.hasContent && setShowContentModal(true)}
                    disabled={stats.hasContent}
                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Add content"
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
                          {lesson?.content?.type === 'video' && (
                            <PlayCircle className="w-5 h-5 text-red-500" />
                          )}
                          {/* {lesson?.content?.type === 'document' && (
                              <FileText className="w-5 h-5 text-blue-500" />
                            )} */}
                          <h6 className="font-medium text-gray-900 dark:text-white">
                            {lesson?.content?.file?.name || lesson?.content?.url || 'Content'}
                          </h6>
                        </div>
                        {!!lesson?.content?.duration && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Duration: {formatDuration(lesson.content.duration)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowContentModal(true)}
                          className="p-2 text-blue-600 hover:text-blue-700"
                          aria-label="Edit content"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteContent}
                          className="p-2 text-red-600 hover:text-red-700"
                          aria-label="Delete content"
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
                      aria-hidden="true"
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
                      type="button"
                      onClick={() => setShowContentModal(true)}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      aria-label="Add content to this lesson"
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
                    <Label
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      htmlFor={`duration-${lesson?.id ?? ''}`}
                    >
                      Estimated Duration (minutes)
                    </Label>
                    <BlurInput
                      id={`duration-${lesson?.id ?? ''}`}
                      type="number"
                      min="0"
                      value={lesson?.estimatedDuration || ''}
                      onSave={(val) =>
                        handleFieldUpdate('estimatedDuration', val === '' ? 0 : Number(val))
                      }
                      className={`w-full ${
                        estimatedDurationError ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      placeholder="Auto-calculated"
                      aria-invalid={!!estimatedDurationError}
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
                      checked={lesson?.isPublished || false}
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
        onAdd={lesson?.content ? (updates) => handleUpdateContent(updates) : handleAddContent}
        existingContent={lesson?.content}
        courseId={courseId}
      />
    </div>
  );
};

LessonEditor.displayName = 'LessonEditor';
