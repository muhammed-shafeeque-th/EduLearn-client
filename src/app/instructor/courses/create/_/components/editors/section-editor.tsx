/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useCallback, useState } from 'react';
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
import { Section, Lesson, CurriculumFormData } from '../../schemas/curriculum-schema';
import { LessonEditor } from './lesson-editor';
import { QuizBuilder } from '../quiz/quiz-builder';
import { formatDuration } from '../../utils/curriculum-utils';
import { Input } from '@/components/ui/input';
import { UseFormTrigger } from 'react-hook-form';

interface SectionEditorProps {
  section: Section;
  sectionIndex: number;
  courseId: string;
  onUpdate: (updates: Partial<Section>) => void;
  onRemove: () => void;
  onMove: (direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  className?: string;
  isActive?: boolean;
  onToggleActive?: () => void;
  sectionError?: any;
  triggerValidation: UseFormTrigger<CurriculumFormData>;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  sectionIndex,
  courseId,
  onUpdate,
  onRemove,
  onMove,
  canMoveUp,
  canMoveDown,
  sectionError,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const totalDuration = section.lessons.reduce((sum, lesson) => {
    const lessonDuration = lesson?.estimatedDuration || 0;
    return sum + lessonDuration;
  }, 0);

  const totalContent = section.lessons.reduce((sum, lesson) => sum + (lesson.content ? 1 : 0), 0);
  const lessonCount = section.lessons.length;
  const hasQuiz = !!section.quiz;

  const titleError = sectionError?.title?.message;
  const descriptionError = sectionError?.description?.message;
  const lessonsError = sectionError?.lessons;
  const quizError = sectionError?.quiz;

  const getLessonError = useCallback(
    (lessonIndex: number) => {
      return lessonsError?.[lessonIndex];
    },
    [lessonsError]
  );
  const handleAddLesson = useCallback(async () => {
    const newLesson: Lesson = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: `Lesson ${section.lessons.length + 1}`,
      description: '',
      content: undefined as any,
      estimatedDuration: 0,
      isPublished: true,
      order: section.lessons.length,
    };

    onUpdate({
      lessons: [...section.lessons, newLesson],
    });
  }, [onUpdate, sectionIndex, section.lessons]);

  const handleRemoveQuiz = useCallback(async () => {
    onUpdate({ quiz: undefined });
    setShowQuizBuilder(false);
  }, [onUpdate, sectionIndex]);

  const handleUpdateQuiz = useCallback(
    async (quiz: any) => {
      onUpdate({ quiz });
    },
    [onUpdate, sectionIndex]
  );

  const handleUpdateLesson = useCallback(
    async (lessonId: string, updates: Partial<Lesson>) => {
      const lessonIndex = section.lessons?.findIndex((l) => l.id === lessonId);
      if (lessonIndex === undefined || lessonIndex === -1) return;

      const updatedLessons = section.lessons?.map((l) =>
        l.id === lessonId ? { ...l, ...updates } : l
      );
      onUpdate({ lessons: updatedLessons });
    },
    [section.lessons, onUpdate, sectionIndex]
  );

  const handleRemoveLesson = useCallback(
    async (lessonId: string) => {
      onUpdate({
        lessons: section.lessons.filter((l) => l.id !== lessonId),
      });
    },
    [section.lessons, onUpdate, sectionIndex]
  );

