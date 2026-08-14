'use client';

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
  Settings2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Lesson, Content } from '../../schemas/curriculum-schema';
import { ContentModal } from '../contents/content-modal';
import { formatDuration } from '../../utils/curriculum-utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useFormContext, useWatch } from 'react-hook-form';

interface LessonEditorProps {
  lessonIndex: number;
  moduleIndex: number;
  courseId: string;
  onRemove: () => void;
  onMove: (direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  lessonError?: {
    title?: { message: string };
    description?: { message: string };
    content?: { message: string };
    estimatedDuration?: { message: string };
  };
}

export const LessonEditor = ({
  lessonIndex,
  moduleIndex,
  courseId,
  onRemove,
  onMove,
  canMoveUp,
  canMoveDown,
  lessonError,
}: LessonEditorProps) => {
  const { control, register, setValue, trigger } = useFormContext();
  const lessonName = `modules.${moduleIndex}.lessons.${lessonIndex}`;
  const lesson = useWatch({ control, name: lessonName });

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
      hasContent: !!lesson?.content,
      duration: lesson?.estimatedDuration || 0,
      contentType: lesson?.content?.type,
    };
  }, [lesson?.content, lesson?.estimatedDuration]);

  const handleFieldUpdate = useCallback(
    (field: keyof Lesson, value: Lesson[keyof Lesson]) => {
      setValue(`${lessonName}.${field}`, value);
      trigger(`${lessonName}.${field}`);
    },
    [lessonName, setValue, trigger]
  );

  const handleAddContent = useCallback(
    (content: Omit<Content, 'id'>) => {
      const newContent: Content = {
        ...content,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      handleFieldUpdate('content', newContent);
      setShowContentModal(false);
    },
    [handleFieldUpdate]
  );

  const handleUpdateContent = useCallback(
    (updates: Partial<Content>) => {
      if (!lesson?.content) return;
      handleFieldUpdate('content', { ...lesson.content, ...updates });
    },
    [lesson?.content, handleFieldUpdate]
  );

  const handleDeleteContent = useCallback(() => {
    handleFieldUpdate('content', undefined);
  }, [handleFieldUpdate]);

  return (
    <div
      className={`group/lesson bg-card border rounded-xl overflow-hidden transition-all duration-200 ${
        isExpanded ? 'shadow-md border-border' : 'hover:border-primary/20 border-border'
      } ${titleError || contentError ? 'border-destructive/50 bg-destructive/5' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Lesson Header */}
      <div
        className={`flex items-center p-4 transition-colors ${isExpanded ? 'bg-muted/30 border-b border-border' : ''}`}
      >
        <div className="flex items-center flex-1 min-w-0 gap-4">
          <div className="flex items-center justify-center w-8 h-8 bg-muted text-muted-foreground rounded-lg text-xs font-semibold shadow-inner shrink-0 group-hover/lesson:bg-primary group-hover/lesson:text-primary-foreground transition-colors">
            {lessonIndex + 1}
          </div>

          <button onClick={() => setIsExpanded(!isExpanded)} className="flex-1 text-left min-w-0">
            {isEditing ? (
              <div
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsEditing(false);
                }}
                role="presentation"
                className="py-1"
              >
                <Input
                  {...register(`${lessonName}.title`)}
                  onChange={(e) => {
                    register(`${lessonName}.title`).onChange(e);
                    trigger(`${lessonName}.title`);
                  }}
                  className={`h-10 text-sm font-semibold bg-background ${
                    titleError ? 'border-destructive' : 'border-border'
                  }`}
                  onBlur={() => setIsEditing(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditing(false);
                    if (e.key === 'Escape') setIsEditing(false);
                  }}
                />
                {titleError && (
                  <p className="text-[10px] font-semibold text-destructive mt-1">{titleError}</p>
                )}
              </div>
            ) : (
              <div className="group/title">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground truncate group-hover/title:text-primary transition-colors">
                    {lesson?.title || 'Untitled Lesson'}
                  </h4>
                  {!lesson?.isPublished && (
                    <Badge
                      variant="outline"
                      className="text-[8px] font-black uppercase tracking-tighter h-4 border-gray-200"
                    >
                      Draft
                    </Badge>
                  )}
                </div>
                <div className="flex items-center mt-0.5 gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {stats.hasContent ? (
                    <span className="flex items-center gap-1 text-primary/70">
                      <PlayCircle className="w-3 h-3" />
                      {stats.contentType} • {formatDuration(stats.duration)}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-500/70">
                      <AlertCircle className="w-3 h-3" />
                      MISSING CONTENT
                    </span>
                  )}
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Lesson Actions */}
        <div className="flex items-center gap-1 ml-4 shrink-0">
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-0.5 mr-2"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 hover:bg-white dark:hover:bg-gray-700"
                >
                  <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                </Button>

                <div className="flex flex-col gap-0.5 mx-1">
                  <button
                    disabled={!canMoveUp}
                    onClick={() => onMove('up')}
                    className="p-1 hover:text-primary disabled:opacity-20 transition-colors"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    disabled={!canMoveDown}
                    onClick={() => onMove('down')}
                    className="p-1 hover:text-primary disabled:opacity-20 transition-colors"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRemove}
                  className="h-8 w-8 hover:bg-red-50 text-red-400/60 hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`h-10 w-10 rounded-xl transition-all ${isExpanded ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </Button>
        </div>
      </div>

      {/* Lesson Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 dark:border-gray-700 bg-linear-to-b from-white to-gray-50/30 dark:from-gray-800 dark:to-gray-900/10"
          >
            <div className="p-6 space-y-8">
              {/* Content Picker Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="w-4 h-4 text-primary" />
                    <h5 className="text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-wide">
                      Lesson Content
                    </h5>
                  </div>
                  {contentError && (
                    <Badge variant="destructive" className="text-[8px] font-black">
                      {contentError}
                    </Badge>
                  )}
                </div>

                {stats.hasContent ? (
                  <div className="bg-white dark:bg-gray-900 border-2 border-primary/10 dark:border-primary/5 rounded-2xl p-5 shadow-sm group/card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          {lesson?.content?.type === 'video' ? (
                            <PlayCircle className="w-6 h-6 text-primary" />
                          ) : (
                            <FileText className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <h6 className="font-bold text-gray-900 dark:text-white line-clamp-1">
                            {lesson?.content?.file?.name ||
                              lesson?.content?.url ||
                              'Knowledge Asset'}
                          </h6>
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-0.5">
                            {lesson?.content?.type} resource • Verified
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowContentModal(true)}
                          className="rounded-lg h-9 w-9 border border-gray-100 hover:bg-gray-50"
                        >
                          <Edit2 className="w-4 h-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleDeleteContent}
                          className="rounded-lg h-9 w-9 border border-gray-100 hover:bg-red-50 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowContentModal(true)}
                    className={`w-full py-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${
                      contentError
                        ? 'border-red-300 bg-red-50/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/40 hover:bg-primary/5'
                    }`}
                  >
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-3">
                      <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-sm font-black text-gray-800 dark:text-gray-200 tracking-tight">
                      Add Visual or Text Content
                    </span>
                    <p className="text-[10px] font-bold text-gray-400 mt-1">
                      Videos, PDFs, or external links supported
                    </p>
                  </button>
                )}
              </div>

              {/* Description & Settings Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Description
                  </Label>
                  <Textarea
                    {...register(`${lessonName}.description`)}
                    rows={3}
                    className="bg-white dark:bg-gray-900 rounded-xl resize-none text-sm p-3 min-h-[100px]"
                    placeholder="Briefly explain what students will learn in this lesson..."
                  />
                  {descriptionError && (
                    <p className="text-[10px] text-red-500 font-bold">{descriptionError}</p>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Duration
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        {...register(`${lessonName}.estimatedDuration`, { valueAsNumber: true })}
                        className="h-10 pl-9 rounded-xl text-sm font-bold"
                        placeholder="Minutes"
                      />
                      <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <span className="absolute right-3 top-3 text-[10px] font-black text-gray-400">
                        MINS
                      </span>
                    </div>
                    {estimatedDurationError && (
                      <p className="text-[10px] text-red-500 font-bold italic">
                        {estimatedDurationError}
                      </p>
                    )}
                  </div>

                  <div className="bg-white/50 dark:bg-gray-900/50 p-4 rounded-2xl ring-1 ring-gray-100 dark:ring-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl">
                          <Settings2 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h6 className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">
                            Visibility
                          </h6>
                          <p className="text-[10px] text-gray-400 font-bold">
                            Visible to students?
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={lesson?.isPublished ?? true}
                        onCheckedChange={(val) => handleFieldUpdate('isPublished', val)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Modal component remains connected */}
      <ContentModal
        isOpen={showContentModal}
        onClose={() => setShowContentModal(false)}
        onAdd={
          lesson?.content
            ? (updates) => handleUpdateContent(updates as Partial<Content>)
            : handleAddContent
        }
        existingContent={lesson?.content}
        courseId={courseId}
      />
    </div>
  );
};

LessonEditor.displayName = 'LessonEditor';
