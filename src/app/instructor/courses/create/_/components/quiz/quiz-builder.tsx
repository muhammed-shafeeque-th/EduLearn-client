/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import React, { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, HelpCircle, Move, Trash2, AlertCircle } from 'lucide-react';
import { Quiz, QuizQuestion } from '../../schemas/curriculum-schema';
import { Label } from '@/components/ui/label';
import { generateId } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface QuizBuilderProps {
  quiz: Quiz;
  onChange: (quiz: Quiz) => void;
  quizError?: any;
  className?: string;
}

export const QuizBuilder: React.FC<QuizBuilderProps> = ({
  quiz,
  onChange,
  quizError,
  className = '',
}) => {
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  // Extract field-specific errors
  const titleError = quizError?.title?.message;
  const descriptionError = quizError?.description?.message;
  const questionsError = quizError?.questions?.message;
  const passingScoreError = quizError?.passingScore?.message;
  const maxAttemptsError = quizError?.maxAttempts?.message;
  const timeLimitError = quizError?.timeLimit?.message;

  const handleFieldUpdate = useCallback(
    (field: keyof Quiz, value: any) => {
      onChange({ ...quiz, [field]: value });
    },
    [quiz, onChange]
  );

  // const handleAddQuestion = () => {
  //   const newQuestion: QuizQuestion = {
  //     id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  //     type: 'multiple-choice',
  //     question: '',
  //     options: [
  //       { id: '1', text: '', isCorrect: false },
  //       { id: '2', text: '', isCorrect: false },
  //       { id: '3', text: '', isCorrect: false },
  //       { id: '4', text: '', isCorrect: false },
  //     ],
  //     points: 1,
  //     required: true,
  //   };

  //   onChange({
  //     ...quiz,
  //     questions: [...quiz.questions, newQuestion],
  //   });
  //   setActiveQuestion(newQuestion.id);
  // };

  // const updateQuestion = (questionId: string, updates: Partial<QuizQuestion>) => {
  //   onChange({
  //     ...quiz,
  //     questions: quiz.questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q)),
  //   });
  // };

  // Question handlers
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
      // correctAnswer: '',
      explanation: '',
      points: 1,
      timeLimit: 0,
      required: true,
    };

    onChange({
      ...quiz,
      questions: [...quiz.questions, newQuestion],
    });

    // Auto-expand new question
    // setExpandedQuestions((prev) => new Set(prev).add(newQuestion.id!));
  }, [quiz, onChange]);

  const handleRemoveQuestion = useCallback(
    (questionId: string) => {
      onChange({
        ...quiz,
        questions: quiz.questions.filter((q) => q.id !== questionId),
      });
      if (activeQuestion === questionId) {
        setActiveQuestion(null);
      }
    },
    [quiz, onChange, activeQuestion]
  );

  const moveQuestion = useCallback(
    (questionId: string, direction: 'up' | 'down') => {
      const currentIndex = quiz.questions.findIndex((q) => q.id === questionId);
      if (currentIndex === -1) return;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= quiz.questions.length) return;

      const newQuestions = [...quiz.questions];
      [newQuestions[currentIndex], newQuestions[newIndex]] = [
        newQuestions[newIndex],
        newQuestions[currentIndex],
      ];

      onChange({ ...quiz, questions: newQuestions });
    },
    [onChange, quiz]
  );

  const handleUpdateQuestion = useCallback(
    (questionId: string, updates: Partial<QuizQuestion>) => {
      const updatedQuestions = quiz.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      );
      onChange({ ...quiz, questions: updatedQuestions });
    },
    [quiz, onChange]
  );

  const getQuestionError = useCallback(
    (index: number) => {
      return quizError?.questions?.[index];
    },
    [quizError]
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Quiz Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quiz Settings</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quiz Title *
            </Label>
            <Input
              type="text"
              value={quiz.title}
              onChange={(e) => handleFieldUpdate('title', e.target.value)}
              className={`w-full ${titleError ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Enter quiz title"
            />
            {titleError && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {titleError}
              </p>
            )}
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Passing Score (%)
            </Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={quiz.passingScore || 70}
              onChange={(e) => handleFieldUpdate('passingScore', parseInt(e.target.value))}
              className={`w-full ${passingScoreError ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            {passingScoreError && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {passingScoreError}
              </p>
            )}
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Limit (minutes)
            </Label>
            <Input
              type="number"
              min="0"
              value={quiz.timeLimit || ''}
              onChange={(e) =>
                handleFieldUpdate('timeLimit', parseInt(e.target.value) || undefined)
              }
              className={`w-full ${timeLimitError ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="No limit"
            />
            {timeLimitError && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {timeLimitError}
              </p>
            )}
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Attempts
            </Label>
            <Input
              type="number"
              min="1"
              value={quiz.maxAttempts || 3}
              onChange={(e) => handleFieldUpdate('maxAttempts', parseInt(e.target.value))}
              className={`w-full ${maxAttemptsError ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            {maxAttemptsError && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {maxAttemptsError}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </Label>
          <Textarea
            value={quiz.description || ''}
            onChange={(e) => handleFieldUpdate('description', e.target.value)}
            rows={3}
            className={`w-full resize-none ${descriptionError ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder="Optional quiz description"
          />
          {descriptionError && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {descriptionError}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <Label className="flex items-center">
            <Input
              type="checkbox"
              checked={quiz.randomizeQuestions || false}
              onChange={(e) => handleFieldUpdate('randomizeQuestions', e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Randomize question order
            </span>
          </Label>

          <Label className="flex items-center">
            <Input
              type="checkbox"
              checked={quiz.showResults ?? true}
              onChange={(e) => handleFieldUpdate('showResults', e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Show results after completion
            </span>
          </Label>

          <Label className="flex items-center">
            <Input
              type="checkbox"
              checked={quiz.isRequired || false}
              onChange={(e) => handleFieldUpdate('isRequired', e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Required to complete section
            </span>
          </Label>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Questions ({quiz.questions.length})
          </h3>
          {questionsError && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {questionsError}
            </p>
          )}
          <button
            onClick={handleAddQuestion}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </button>
        </div>

        {quiz.questions.length === 0 ? (
          <div className="text-center py-8">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">No questions added yet</p>
            <button
              onClick={handleAddQuestion}
              className="text-primary dark:text-primary-foreground hover:underline"
            >
              Add your first question
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {quiz.questions.map((question, index) => (
              <QuestionEditor
                key={question.id}
                question={question}
                index={index}
                isActive={activeQuestion === question.id}
                onToggle={() =>
                  setActiveQuestion(activeQuestion === question.id ? null : (question.id ?? null))
                }
                onUpdate={(updates) => handleUpdateQuestion(question.id ?? '', updates)}
                onRemove={() => handleRemoveQuestion(question.id ?? '')}
                onMove={(direction) => moveQuestion(question.id ?? '', direction)}
                canMoveUp={index > 0}
                canMoveDown={index < quiz.questions.length - 1}
                questionError={getQuestionError(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

QuizBuilder.displayName = 'QuizBuilder';

// Question Editor Component
interface QuestionEditorProps {
  question: QuizQuestion;
  index: number;
  isActive: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<QuizQuestion>) => void;
  onRemove: () => void;
  onMove: (direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  questionError?: any;
}

type MultiChoiceQuestion = Extract<QuizQuestion, { type: 'multiple-choice' }>;

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  index,
  isActive,
  onToggle,
  onUpdate,
  onRemove,
  onMove,
  canMoveUp,
  canMoveDown,
  questionError,
}) => {
  // Extract field-specific errors
  const questionTextError = questionError?.question?.message;
  const optionsError = questionError?.options?.message;
  const correctAnswerError = questionError?.correctAnswer?.message;
  const pointsError = questionError?.points?.message;
  const options = useMemo(() => (question as MultiChoiceQuestion).options || [], [question]);

  const handleAddOption = useCallback(() => {
    const newOption = { id: generateId(), text: '', isCorrect: options.length === 0 };
    const newOptions = [...options, newOption];
    if (!newOptions.some((opt) => opt.isCorrect) && newOptions.length > 0) {
      newOptions[0] = { ...newOptions[0], isCorrect: true };
    }
    onUpdate({ options: newOptions });
  }, [options, onUpdate]);

  const handleUpdateOption = useCallback(
    (optionId: string, text: string) => {
      const updatedOptions = options.map((opt) => (opt.id === optionId ? { ...opt, text } : opt));
      onUpdate({ options: updatedOptions });
    },
    [options, onUpdate]
  );

  const handleSetCorrectOption = useCallback(
    (optionId: string) => {
      const updatedOptions = options.map((opt) =>
        opt.id === optionId
          ? {
              ...opt,
              isCorrect: !opt.isCorrect,
            }
          : opt
      );
      onUpdate({ options: updatedOptions });
    },
    [options, onUpdate]
  );

  const handleRemoveOption = useCallback(
    (optionId: string) => {
      const updatedOptions = options.filter((opt) => opt.id !== optionId);
      if (updatedOptions.length > 0 && !updatedOptions.some((opt) => opt.isCorrect)) {
        updatedOptions[0] = { ...updatedOptions[0], isCorrect: true };
      }
      onUpdate({ options: updatedOptions });
    },
    [options, onUpdate]
  );

  const getOptionError = useCallback(
    (optionIndex: number) => {
      return questionError?.options?.[optionIndex];
    },
    [questionError]
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
      <div
        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-3">
          <span className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-medium">
            {index + 1}
          </span>
          {questionTextError && <AlertCircle className="w-4 h-4 text-red-500 ml-2 shrink-0" />}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {question.question || 'Untitled Question'}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {question.type} • {question.points} point{question.points !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {canMoveUp && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMove('up');
              }}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Move up"
            >
              <Move className="w-4 h-4 rotate-180" />
            </button>
          )}
          {canMoveDown && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMove('down');
              }}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Move down"
            >
              <Move className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 text-red-400 hover:text-red-600"
            title="Delete question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Question Content */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            <div className="p-6 space-y-6">
              {/* Question Type and Points */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question Type
                  </Label>
                  <select
                    value={question.type}
                    onChange={(e) => {
                      const type = e.target.value as QuizQuestion['type'];
                      if (type !== 'multiple-choice') {
                        onUpdate({ type: type });
                      } else {
                        onUpdate({
                          type,
                          options: [
                            { id: '1', text: '', isCorrect: true },
                            { id: '2', text: '', isCorrect: false },
                            { id: '3', text: '', isCorrect: false },
                            { id: '4', text: '', isCorrect: false },
                          ],
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    {/* <option value="true-false">True/False</option> */}
                    {/* <option value="short-answer">Short Answer</option>
                    <option value="essay">Essay</option> */}
                  </select>
                </div>

                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Points
                  </Label>
                  <input
                    type="number"
                    min="1"
                    value={question.points}
                    onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Limit (seconds)
                  </Label>
                  <input
                    type="number"
                    min="1"
                    value={question.timeLimit || ''}
                    onChange={(e) => onUpdate({ timeLimit: parseInt(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    placeholder="No limit"
                  />
                </div>
              </div>

              {/* Question Text */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Question *
                </Label>
                <textarea
                  value={question.question}
                  onChange={(e) => onUpdate({ question: e.target.value })}
                  rows={3}
                  className={`w-full resize-none ${
                    questionTextError ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="Enter your question"
                />
                {questionTextError && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {questionTextError}
                  </p>
                )}
              </div>

              {/* Options for Multiple Choice */}
              {question.type === 'multiple-choice' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Answer Options *
                    </Label>
                    <button
                      onClick={handleAddOption}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      + Add Option
                    </button>
                  </div>
                  {optionsError && typeof optionsError === 'string' && (
                    <p className="text-xs text-red-600 dark:text-red-400 mb-2 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {optionsError}
                    </p>
                  )}
                  <div className="space-y-2">
                    {(question as MultiChoiceQuestion).options?.map((option, optIndex) => {
                      const optError = getOptionError(optIndex);
                      return (
                        <div key={option.id} className="flex items-start space-x-2">
                          <Input
                            type="checkbox"
                            name={`correct-${question.id}-${option.id}`}
                            checked={option.isCorrect}
                            onChange={() => handleSetCorrectOption(option.id!)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 mt-3"
                            title="Mark as correct answer(s)"
                          />
                          <div className="flex-1">
                            <Input
                              type="text"
                              value={option.text}
                              onChange={(e) => handleUpdateOption(option.id!, e.target.value)}
                              className={`w-full ${
                                optError?.text?.message ? 'border-red-500 focus:ring-red-500' : ''
                              }`}
                              placeholder={`Option ${optIndex + 1}`}
                            />
                            {optError?.text?.message && (
                              <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {optError.text.message}
                              </p>
                            )}
                          </div>
                          {(question as MultiChoiceQuestion).options &&
                            (question as MultiChoiceQuestion).options.length > 2 && (
                              <button
                                onClick={() => handleRemoveOption(option.id!)}
                                className="p-2 text-red-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                        </div>
                      );
                    })}
                  </div>
                  {correctAnswerError && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {correctAnswerError}
                    </p>
                  )}
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
                      className={`w-full ${
                        correctAnswerError ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      placeholder="Enter the correct answer"
                    />
                    {correctAnswerError && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {correctAnswerError}
                      </p>
                    )}
                  </div>
                )} */}

              {/* Explanation */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Explanation (Optional)
                </Label>
                <textarea
                  value={question.explanation || ''}
                  onChange={(e) => onUpdate({ explanation: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Explain the correct answer..."
                />
              </div>

              {/* Points & Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Points
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={question.points || 1}
                    onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 1 })}
                    className={`w-full ${pointsError ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {pointsError && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {pointsError}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Limit (seconds)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={question.timeLimit || ''}
                    onChange={(e) => onUpdate({ timeLimit: parseInt(e.target.value) || undefined })}
                    className="w-full"
                    placeholder="No limit"
                  />
                </div>
              </div>

              {/* Required Checkbox */}
              <Label className="flex items-center cursor-pointer">
                <Input
                  type="checkbox"
                  checked={question.required ?? true}
                  onChange={(e) => onUpdate({ required: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Required question
                </span>
              </Label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

QuestionEditor.displayName = 'QuestionEditor';
