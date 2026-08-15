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

interface ModuleEditorProps {
  control: Control<CurriculumFormData>;
  moduleIndex: number;
  courseId: string;
  controller: CourseControllerAPI;
  canMoveUp: boolean;
  canMoveDown: boolean;
  className?: string;
  isActive?: boolean;
  onToggleActive?: () => void;
  moduleError?: any;
}

export const ModuleEditor: React.FC<ModuleEditorProps> = ({
  control,
  courseId,
  moduleIndex,
  controller,
  canMoveUp,
  canMoveDown,
  isActive = false,
  moduleError,
}) => {
  // State
  const [isExpanded, setIsExpanded] = useState<boolean>(isActive);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showQuizBuilder, setShowQuizBuilder] = useState<boolean>(false);
  const [showActions, setShowActions] = useState<boolean>(false);

  // Module data
  const $module = useWatch({
    control,
    name: `modules.${moduleIndex}`,
  });

  // Memoized derived values
  const totalDuration = useMemo(
    () =>
      $module?.lessons?.reduce(
        (sum: number, lesson: any) => sum + (lesson?.estimatedDuration || 0),
        0
      ),
    [$module?.lessons]
  );
  const totalContent = useMemo(
    () =>
      $module?.lessons?.reduce((sum: number, lesson: any) => sum + (lesson?.content ? 1 : 0), 0),
    [$module?.lessons]
  );
  const lessonCount = $module?.lessons?.length || 0;
  const hasQuiz = Boolean($module?.quiz);

  // Form errors
  const titleError = moduleError?.title?.message;
  const descriptionError = moduleError?.description?.message;
  const lessonsError = moduleError?.lessons;
  const quizError = moduleError?.quiz;

  // Memoized lesson error fetcher
  const getLessonError = useCallback(
    (lessonIndex: number) => lessonsError?.[lessonIndex],
    [lessonsError]
  );

  // Local handlers
  const handleTitleChange = useCallback(
    (value: string) => {
      controller.updateModuleField(moduleIndex, 'title', value);
    },
    [controller, moduleIndex]
  );

  const handleDescriptionChange = useCallback(
    (value: string) => {
      controller.updateModuleField(moduleIndex, 'description', value);
    },
    [controller, moduleIndex]
  );

  const handleIsPublishedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      controller.updateModuleField(moduleIndex, 'isPublished', e.target.checked);
    },
    [controller, moduleIndex]
  );

  // const handleUpdateModule = useCallback(
  //   <T extends keyof Module>(field: T, value: Module[T]) => {
  //     controller.updateModuleField(moduleIndex, field, value);
  //   },
  //   [controller, moduleIndex]
  // );

  const handleAddLesson = useCallback(() => {
    const lessonLen = $module?.lessons?.length ?? 0;
    const newLesson = controller.createLesson(moduleIndex, {
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
  }, [controller, moduleIndex, $module?.lessons?.length]);

  const handleRemoveModule = useCallback(() => {
    if (
      window.confirm(
        `Delete "${$module?.title}"? This will remove all ${$module?.lessons?.length ?? 0} lessons and cannot be undone.`
      )
    ) {
      controller.deleteModule(moduleIndex);
    }
  }, [controller, moduleIndex, $module?.title, $module?.lessons?.length]);

  const handleMoveModule = useCallback(
    (direction: 'up' | 'down') => {
      const newOrder = direction === 'up' ? moduleIndex - 1 : moduleIndex + 1;
      controller.reorderModules(moduleIndex, newOrder);
    },
    [controller, moduleIndex]
  );

  const handleRemoveQuiz = useCallback(() => {
    if (!$module?.quiz) return;
    if (window.confirm(`Delete quiz "${$module.quiz.title}"? This cannot be undone.`)) {
      controller.deleteQuiz(moduleIndex, $module.quiz.id);
      setShowQuizBuilder(false);
    }
  }, [controller, moduleIndex, $module?.quiz]);

  const handleCreateQuiz = useCallback(() => {
    controller.createQuiz(moduleIndex, {
      title: `${$module?.title || 'Module'} Quiz`,
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
  }, [controller, moduleIndex, $module?.title]);

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
      {/* Module Header */}
      <div className="bg-gradient-to-r from-primary/5 to-blue-50 dark:from-orange-900/30 dark:to-pink-900/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-blue-500 text-white rounded-full text-lg font-bold mr-4">
              {moduleIndex + 1}
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded((expanded) => !expanded)}
              className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors mr-3"
              aria-label={isExpanded ? 'Collapse module' : 'Expand module'}
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
                    value={$module?.title ?? ''}
                    onSave={handleTitleChange}
                    className={`w-full text-lg font-bold ${titleError ? 'border-red-500 focus:ring-red-500' : ''}`}
                    onBlur={() => setIsEditing(false)}
                    onKeyDown={handleEditKeyDown}
                    aria-label="Module title"
                    // autoFocus
                  />
                  {titleError && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {titleError}
                    </p>
                  )}
                  <BlurTextarea
                    value={$module?.description || ''}
                    onSave={handleDescriptionChange}
                    rows={2}
                    className={`w-full resize-none ${descriptionError ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Module description..."
                    onKeyDown={handleEditKeyDown}
                    aria-label="Module description"
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
                      {$module?.title}
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
                  {!!$module?.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {$module.description}
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
          {/* Module Actions */}
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
                  title="Edit $module"
                  aria-label="Edit module"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                {canMoveUp && (
                  <button
                    type="button"
                    onClick={() => handleMoveModule('up')}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50"
                    title="Move module up"
                    aria-label="Move module up"
                  >
                    <ChevronDown className="w-5 h-5 rotate-180" />
                  </button>
                )}
                {canMoveDown && (
                  <button
                    type="button"
                    onClick={() => handleMoveModule('down')}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50"
                    title="Move module down"
                    aria-label="Move module down"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleRemoveModule}
                  className="p-2 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50"
                  title="Delete module"
                  aria-label="Delete module"
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
        {/* Module-level error message */}
        {(titleError || descriptionError) && !isEditing && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              Please fix the errors in this module before continuing
            </p>
          </div>
        )}
      </div>

      {/* Module Content */}
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
                      No lessons in this module yet
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
                    {$module?.lessons?.map?.((lesson: any, index: number) => (
                      <LessonEditor
                        key={lesson.id}
                        controller={controller}
                        courseId={courseId}
                        moduleIndex={moduleIndex}
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

              {/* Module Quiz */}
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
                      Add Module Quiz
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
                          {$module?.quiz?.title}
                        </h4>
                        <p className="text-sm text-primary dark:text-primary-foreground">
                          {$module.quiz?.questions?.length ?? 0} question
                          {($module.quiz?.questions?.length ?? 0) !== 1 ? 's' : ''} • Passing score:{' '}
                          {$module.quiz?.passingScore}%
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
                        moduleIndex={moduleIndex}
                        quizError={quizError}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Module Settings */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Module Settings</h4>
                <label htmlFor={`is-published-${moduleIndex}`} className="flex items-start">
                  <Input
                    type="checkbox"
                    id={`is-published-${moduleIndex}`}
                    checked={$module?.isPublished || false}
                    onChange={handleIsPublishedChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mt-0.5"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Published
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Make this module visible to students
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

ModuleEditor.displayName = 'ModuleEditor';
