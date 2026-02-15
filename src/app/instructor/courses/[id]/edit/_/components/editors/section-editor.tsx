/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  HelpCircle,
  Clock,
  GripVertical,
  BookOpen,
  AlertCircle,
} from 'lucide-react';
import { CurriculumFormData } from '../../schemas/curriculum-schema';
import { LessonEditor } from './lesson-editor';
import { QuizBuilder } from '../quiz/quiz-builder';
import { formatDuration } from '../../utils/curriculum-utils';
import { Input } from '@/components/ui/input';
import { CourseControllerAPI } from '../../hooks/use-course-controller';
import { Control, useWatch } from 'react-hook-form';
import { BlurTextarea } from '../ui/blur-text-area';
import { BlurInput } from '../ui/blur-inputs';

interface SectionEditorProps {
  control: Control<CurriculumFormData>;
  sectionIndex: number;
  courseId: string;
  controller: CourseControllerAPI;
  canMoveUp: boolean;
  canMoveDown: boolean;
  className?: string;
  isActive?: boolean;
  onToggleActive?: () => void;
  sectionError?: any;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  control,
  courseId,
  sectionIndex,
  controller,
  canMoveUp,
  canMoveDown,
  isActive = false,
  sectionError,
}) => {
  // State
  const [isExpanded, setIsExpanded] = useState<boolean>(isActive);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showQuizBuilder, setShowQuizBuilder] = useState<boolean>(false);
  const [showActions, setShowActions] = useState<boolean>(false);

  // Section data
  const section = useWatch({
    control,
    name: `sections.${sectionIndex}`,
  });

  // Memoized derived values
  const totalDuration = useMemo(
    () =>
      section?.lessons?.reduce(
        (sum: number, lesson: any) => sum + (lesson?.estimatedDuration || 0),
        0
      ),
    [section?.lessons]
  );
  const totalContent = useMemo(
    () =>
      section?.lessons?.reduce((sum: number, lesson: any) => sum + (lesson?.content ? 1 : 0), 0),
    [section?.lessons]
  );
  const lessonCount = section?.lessons?.length || 0;
  const hasQuiz = Boolean(section?.quiz);

  // Form errors
  const titleError = sectionError?.title?.message;
  const descriptionError = sectionError?.description?.message;
  const lessonsError = sectionError?.lessons;
  const quizError = sectionError?.quiz;

  // Memoized lesson error fetcher
  const getLessonError = useCallback(
    (lessonIndex: number) => lessonsError?.[lessonIndex],
    [lessonsError]
  );

  // Local handlers
  const handleTitleChange = useCallback(
    (value: string) => {
      controller.updateSectionField(sectionIndex, 'title', value);
    },
    [controller, sectionIndex]
  );

  const handleDescriptionChange = useCallback(
    (value: string) => {
      controller.updateSectionField(sectionIndex, 'description', value);
    },
    [controller, sectionIndex]
  );

  const handleIsPublishedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      controller.updateSectionField(sectionIndex, 'isPublished', e.target.checked);
    },
    [controller, sectionIndex]
  );

  // const handleUpdateSection = useCallback(
  //   <T extends keyof Section>(field: T, value: Section[T]) => {
  //     controller.updateSectionField(sectionIndex, field, value);
  //   },
  //   [controller, sectionIndex]
  // );

  const handleAddLesson = useCallback(() => {
    const lessonLen = section?.lessons?.length ?? 0;
    const newLesson = controller.createLesson(sectionIndex, {
      title: `Lesson ${lessonLen + 1}`,
      description: '',
      content: undefined as any,
      estimatedDuration: 0,
      isPublished: true,
      order: lessonLen,
    });
    setTimeout(() => {
      if (!newLesson?.id) return;
      const element = document.getElementById(`lesson-${newLesson.id}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, [controller, sectionIndex, section?.lessons?.length]);

  const handleRemoveSection = useCallback(() => {
    if (
      window.confirm(
        `Delete "${section?.title}"? This will remove all ${section?.lessons?.length ?? 0} lessons and cannot be undone.`
      )
    ) {
      controller.deleteSection(sectionIndex);
    }
  }, [controller, sectionIndex, section?.title, section?.lessons?.length]);

  const handleMoveSection = useCallback(
    (direction: 'up' | 'down') => {
      const newOrder = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
      controller.reorderSections(sectionIndex, newOrder);
    },
    [controller, sectionIndex]
  );

  const handleRemoveQuiz = useCallback(() => {
    if (!section?.quiz) return;
    if (window.confirm(`Delete quiz "${section.quiz.title}"? This cannot be undone.`)) {
      controller.deleteQuiz(sectionIndex, section.quiz.id);
      setShowQuizBuilder(false);
    }
  }, [controller, sectionIndex, section?.quiz]);

  const handleCreateQuiz = useCallback(() => {
    controller.createQuiz(sectionIndex, {
      title: `${section?.title || 'Section'} Quiz`,
      description: '',
      timeLimit: 60,
      questions: [],
      passingScore: 70,
      maxAttempts: 3,
      randomizeQuestions: false,
      showResults: true,
      isRequired: false,
    });
    setShowQuizBuilder(true);
  }, [controller, sectionIndex, section?.title]);

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setIsEditing(false);
    }
  }, []);

  // Classes
  const rootClass = [
    'bg-white dark:bg-gray-800 border-2 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all',
    titleError || descriptionError
      ? 'border-red-300 dark:border-red-700'
      : 'border-gray-200 dark:border-gray-700',
  ].join(' ');

  return (
    <div
      className={rootClass}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Section Header */}
      <div className="bg-gradient-to-r from-primary/5 to-blue-50 dark:from-orange-900/30 dark:to-pink-900/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-blue-500 text-white rounded-full text-lg font-bold mr-4">
              {sectionIndex + 1}
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded((expanded) => !expanded)}
              className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors mr-3"
              aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
            >
              {isExpanded ? (
                <ChevronDown className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-3">
                  <BlurInput
                    type="text"
                    value={section?.title ?? ''}
                    onSave={handleTitleChange}
                    className={`w-full text-lg font-bold ${titleError ? 'border-red-500 focus:ring-red-500' : ''}`}
                    onBlur={() => setIsEditing(false)}
                    onKeyDown={handleEditKeyDown}
                    aria-label="Section title"
                    // autoFocus
                  />
                  {titleError && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {titleError}
                    </p>
                  )}
                  <BlurTextarea
                    value={section?.description || ''}
                    onSave={handleDescriptionChange}
                    rows={2}
                    className={`w-full resize-none ${descriptionError ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Section description..."
                    onKeyDown={handleEditKeyDown}
                    aria-label="Section description"
                  />
                  {descriptionError && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {descriptionError}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                      {section?.title}
                    </h2>
                    {titleError && (
                      <span className="ml-2 flex items-center text-red-600 dark:text-red-400">
                        <AlertCircle
                          className="w-4 h-4 text-red-500 flex-shrink-0"
                          aria-label={titleError}
                        />
                        <span className="sr-only">{titleError}</span>
                      </span>
                    )}
                  </div>
                  {!!section?.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {section.description}
                    </p>
                  )}
                  <div className="flex items-center mt-2 space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center">
                      <PlayCircle className="w-4 h-4 mr-1" />
                      {totalContent} content{totalContent !== 1 ? 's' : ''}
                    </div>
                    {totalDuration > 0 && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDuration(totalDuration)}
                      </div>
                    )}
                    {hasQuiz && (
                      <div className="flex items-center">
                        <HelpCircle className="w-4 h-4 mr-1" />
                        Assessments
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Section Actions */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center space-x-2"
              >
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50"
                  title="Edit section"
                  aria-label="Edit section"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                {canMoveUp && (
                  <button
                    type="button"
                    onClick={() => handleMoveSection('up')}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50"
                    title="Move section up"
                    aria-label="Move section up"
                  >
                    <ChevronDown className="w-5 h-5 rotate-180" />
                  </button>
                )}
                {canMoveDown && (
                  <button
                    type="button"
                    onClick={() => handleMoveSection('down')}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50"
                    title="Move section down"
                    aria-label="Move section down"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleRemoveSection}
                  className="p-2 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50"
                  title="Delete section"
                  aria-label="Delete section"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="cursor-move p-2 text-gray-400" tabIndex={-1} aria-hidden>
                  <GripVertical className="w-5 h-5" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Section-level error message */}
        {(titleError || descriptionError) && !isEditing && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              Please fix the errors in this section before continuing
            </p>
          </div>
        )}
      </div>

      {/* Section Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 space-y-6">
              {/* Lessons */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Lessons ({lessonCount})
                  </h3>
                  {lessonsError?.message && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {lessonsError.message}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleAddLesson}
                    className="inline-flex items-center px-4 py-2 bg-primary/90 text-white rounded-lg hover:bg-primary transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lesson
                  </button>
                </div>

                {lessonCount === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" aria-hidden />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No lessons in this section yet
                    </p>
                    <button
                      type="button"
                      onClick={handleAddLesson}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Add your first lesson
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {section?.lessons?.map?.((lesson: any, index: number) => (
                      <LessonEditor
                        key={lesson.id}
                        controller={controller}
                        courseId={courseId}
                        sectionIndex={sectionIndex}
                        control={control}
                        lessonIndex={index}
                        canMoveUp={index > 0}
                        canMoveDown={index < lessonCount - 1}
                        lessonError={getLessonError(index)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Section Quiz */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Assessments
                    </h3>
                    {quizError?.message && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {quizError.message}
                      </p>
                    )}
                  </div>
                  {!hasQuiz ? (
                    <button
                      type="button"
                      onClick={handleCreateQuiz}
                      className="inline-flex items-center px-4 py-2 bg-primary/90 text-white rounded-lg hover:bg-primary transition-colors text-sm font-medium"
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Add Section Quiz
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowQuizBuilder((show) => !show)}
                        className="inline-flex items-center px-4 py-2 bg-primary/90 text-white rounded-lg hover:bg-primary transition-colors text-sm font-medium"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Quiz
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveQuiz}
                        className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Quiz
                      </button>
                    </div>
                  )}
                </div>

                {hasQuiz && !showQuizBuilder && (
                  <div className="bg-primary/5 dark:bg-yellow-900/20 border border-primary/20 dark:border-primary rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-primary dark:text-primary/20">
                          {section?.quiz?.title}
                        </h4>
                        <p className="text-sm text-primary dark:text-primary-foreground">
                          {section.quiz?.questions?.length ?? 0} question
                          {(section.quiz?.questions?.length ?? 0) !== 1 ? 's' : ''} • Passing score:{' '}
                          {section.quiz?.passingScore}%
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowQuizBuilder(true)}
                        className="text-primary dark:text-primary-foreground hover:text-primary dark:hover:text-primary/20"
                        aria-label="Edit Quiz"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {showQuizBuilder && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <QuizBuilder
                        control={control}
                        controller={controller}
                        sectionIndex={sectionIndex}
                        quizError={quizError}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Section Settings */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Section Settings</h4>
                <label htmlFor={`is-published-${sectionIndex}`} className="flex items-start">
                  <Input
                    type="checkbox"
                    id={`is-published-${sectionIndex}`}
                    checked={section?.isPublished || false}
                    onChange={handleIsPublishedChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mt-0.5"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Published
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Make this section visible to students
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

SectionEditor.displayName = 'SectionEditor';
