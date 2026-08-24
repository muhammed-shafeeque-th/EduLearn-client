/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  HelpCircle,
  Trash2,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { generateId } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';

interface QuizBuilderProps {
  moduleIndex: number;
  courseId: string;
  className?: string;
}

export const QuizBuilder: React.FC<QuizBuilderProps> = React.memo(
  ({ moduleIndex, className = '' }) => {
    const {
      control,
      register,
      formState: { errors },
    } = useFormContext();

    const quizPath = `modules.${moduleIndex}.quiz`;

    const {
      fields: questions,
      append: appendQuestion,
      remove: removeQuestion,
      move: moveQuestion,
    } = useFieldArray({
      control,
      name: `${quizPath}.questions`,
    });

    const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

    // Focus error extraction to only relevant parts
    const moduleErrors = (errors.modules as any)?.[moduleIndex];
    const quizError = moduleErrors?.quiz;

    const titleError = quizError?.title?.message;
    const descriptionError = quizError?.description?.message;
    const questionsError = quizError?.questions?.message;
    const passingScoreError = quizError?.passingScore?.message;
    const maxAttemptsError = quizError?.maxAttempts?.message;
    const timeLimitError = quizError?.timeLimit?.message;

    const handleAddQuestion = useCallback(() => {
      const newId = generateId();
      appendQuestion({
        id: newId,
        type: 'multiple-choice',
        question: '',
        options: [
          { id: generateId(), text: '', isCorrect: true },
          { id: generateId(), text: '', isCorrect: false },
        ],
        explanation: '',
        points: 1,
        timeLimit: 2,
        required: true,
      } as any);
      setActiveQuestion(newId);
    }, [appendQuestion]);

    const handleRemoveQuestionFromList = useCallback(
      (index: number) => {
        removeQuestion(index);
      },
      [removeQuestion]
    );

    const handleMoveQuestionInList = useCallback(
      (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        moveQuestion(index, newIndex);
      },
      [moveQuestion]
    );

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Quiz Settings */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-amber-600">
            <HelpCircle className="w-5 h-5" />
            <h3 className="text-lg font-semibold text-foreground">Quiz Settings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Quiz Title *
              </Label>
              <Input
                type="text"
                {...register(`${quizPath}.title`)}
                className={`h-11 ${titleError ? 'border-destructive' : 'border-border'}`}
                placeholder="Enter quiz title"
              />
              {titleError && (
                <p className="text-[10px] font-semibold text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {titleError}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  Passing Score (%)
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  {...register(`${quizPath}.passingScore`, { valueAsNumber: true })}
                  className={`h-11 ${passingScoreError ? 'border-destructive' : 'border-border'}`}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  Max Attempts
                </Label>
                <Input
                  type="number"
                  min="1"
                  {...register(`${quizPath}.maxAttempts`, { valueAsNumber: true })}
                  className={`h-11 ${maxAttemptsError ? 'border-destructive' : 'border-border'}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Time Limit (minutes)
              </Label>
              <Input
                type="number"
                min="0"
                {...register(`${quizPath}.timeLimit`, { valueAsNumber: true })}
                className={`h-11 ${timeLimitError ? 'border-destructive' : 'border-border'}`}
                placeholder="No limit"
              />
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 block">
                Options
              </Label>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`randomize-${moduleIndex}`}
                    {...register(`${quizPath}.randomizeQuestions`)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary shadow-sm"
                  />
                  <label
                    htmlFor={`randomize-${moduleIndex}`}
                    className="text-xs font-medium text-foreground/80 cursor-pointer"
                  >
                    Randomize
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`showResults-${moduleIndex}`}
                    {...register(`${quizPath}.showResults`)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary shadow-sm"
                  />
                  <label
                    htmlFor={`showResults-${moduleIndex}`}
                    className="text-xs font-medium text-foreground/80 cursor-pointer"
                  >
                    Show Results
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`requiredQuiz-${moduleIndex}`}
                    {...register(`${quizPath}.isRequired`)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary shadow-sm"
                  />
                  <label
                    htmlFor={`requiredQuiz-${moduleIndex}`}
                    className="text-xs font-medium text-foreground/80 cursor-pointer"
                  >
                    Required
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Description
            </Label>
            <Textarea
              {...register(`${quizPath}.description`)}
              rows={2}
              className={`resize-none bg-muted/20 border-border ${descriptionError ? 'border-destructive' : ''}`}
              placeholder="Add specific instructions for students..."
            />
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                Questions
                <span className="text-muted-foreground font-normal ml-2">({questions.length})</span>
              </h3>
              {questionsError && (
                <Badge
                  variant="destructive"
                  className="ml-2 text-[8px] font-black uppercase shadow-sm"
                >
                  {questionsError}
                </Badge>
              )}
            </div>
            <Button
              onClick={handleAddQuestion}
              size="sm"
              className="rounded-xl h-9 px-4 font-semibold shadow-md active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border shadow-inner">
              <div className="bg-muted p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-4">
                No questions added yet
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddQuestion}
                className="rounded-lg shadow-sm"
              >
                Add your first question
              </Button>
            </div>
          ) : (
            <div className="space-y-4 relative">
              <AnimatePresence mode="popLayout" initial={false}>
                {questions.map((question, index) => (
                  <QuestionEditor
                    key={question.id}
                    id={question.id}
                    index={index}
                    moduleIndex={moduleIndex}
                    isActive={activeQuestion === question.id}
                    onToggle={() =>
                      setActiveQuestion(activeQuestion === question.id ? null : question.id)
                    }
                    onRemove={() => handleRemoveQuestionFromList(index)}
                    onMove={(direction) => handleMoveQuestionInList(index, direction)}
                    canMoveUp={index > 0}
                    canMoveDown={index < questions.length - 1}
                    questionError={quizError?.questions?.[index]}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    );
  }
);

QuizBuilder.displayName = 'QuizBuilder';

// Question Editor Component
interface QuestionEditorProps {
  id: string;
  index: number;
  moduleIndex: number;
  isActive: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onMove: (direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  questionError?: any;
}

const QuestionEditor: React.FC<QuestionEditorProps> = React.memo(
  ({
    index,
    moduleIndex,
    isActive,
    onToggle,
    onRemove,
    onMove,
    canMoveUp,
    canMoveDown,
    questionError,
  }) => {
    const { control, register, getValues } = useFormContext();
    const questionPath = `modules.${moduleIndex}.quiz.questions.${index}`;

    // Target watches to minimize rerenders
    const questionTitle = useWatch({ control, name: `${questionPath}.question` });
    const points = useWatch({ control, name: `${questionPath}.points` });
    const type = useWatch({ control, name: `${questionPath}.type` });

    const {
      fields: options,
      append: appendOption,
      remove: removeOption,
      update: updateOption,
    } = useFieldArray({
      control,
      name: `${questionPath}.options`,
    });

    // Extract field-specific errors
    const questionTextError = questionError?.question?.message;
    const optionsError = questionError?.options?.message;
    const pointsError = questionError?.points?.message;

    const handleSetCorrectOption = useCallback(
      (optionIndex: number) => {
        const currentOption = getValues(`${questionPath}.options.${optionIndex}`);
        updateOption(optionIndex, { ...currentOption, isCorrect: !currentOption.isCorrect });
      },
      [getValues, questionPath, updateOption]
    );

    const handleAddOption = useCallback(() => {
      appendOption({ id: generateId(), text: '', isCorrect: options.length === 0 });
    }, [appendOption, options.length]);

    return (
      <motion.div
        layout
        className={`border rounded-xl overflow-hidden transition-all duration-200 ${
          isActive
            ? 'ring-2 ring-primary border-primary shadow-lg scale-[1.01]'
            : 'border-border bg-card shadow-sm hover:shadow-md'
        } ${questionTextError || optionsError ? 'border-destructive/50 ring-destructive/20' : ''}`}
      >
        {/* Question Header */}
        <div
          className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
            isActive ? 'bg-primary/5' : 'hover:bg-muted/30'
          }`}
          onClick={onToggle}
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold shrink-0 transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-md rotate-12 scale-110'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {index + 1}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-foreground truncate max-w-[400px]">
                {questionTitle || (
                  <span className="text-muted-foreground italic">Untitled Question</span>
                )}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/60 flex items-center bg-muted/50 px-1.5 py-0.5 rounded">
                  {type === 'multiple-choice' ? 'Multiple Choice' : type}
                </span>
                <span className="text-muted-foreground/30 text-[10px]">•</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded">
                  {points} {points === 1 ? 'Point' : 'Points'}
                </span>
                {(questionTextError || optionsError) && (
                  <Badge
                    variant="destructive"
                    className="h-4 px-1.5 text-[8px] font-black uppercase ml-1 animate-pulse"
                  >
                    Action Required
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-0.5 mr-2">
              <Button
                variant="ghost"
                size="icon"
                disabled={!canMoveUp}
                onClick={(e) => {
                  e.stopPropagation();
                  onMove('up');
                }}
                className="h-5 w-8 hover:text-primary hover:bg-primary/10 disabled:opacity-20"
              >
                <ArrowUp className="w-3 h-3 rotate-180" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={!canMoveDown}
                onClick={(e) => {
                  e.stopPropagation();
                  onMove('down');
                }}
                className="h-5 w-8 hover:text-primary hover:bg-primary/10 disabled:opacity-20"
              >
                <ArrowDown className="w-3 h-3" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="h-9 w-9 rounded-lg hover:bg-destructive/10 text-destructive/60 hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Question Content */}
        <AnimatePresence initial={false}>
          {isActive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="border-t border-border bg-linear-to-b from-white to-gray-50/50"
            >
              <div className="p-6 space-y-8">
                {/* Question Text */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
                    Question Text <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    {...register(`${questionPath}.question`)}
                    rows={2}
                    className={`bg-background border-border text-sm resize-none focus:ring-primary shadow-xs transition-all ${
                      questionTextError
                        ? 'border-destructive ring-1 ring-destructive/20'
                        : 'hover:border-primary/30'
                    }`}
                    placeholder="What is the capital of France?"
                  />
                  {questionTextError && (
                    <p className="text-[10px] font-bold text-destructive mt-1 flex items-center gap-1.5 p-1 bg-destructive/5 rounded">
                      <AlertCircle className="w-3 h-3" />
                      {questionTextError}
                    </p>
                  )}
                </div>

                {/* Options Section */}
                {type === 'multiple-choice' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
                        Answer Options{' '}
                        <span className="text-muted-foreground font-normal lowercase">
                          (Select at least one correct)
                        </span>
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAddOption}
                        className="h-8 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 hover:scale-105 transition-all"
                      >
                        <Plus className="w-3 h-3 mr-1.5" /> Add Option
                      </Button>
                    </div>

                    {optionsError && typeof optionsError === 'string' && (
                      <p className="text-[10px] font-bold text-destructive mb-3 flex items-center gap-1.5 p-1 bg-destructive/5 rounded">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {optionsError}
                      </p>
                    )}

                    <div className="grid grid-cols-1 gap-3">
                      {options.map((option: any, optIndex: number) => {
                        const optError = (questionError?.options as any)?.[optIndex];
                        return (
                          <motion.div
                            layout
                            key={option.id}
                            className="flex items-start gap-3 group/option"
                          >
                            <button
                              type="button"
                              onClick={() => handleSetCorrectOption(optIndex)}
                              className={`mt-2 shrink-0 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center shadow-xs ${
                                option.isCorrect
                                  ? 'bg-emerald-500 border-emerald-500 text-white scale-110 shadow-emerald-200'
                                  : 'border-border hover:border-emerald-300 bg-white'
                              }`}
                              title={option.isCorrect ? 'Correct Answer' : 'Mark as Correct'}
                            >
                              {option.isCorrect && <CheckCircle className="w-4 h-4" />}
                            </button>

                            <div className="flex-1 space-y-1">
                              <Input
                                type="text"
                                {...register(`${questionPath}.options.${optIndex}.text`)}
                                className={`h-10 text-sm bg-white shadow-xs transition-all ${
                                  optError?.text?.message
                                    ? 'border-destructive ring-1 ring-destructive/10'
                                    : 'hover:border-primary/30 border-border'
                                }`}
                                placeholder={`Option ${optIndex + 1}`}
                              />
                              {optError?.text?.message && (
                                <p className="text-[9px] font-bold text-destructive mt-1 flex items-center gap-1 pl-1">
                                  {optError.text.message}
                                </p>
                              )}
                            </div>

                            {options.length > 2 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeOption(optIndex)}
                                className="h-10 w-10 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/5 transition-all shrink-0 opacity-0 group-hover/option:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Advanced Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border/50">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                      Question Explanation
                    </Label>
                    <Textarea
                      {...register(`${questionPath}.explanation`)}
                      rows={2}
                      className="bg-white border-border text-sm resize-none focus:ring-primary shadow-xs hover:border-primary/30 transition-all"
                      placeholder="Provide context for why this is the correct answer..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1">
                        Points <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        {...register(`${questionPath}.points`, { valueAsNumber: true })}
                        className={`h-11 font-bold text-center ${pointsError ? 'border-destructive' : 'border-border'} shadow-xs`}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1">
                        Time (Sec) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        {...register(`${questionPath}.timeLimit`, { valueAsNumber: true })}
                        className={`h-11 font-bold text-center ${questionError?.timeLimit?.message ? 'border-destructive' : 'border-border'} shadow-xs`}
                      />
                    </div>

                    <div className="space-y-3 flex flex-col justify-end pb-1.5">
                      <div className="flex items-center space-x-2 bg-muted/30 h-11 px-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                        <input
                          type="checkbox"
                          id={`req-${index}-${moduleIndex}`}
                          {...register(`${questionPath}.required`)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary shadow-xs"
                        />
                        <label
                          htmlFor={`req-${index}-${moduleIndex}`}
                          className="text-[10px] font-black uppercase tracking-tight text-foreground/80 cursor-pointer"
                        >
                          Required
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

QuestionEditor.displayName = 'QuestionEditor';