  const handleMoveLesson = useCallback(
    (lessonId: string, direction: 'up' | 'down') => {
      const currentIndex = section.lessons.findIndex((l) => l.id === lessonId);
      if (currentIndex === -1) return;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= section.lessons.length) return;

      const newLessons = [...section.lessons];
      [newLessons[currentIndex], newLessons[newIndex]] = [
        newLessons[newIndex],
        newLessons[currentIndex],
      ];

      onUpdate({ lessons: newLessons });
    },
    [section.lessons, onUpdate]
  );

  return (
    <div
      className={`bg-white dark:bg-gray-800 border-2 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all ${
        titleError || descriptionError
          ? 'border-red-300 dark:border-red-700'
          : 'border-gray-200 dark:border-gray-700'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Section Header */}
      <div className="bg-linear-to-r from-primary/5 to-blue-50 dark:from-orange-900/30 dark:to-pink-900/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 bg-linear-to-br from-primary to-blue-500 text-white rounded-full text-lg font-bold mr-4">
              {sectionIndex + 1}
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors mr-3"
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
                  <Input
                    type="text"
                    value={section.title}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    className={`w-full text-lg font-bold ${
                      titleError ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                    onBlur={() => setIsEditing(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setIsEditing(false);
                      if (e.key === 'Escape') setIsEditing(false);
                    }}
                  />
                  {titleError && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {titleError}
                    </p>
                  )}
                  <textarea
                    value={section.description || ''}
                    onChange={(e) => onUpdate({ description: e.target.value })}
                    rows={2}
                    className={`w-full resize-none ${
                      descriptionError ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                    placeholder="Section description..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setIsEditing(false);
                      if (e.key === 'Escape') setIsEditing(false);
                    }}
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
                      {section.title}
                    </h2>
                    {titleError && (
                      <div>
                        <AlertCircle
                          className="w-4 h-4 text-red-500 ml-2 shrink-0"
                          aria-label={titleError}
                        />
                        {titleError}
                      </div>
                    )}
                  </div>
                  {section.description && (
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
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50"
                  title="Edit section"
                >
                  <Edit2 className="w-5 h-5" />
                </button>

                {canMoveUp && (
                  <button
                    onClick={() => onMove('up')}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50"
                    title="Move section up"
                  >
                    <ChevronDown className="w-5 h-5 rotate-180" />
                  </button>
                )}

                {canMoveDown && (
                  <button
                    onClick={() => onMove('down')}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50"
                    title="Move section down"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={onRemove}
                  className="p-2 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50"
                  title="Delete section"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="cursor-move p-2 text-gray-400">
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
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
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
                    onClick={handleAddLesson}
                    className="inline-flex items-center px-4 py-2 bg-primary/90 text-white rounded-lg hover:bg-primary transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lesson
                  </button>
                </div>

                {section.lessons.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No lessons in this section yet
                    </p>
                    <button
                      onClick={handleAddLesson}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Add your first lesson
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {section.lessons.map((lesson, index) => (
                      <LessonEditor
                        key={lesson.id}
                        lesson={lesson}
                        lessonIndex={index}
                        sectionIndex={sectionIndex}
                        courseId={courseId}
                        onUpdate={(updates) => handleUpdateLesson(lesson.id, updates)}
                        onRemove={() => handleRemoveLesson(lesson.id)}
                        onMove={(direction) => handleMoveLesson(lesson.id, direction)}
                        canMoveUp={index > 0}
                        canMoveDown={index < section.lessons.length - 1}
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
                      onClick={() => setShowQuizBuilder(true)}
                      className="inline-flex items-center px-4 py-2 bg-primary/90 text-white rounded-lg hover:bg-primary transition-colors text-sm font-medium"
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Add Section Quiz
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowQuizBuilder(!showQuizBuilder)}
                        className="inline-flex items-center px-4 py-2 bg-primary/90 text-white rounded-lg hover:bg-primary transition-colors text-sm font-medium"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Quiz
                      </button>
                      <button
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
                          {section.quiz!.title}
                        </h4>
                        <p className="text-sm text-primary dark:text-primary-foreground">
                          {section.quiz!.questions.length} question
                          {section.quiz!.questions.length !== 1 ? 's' : ''} • Passing score:{' '}
                          {section.quiz!.passingScore}%
                        </p>
                      </div>
                      <button
                        onClick={() => setShowQuizBuilder(true)}
                        className="text-primary dark:text-primary-foreground hover:text-primary dark:hover:text-primary/20"
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
                        quiz={
                          section.quiz || {
                            id: Date.now().toString(),
                            title: '',
                            description: '',
                            timeLimit: 0,
                            questions: [],
                            passingScore: 70,
                            maxAttempts: 3,
                            randomizeQuestions: false,
                            showResults: true,
                            isRequired: false,
                          }
                        }
                        onChange={handleUpdateQuiz}
                        quizError={quizError}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Section Settings */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Section Settings</h4>
                <label htmlFor="is-published" className="flex items-start">
                  <Input
                    type="checkbox"
                    id="is-published"
                    checked={section.isPublished}
                    onChange={(e) => onUpdate({ isPublished: e.target.checked })}
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
