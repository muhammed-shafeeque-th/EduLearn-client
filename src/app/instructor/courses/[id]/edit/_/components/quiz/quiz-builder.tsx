/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, AlertCircle, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';

import type { CurriculumFormData, Quiz, QuizQuestion } from '../../schemas/curriculum-schema';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { generateId } from '@/lib/utils';
import type { Control } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import type { CourseControllerAPI } from '../../hooks/use-course-controller';
import { BlurInput } from '../ui/blur-inputs';
import { BlurTextarea } from '../ui/blur-text-area';

// Quiz field error type for consistent error messaging
interface QuizFieldError {
  message?: string;
  [key: string]: any;
}

interface QuizError {
  title?: QuizFieldError;
  description?: QuizFieldError;
  questions?: QuizFieldError[] | QuizFieldError;
  passingScore?: QuizFieldError;
  maxAttempts?: QuizFieldError;
  timeLimit?: QuizFieldError;
}

interface QuizBuilderProps {
  control: Control<CurriculumFormData>;
  sectionIndex: number;
  controller: CourseControllerAPI;
  quizError?: QuizError;
  className?: string;
}

// DRY helper for error messages
function getErrorMessage(err: QuizFieldError | any) {
  return typeof err === 'string' ? err : err?.message || '';
}

export const QuizBuilder: React.FC<QuizBuilderProps> = ({
  control,
  sectionIndex,
  controller,
  quizError,
  className = '',
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const section = useWatch({
    control,
    name: `sections.${sectionIndex}`,
  });

  // Always use a stable, default quiz object for new quizzes
  const quiz: Quiz = useMemo(
    () =>
      section.quiz || {
        id: generateId(),
        title: '',
        description: '',
        timeLimit: 0,
        questions: [],
        passingScore: 70,
        maxAttempts: 3,
        randomizeQuestions: false,
        showResults: true,
        isRequired: false,
      },
    [section.quiz]
  );

  // De-structure errors for easy referencing
  const {
    title: titleError,
    description: descriptionError,
    questions: questionsErrorField,
    passingScore: passingScoreError,
    maxAttempts: maxAttemptsError,
    timeLimit: timeLimitError,
  } = quizError || {};

  // Quiz field update handler following best practices
  const handleUpdateQuizField = useCallback(
    <K extends keyof Quiz>(field: K, value: Quiz[K]) => {
      if (!quiz?.id) return;
      controller.updateQuizField(sectionIndex, quiz.id, field, value);
    },
    [controller, sectionIndex, quiz]
  );

  // Unused features removed: add/deleteQuiz (Quiz always present for editing UX)
  // Cleaner question update function
  const handleQuizQuestionsUpdate = useCallback(
    (updatedQuestions: QuizQuestion[]) => {
      if (!quiz?.id) return;
      controller.updateQuizField(sectionIndex, quiz.id, 'questions', updatedQuestions);
    },
    [controller, sectionIndex, quiz]
  );

  // Add question: uses minimal correct structure and always expands it for edit
  const handleAddQuestion = useCallback(() => {
    const newQuestion: QuizQuestion = {
      id: generateId(),
      type: 'multiple-choice',
      question: '',
      options: [
        { id: generateId(), text: '', isCorrect: true },
        { id: generateId(), text: '', isCorrect: false },
        { id: generateId(), text: '', isCorrect: false },
        { id: generateId(), text: '', isCorrect: false },
      ],
      explanation: '',
      points: 1,
      timeLimit: 0,
      required: true,
    };
    handleQuizQuestionsUpdate([...(quiz.questions || []), newQuestion]);
    setExpandedQuestions((prev) => {
      const set = new Set(prev);
      set.add(newQuestion.id!);
      return set;
    });
  }, [quiz.questions, handleQuizQuestionsUpdate]);

  // Update individual question
  const handleUpdateQuestion = useCallback(
    (questionId: string, updates: Partial<QuizQuestion>) => {
      const updatedQuestions = quiz.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      );
      handleQuizQuestionsUpdate(updatedQuestions);
    },
    [quiz.questions, handleQuizQuestionsUpdate]
  );

  // Remove question and close its expand state
  const handleRemoveQuestion = useCallback(
    (questionId: string) => {
      const updatedQuestions = quiz.questions.filter((q) => q.id !== questionId);
      handleQuizQuestionsUpdate(updatedQuestions);
      setExpandedQuestions((prev) => {
        const set = new Set(prev);
        set.delete(questionId);
        return set;
      });
    },
    [quiz.questions, handleQuizQuestionsUpdate]
  );

  // Expand/collapse helpers
  const toggleQuestionExpanded = useCallback((questionId: string) => {
    setExpandedQuestions((prev) => {
      const set = new Set(prev);
      if (set.has(questionId)) {
        set.delete(questionId);
      } else {
        set.add(questionId);
      }
      return set;
    });
  }, []);

  // Error for a specific question in the questions array
  const getQuestionError = useCallback(
    (index: number) =>
      Array.isArray(questionsErrorField) ? questionsErrorField[index] : undefined,
    [questionsErrorField]
  );

  return (
    <div
      className={`space-y-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      {/* Quiz Info Fields */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quiz Configuration
        </h3>
        {/* Quiz Title */}
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quiz Title *
          </Label>
          <BlurInput
            type="text"
            value={quiz.title}
            onSave={(val) => handleUpdateQuizField('title', val)}
            className={`w-full${getErrorMessage(titleError) ? ' border-red-500 focus:ring-red-500' : ''}`}
            placeholder="Enter quiz title"
            aria-invalid={!!getErrorMessage(titleError)}
            autoComplete="off"
          />
          {getErrorMessage(titleError) && (
            <InlineFieldError message={getErrorMessage(titleError)} />
          )}
        </div>
        {/* Quiz Description */}
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </Label>
          <BlurTextarea
            value={quiz.description || ''}
            onSave={(val) => handleUpdateQuizField('description', val)}
            rows={3}
            className={`w-full resize-none${getErrorMessage(descriptionError) ? ' border-red-500 focus:ring-red-500' : ''}`}
            placeholder="Optional quiz description"
            aria-invalid={!!getErrorMessage(descriptionError)}
            autoComplete="off"
          />
          {getErrorMessage(descriptionError) && (
            <InlineFieldError message={getErrorMessage(descriptionError)} />
          )}
        </div>
        {/* Quiz Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Passing Score (%) *
            </Label>
            <BlurInput
              type="number"
              min="0"
              max="100"
              value={quiz.passingScore}
              onSave={(val) => handleUpdateQuizField('passingScore', Number(val))}
              className={`w-full${getErrorMessage(passingScoreError) ? ' border-red-500 focus:ring-red-500' : ''}`}
              aria-invalid={!!getErrorMessage(passingScoreError)}
              autoComplete="off"
            />
            {getErrorMessage(passingScoreError) && (
              <InlineFieldError message={getErrorMessage(passingScoreError)} />
            )}
          </div>
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Attempts
            </Label>
            <BlurInput
              type="number"
              min="1"
              value={quiz.maxAttempts}
              onSave={(val) => handleUpdateQuizField('maxAttempts', Number(val))}
              className={`w-full${getErrorMessage(maxAttemptsError) ? ' border-red-500 focus:ring-red-500' : ''}`}
              aria-invalid={!!getErrorMessage(maxAttemptsError)}
              autoComplete="off"
            />
            {getErrorMessage(maxAttemptsError) && (
              <InlineFieldError message={getErrorMessage(maxAttemptsError)} />
            )}
          </div>
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Limit (minutes)
            </Label>
            <BlurInput
              type="number"
              min="0"
              value={quiz.timeLimit || ''}
              onSave={(val) => handleUpdateQuizField('timeLimit', Number(val))}
              className={`w-full${getErrorMessage(timeLimitError) ? ' border-red-500 focus:ring-red-500' : ''}`}
              placeholder="No limit"
              aria-invalid={!!getErrorMessage(timeLimitError)}
              autoComplete="off"
            />
            {getErrorMessage(timeLimitError) && (
              <InlineFieldError message={getErrorMessage(timeLimitError)} />
            )}
          </div>
        </div>
        <div className="space-y-3 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Label className="flex items-center cursor-pointer">
            <Input
              type="checkbox"
              checked={!!quiz.randomizeQuestions}
              onChange={(e) => handleUpdateQuizField('randomizeQuestions', e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              aria-label="Randomize question order"
            />
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Randomize question order
            </span>
          </Label>
          <Label className="flex items-center cursor-pointer">
            <Input
              type="checkbox"
              checked={quiz.showResults !== false}
              onChange={(e) => handleUpdateQuizField('showResults', e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              aria-label="Show results after completion"
            />
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Show results after completion
            </span>
          </Label>
          <Label className="flex items-center cursor-pointer">
            <Input
              type="checkbox"
              checked={!!quiz.isRequired}
              onChange={(e) => handleUpdateQuizField('isRequired', e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              aria-label="Required to complete section"
            />
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Required to complete section
            </span>
          </Label>
        </div>
      </div>
      {/* Questions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-white">
              Questions ({quiz.questions.length})
            </h4>
            {getErrorMessage(questionsErrorField) && (
              <InlineFieldError message={getErrorMessage(questionsErrorField)} />
            )}
          </div>
          <button
            type="button"
            onClick={handleAddQuestion}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </button>
        </div>
        {quiz.questions.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">No questions added yet</p>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Add your first question
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {quiz.questions.map((question, index) => (
                <QuestionEditor
                  key={question.id!}
                  question={question}
                  questionIndex={index}
                  isExpanded={expandedQuestions.has(question.id!)}
                  onToggleExpanded={() => toggleQuestionExpanded(question.id!)}
                  onUpdate={(updates) => handleUpdateQuestion(question.id!, updates)}
                  onRemove={() => handleRemoveQuestion(question.id!)}
                  questionError={getQuestionError(index)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

QuizBuilder.displayName = 'QuizBuilder';

// Helper: consistent inline error message
const InlineFieldError: React.FC<{ message: string }> = ({ message }) => (
  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center" role="alert">
    <AlertCircle className="w-3 h-3 mr-1" />
    {message}
  </p>
);

// Question Editor
interface QuestionEditorProps {
  question: QuizQuestion;
  questionIndex: number;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onUpdate: (updates: Partial<QuizQuestion>) => void;
  onRemove: () => void;
  questionError?: QuizFieldError;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  questionIndex,
  isExpanded,
  onToggleExpanded,
  onUpdate,
  onRemove,
  questionError,
}) => {
  const questionTextError = getErrorMessage(questionError?.question);
  const optionsError = getErrorMessage(questionError?.options);
  const correctAnswerError = getErrorMessage(questionError?.correctAnswer);
  const pointsError = getErrorMessage(questionError?.points);

  const handleAddOption = useCallback(() => {
    const newOption = { id: generateId(), text: '', isCorrect: false };
    onUpdate({ options: [...(question.options || []), newOption] });
  }, [question.options, onUpdate]);

  const handleUpdateOption = useCallback(
    (optionId: string, text: string) => {
      const updatedOptions = question.options?.map((opt) =>
        opt.id === optionId ? { ...opt, text } : opt
      );
      onUpdate({ options: updatedOptions });
    },
    [question.options, onUpdate]
  );

  const handleSetCorrectOption = useCallback(
    (optionId: string) => {
      const updatedOptions = question.options?.map((opt) => ({
        ...opt,
        isCorrect: opt.id === optionId,
      }));
      onUpdate({ options: updatedOptions });
    },
    [question.options, onUpdate]
  );

  const handleRemoveOption = useCallback(
    (optionId: string) => {
      const updatedOptions = question.options?.filter((opt) => opt.id !== optionId);
      onUpdate({ options: updatedOptions });
    },
    [question.options, onUpdate]
  );

  // Option error helper
  const getOptionError = useCallback(
    (optionIndex: number) =>
      Array.isArray(questionError?.options) ? questionError?.options[optionIndex] : undefined,
    [questionError?.options]
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`border rounded-lg overflow-hidden ${
        questionTextError || optionsError
          ? 'border-red-300 dark:border-red-700'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Question Header */}
      <div className="bg-gray-50 dark:bg-gray-750 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center flex-1 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 text-white rounded-full text-sm font-medium mr-3">
            {questionIndex + 1}
          </div>

          <button
            type="button"
            onClick={onToggleExpanded}
            className="flex items-center flex-1 min-w-0 text-left"
            aria-expanded={isExpanded}
            aria-controls={`question-content-${question.id!}`}
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {question.question || 'New Question'}
            </span>
            {questionTextError && (
              <AlertCircle className="w-4 h-4 text-red-500 ml-2 flex-shrink-0" />
            )}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {question.type === 'multiple-choice'
              ? 'Multiple Choice'
              : question.type === 'true-false'
                ? 'True/False'
                : 'Short Answer'}
          </span>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-red-400 hover:text-red-600 transition-colors"
            title="Remove question"
            aria-label="Remove question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="cursor-move p-1 text-gray-400" title="Drag to reorder" aria-disabled>
            <GripVertical className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id={`question-content-${question.id!}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-4 space-y-4"
          >
            {/* Question Type */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question Type
              </Label>
              <select
                value={question.type}
                onChange={(e) => onUpdate({ type: e.target.value as QuizQuestion['type'] })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                aria-label="Question Type"
              >
                <option value="multiple-choice">Multiple Choice</option>
                {/* <option value="true-false">True/False</option>
                  <option value="short-answer">Short Answer</option> */}
              </select>
            </div>
            {/* Question Text */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question *
              </Label>
              <BlurTextarea
                value={question.question}
                onSave={(val) => onUpdate({ question: val })}
                rows={3}
                className={`w-full resize-none${questionTextError ? ' border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your question"
                aria-invalid={!!questionTextError}
                autoComplete="off"
              />
              {questionTextError && <InlineFieldError message={questionTextError} />}
            </div>
            {/* Options for Multiple Choice/True-False */}
            {(question.type === 'multiple-choice' || question.type === 'true-false') && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Answer Options *
                  </Label>
                  {question.type === 'multiple-choice' && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      aria-label="Add option"
                    >
                      + Add Option
                    </button>
                  )}
                </div>
                {optionsError && typeof optionsError === 'string' && (
                  <InlineFieldError message={optionsError} />
                )}
                <div className="space-y-2">
                  {question.options?.map((option, optIndex) => {
                    if (!option) return null;
                    const optError = getOptionError(optIndex);
                    return (
                      <div key={option.id! ?? optIndex} className="flex items-start space-x-2">
                        <Input
                          type="radio"
                          name={`correct-${question.id!}`}
                          checked={!!option.isCorrect}
                          onChange={() => handleSetCorrectOption(option.id!)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 mt-3"
                          title="Mark as correct answer"
                          aria-label="Mark as correct answer"
                        />
                        <div className="flex-1">
                          <BlurInput
                            type="text"
                            value={option.text}
                            onSave={(val) => handleUpdateOption(option.id!, val)}
                            className={`w-full${getErrorMessage(optError?.text) ? ' border-red-500 focus:ring-red-500' : ''}`}
                            placeholder={`Option ${optIndex + 1}`}
                            aria-invalid={!!getErrorMessage(optError?.text)}
                            autoComplete="off"
                          />
                          {getErrorMessage(optError?.text) && (
                            <InlineFieldError message={getErrorMessage(optError?.text)} />
                          )}
                        </div>
                        {question.type === 'multiple-choice' && question.options!.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(option.id!)}
                            className="p-2 text-red-400 hover:text-red-600 transition-colors"
                            aria-label="Remove option"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {correctAnswerError && <InlineFieldError message={correctAnswerError} />}
              </div>
            )}
            {/* Correct Answer for Short Answer */}
            {/* {question.type === 'short-answer' && (
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Correct Answer
                  </Label>
                  <Input
                    type="text"
                    value={question.correctAnswer || ''}
                    onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
                    className={`w-full${correctAnswerError ? ' border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter the correct answer"
                    aria-invalid={!!correctAnswerError}
                    autoComplete="off"
                  />
                  {correctAnswerError && <InlineFieldError message={correctAnswerError} />}
                </div>
              )} */}
            {/* Explanation */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Explanation (Optional)
              </Label>
              <BlurTextarea
                value={question.explanation || ''}
                onSave={(value) => onUpdate({ explanation: value })}
                rows={2}
                className="w-full resize-none"
                placeholder="Explain the correct answer"
                autoComplete="off"
              />
            </div>
            {/* Points & Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Points
                </Label>
                <BlurInput
                  type="number"
                  min="1"
                  value={question.points || ''}
                  onSave={(val) => onUpdate({ points: Number(val) })}
                  className={`w-full${pointsError ? ' border-red-500 focus:ring-red-500' : ''}`}
                  aria-invalid={!!pointsError}
                  autoComplete="off"
                />
                {pointsError && <InlineFieldError message={pointsError} />}
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Limit (seconds)
                </Label>
                <BlurInput
                  type="number"
                  min="0"
                  value={question.timeLimit || ''}
                  onSave={(val) =>
                    onUpdate({
                      timeLimit: val.length > 0 ? Number(val) : 0,
                    })
                  }
                  className="w-full"
                  placeholder="No limit"
                  autoComplete="off"
                />
              </div>
            </div>
            {/* Required Checkbox */}
            <Label className="flex items-center cursor-pointer">
              <Input
                type="checkbox"
                checked={!!question.required}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                aria-label="Required question"
              />
              <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Required question
              </span>
            </Label>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
QuestionEditor.displayName = 'QuestionEditor';
