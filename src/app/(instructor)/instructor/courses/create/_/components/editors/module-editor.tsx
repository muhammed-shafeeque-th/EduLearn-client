/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Sparkles,
} from 'lucide-react';
import { CurriculumFormData } from '../../schemas/curriculum-schema';
import { LessonEditor } from './lesson-editor';
import { QuizBuilder } from '../quiz/quiz-builder';
import { formatDuration } from '../../utils/curriculum-utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';

interface ModuleEditorProps {
  moduleIndex: number;
  courseId: string;
  onRemove: () => void;
  onMove: (direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  className?: string;
  isActive?: boolean;
  onToggleActive?: () => void;
}

export const ModuleEditor: React.FC<ModuleEditorProps> = ({
  moduleIndex,
  courseId,
  onRemove,
  onMove,
  canMoveUp,
  canMoveDown,
}) => {
  const {
    control,
    register,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<CurriculumFormData>();

  const {
    fields: lessons,
    append: appendLesson,
    remove: removeLesson,
    move: moveLesson,
  } = useFieldArray({
    control,
    name: `modules.${moduleIndex}.lessons`,
  });

  const moduleWatch = useWatch({
    control,
    name: `modules.${moduleIndex}`,
  });

  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const lessonsData = moduleWatch?.lessons || [];
  const totalDuration = lessonsData.reduce((sum: number, lesson: any) => {
    return sum + (lesson?.estimatedDuration || 0);
  }, 0);

  const totalContent = lessonsData.reduce(
    (sum: number, lesson: any) => sum + (lesson.content ? 1 : 0),
    0
  );
  const lessonCount = lessonsData.length;
  const hasQuiz = !!moduleWatch?.quiz;

  const moduleError: any = errors.modules?.[moduleIndex];
  const titleError = moduleError?.title?.message;
  const descriptionError = moduleError?.description?.message;
  const lessonsError = moduleError?.lessons;

  const handleAddLesson = useCallback(() => {
    appendLesson({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: `Lesson ${lessonCount + 1}`,
      description: '',
      content: undefined,
      estimatedDuration: 0,
      isPublished: true,
      order: lessonCount,
    } as any);
  }, [appendLesson, lessonCount]);

  const handleRemoveQuiz = useCallback(() => {
    setValue(`modules.${moduleIndex}.quiz`, undefined as any);
    setShowQuizBuilder(false);
  }, [moduleIndex, setValue]);

  return (
    <div
      className={`group/module bg-card border rounded-xl overflow-hidden transition-all duration-300 ${
        isExpanded ? 'shadow-md border-primary/20 ring-1 ring-primary/5' : 'shadow-sm border-border'
      } ${titleError || descriptionError ? 'border-destructive/50' : 'hover:border-primary/20'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Premium Module Header */}
      <div
        className={`px-8 py-6 transition-colors ${
          isExpanded
            ? 'bg-linear-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800'
            : 'bg-white dark:bg-gray-800'
        }`}
      >
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center flex-1 min-w-0 gap-4">
            {/* Module Number Badge */}
            <div
              className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-semibold transition-all duration-300 ${
                isExpanded
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {String(moduleIndex + 1).padStart(2, '0')}
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-1 text-left min-w-0 group/title"
            >
              {isEditing ? (
                <div
                  className="space-y-4 py-2"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsEditing(false);
                  }}
                  role="presentation"
                >
                  <div className="relative">
                    <Input
                      type="text"
                      {...register(`modules.${moduleIndex}.title`)}
                      onChange={(e) => {
                        register(`modules.${moduleIndex}.title`).onChange(e);
                        trigger(`modules.${moduleIndex}.title`);
                      }}
                      className={`text-lg font-semibold h-11 bg-background border border-border focus-visible:ring-primary ${
                        titleError ? 'border-destructive' : ''
                      }`}
                      onBlur={() => setIsEditing(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setIsEditing(false);
                        if (e.key === 'Escape') setIsEditing(false);
                      }}
                    />
                    {titleError && (
                      <p className="text-xs text-destructive font-semibold mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {titleError}
                      </p>
                    )}
                  </div>
                  <Textarea
                    {...register(`modules.${moduleIndex}.description`)}
                    rows={2}
                    placeholder="Add a brief description of what this module covers..."
                    className="bg-white dark:bg-gray-900 resize-none rounded-xl"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white truncate decoration-primary/30 group-hover/title:underline underline-offset-4">
                      {moduleWatch?.title || 'Untitled Module'}
                    </h2>
                    {hasQuiz && (
                      <Badge
                        variant="outline"
                        className="bg-amber-50 dark:bg-amber-900/10 text-amber-600 border-amber-200 dark:border-amber-800 text-[10px] font-black uppercase tracking-tighter"
                      >
                        <Sparkles className="w-3 h-3 mr-1" /> Quiz
                      </Badge>
                    )}
                  </div>

                  {isExpanded && moduleWatch?.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 max-w-2xl">
                      {moduleWatch?.description}
                    </p>
                  )}

                  {!isExpanded && (
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> {lessonCount} Lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDuration(totalDuration)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 10 }}
                  className="flex items-center gap-1 bg-background/80 backdrop-blur-xs p-1 rounded-lg border border-border shadow-xs"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(!isEditing)}
                    className="h-9 w-9 rounded-lg hover:bg-white dark:hover:bg-gray-700 shadow-sm border border-transparent hover:border-gray-200"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </Button>
                  <div className="flex flex-col gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!canMoveUp}
                      onClick={() => onMove('up')}
                      className="h-5 w-8 rounded-t-md hover:bg-primary/10 hover:text-primary disabled:opacity-30"
                    >
                      <ChevronDown className="w-3 h-3 rotate-180" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!canMoveDown}
                      onClick={() => onMove('down')}
                      className="h-5 w-8 rounded-b-md hover:bg-primary/10 hover:text-primary disabled:opacity-30"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                    className="h-9 w-9 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500/70 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1" />
                  <div className="p-2 cursor-grab active:cursor-grabbing text-gray-400">
                    <GripVertical className="w-5 h-5" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`h-10 w-10 rounded-full transition-all duration-300 ${isExpanded ? 'bg-primary/10 text-primary rotate-0' : 'rotate-0'}`}
            >
              {isExpanded ? (
                <ChevronDown className="w-6 h-6" />
              ) : (
                <ChevronRight className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Module Errors */}
        {!isExpanded && (titleError || descriptionError) && (
          <div className="mt-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/10 p-2 px-3 rounded-xl border border-red-100 dark:border-red-900/20">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-red-600 dark:text-red-400">
              This module has validation errors. Expand to fix.
            </span>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-8 pb-8 space-y-10">
              {/* Lessons Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PlayCircle className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      Lessons <span className="text-gray-400 ml-1">({lessonCount})</span>
                    </h3>
                  </div>
                  <Button
                    onClick={handleAddLesson}
                    variant="outline"
                    className="rounded-xl h-10 border-primary/20 text-primary hover:bg-primary/10 hover:border-primary transition-all font-bold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lesson
                  </Button>
                </div>

                {lessons.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50/50 dark:bg-gray-900/20 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl group/empty">
                    <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3 group-hover/empty:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      No lessons here yet.
                    </p>
                    <button
                      onClick={handleAddLesson}
                      className="text-primary text-xs font-bold mt-2 hover:underline"
                    >
                      Create your first lesson →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 relative">
                    {lessons.map((lesson, index) => (
                      <LessonEditor
                        key={lesson.id}
                        lessonIndex={index}
                        moduleIndex={moduleIndex}
                        courseId={courseId}
                        onRemove={() => removeLesson(index)}
                        onMove={(direction) =>
                          moveLesson(index, direction === 'up' ? index - 1 : index + 1)
                        }
                        canMoveUp={index > 0}
                        canMoveDown={index < lessons.length - 1}
                        lessonError={lessonsError?.[index]}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Assessments Module */}
              <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      Assessment Quiz
                    </h3>
                  </div>

                  {!hasQuiz ? (
                    <Button
                      onClick={() => {
                        const newQuiz = {
                          id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                          title: '',
                          questions: [],
                          passingScore: 70,
                          maxAttempts: 3,
                          timeLimit: 60,
                          randomizeQuestions: false,
                          showResults: true,
                          isRequired: false,
                        };
                        setValue(`modules.${moduleIndex}.quiz`, newQuiz as any);
                        setShowQuizBuilder(true);
                      }}
                      variant="outline"
                      className="rounded-xl border-amber-200/50 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 font-bold"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Quiz
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowQuizBuilder(!showQuizBuilder)}
                        className="rounded-lg text-amber-600 hover:bg-amber-50"
                      >
                        {showQuizBuilder ? 'Hide Builder' : 'Customize Quiz'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveQuiz}
                        className="rounded-lg text-red-500 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>

                {hasQuiz && !showQuizBuilder && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-6 rounded-3xl flex items-center justify-between group/quiz"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-2xl">
                        <HelpCircle className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-black text-amber-900 dark:text-amber-200">
                          {moduleWatch?.quiz?.title || 'Untitled Quiz'}
                        </h4>
                        <p className="text-xs font-bold text-amber-700/60 dark:text-amber-400/60 flex items-center gap-2">
                          <span>{moduleWatch?.quiz?.questions?.length || 0} Questions</span>
                          <span className="w-1 h-1 bg-amber-300 rounded-full" />
                          <span>Passing Score: {moduleWatch?.quiz?.passingScore || 70}%</span>
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowQuizBuilder(true)}
                      className="rounded-xl opacity-0 group-hover/quiz:opacity-100 transition-opacity"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}

                <AnimatePresence>
                  {showQuizBuilder && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-muted/30 rounded-xl border border-amber-200/50 dark:border-amber-900/30 p-2"
                    >
                      <QuizBuilder moduleIndex={moduleIndex} courseId={courseId} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Module Settings Footer */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <Switch
                      id={`publish-${moduleIndex}`}
                      checked={moduleWatch?.isPublished ?? true}
                      onCheckedChange={(val) => setValue(`modules.${moduleIndex}.isPublished`, val)}
                    />
                    <Label
                      htmlFor={`publish-${moduleIndex}`}
                      className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                      Module is Public
                    </Label>
                  </div>

                  <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 hidden md:block" />

                  <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">
                    Last Updated: Recently
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs font-black text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <PlayCircle className="w-4 h-4 text-primary/50" /> {totalContent} Assets
                  </span>
                  <span className="w-1 h-1 bg-gray-200 rounded-full" />
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-500/50" />{' '}
                    {formatDuration(totalDuration)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
