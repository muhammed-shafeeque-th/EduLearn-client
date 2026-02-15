'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Clock, AlertCircle, CheckCircle, Award, AlarmClock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizWithProgress, QuizQuestion } from '@/types/enrollment/enrollment.type';

interface QuizRunnerProps {
  enrollmentId: string;
  quiz: QuizWithProgress;
  onSubmit: (answers: { questionId: string; answers: string[] }[], timeSpent: number) => void;
  onCancel: () => void;
}

function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export function QuizRunner({ quiz, onSubmit, onCancel }: QuizRunnerProps) {
  const { questions, timeLimit, requirePassingScore, passingScore, description } = quiz;
  const totalQuestions = questions.length;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [answers, setAnswers] = useState<Record<number, string[]>>({});

  //  useRef for time baseline (avoid useState Date.now() closure issues)
  const startTimeRef = useRef<number>(Date.now());

  const [timeSpent, setTimeSpent] = useState(0);
  const [quizTimer, setQuizTimer] = useState<number>(0);
  const [questionTimer, setQuestionTimer] = useState<number>(0);

  const [isQuizTimeUp, setIsQuizTimeUp] = useState(false);
  const [isQuestionTimeUp, setIsQuestionTimeUp] = useState(false);

  const [hasSubmitted, setHasSubmitted] = useState(false);

  //  IMPORTANT: stop everything when unmounted or cancelled
  const isActiveRef = useRef(true);

  // store timer ids
  const quizIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const questionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex],
    [questions, currentQuestionIndex]
  );

  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const canSubmit = useMemo(() => {
    return questions.every((_, idx) => (answers[idx]?.length ?? 0) > 0);
  }, [questions, answers]);

  /**
   *  Reset everything when quiz changes
   * This is CRITICAL when user navigates to another quiz.
   */
  useEffect(() => {
    isActiveRef.current = true;

    // reset state for new quiz instance
    startTimeRef.current = Date.now();
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeSpent(0);
    setQuizTimer(0);
    setQuestionTimer(0);
    setIsQuizTimeUp(false);
    setIsQuestionTimeUp(false);
    setHasSubmitted(false);

    return () => {
      isActiveRef.current = false;

      if (quizIntervalRef.current) clearInterval(quizIntervalRef.current);
      if (questionIntervalRef.current) clearInterval(questionIntervalRef.current);

      quizIntervalRef.current = null;
      questionIntervalRef.current = null;
    };
  }, [quiz.id]);

  /**
   *  QUIZ TIMER: depends only on quiz.id + timeLimit
   * Stops cleanly when leaving quiz.
   */
  useEffect(() => {
    // do not run timers if inactive or submitted
    if (!isActiveRef.current || hasSubmitted) return;

    if (quizIntervalRef.current) clearInterval(quizIntervalRef.current);

    quizIntervalRef.current = setInterval(() => {
      if (!isActiveRef.current || hasSubmitted) return;

      const spent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTimeSpent(spent);

      setQuizTimer((prev) => {
        const next = prev + 1;

        if (typeof timeLimit === 'number' && next >= timeLimit) {
          //  time up
          setIsQuizTimeUp(true);
          return timeLimit;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (quizIntervalRef.current) clearInterval(quizIntervalRef.current);
      quizIntervalRef.current = null;
    };
  }, [quiz.id, timeLimit, hasSubmitted]);

  /**
   *  QUESTION TIMER: depends only on question index + question timeLimit
   */
  useEffect(() => {
    if (!isActiveRef.current || hasSubmitted) return;

    // reset timer
    setQuestionTimer(0);
    setIsQuestionTimeUp(false);

    if (questionIntervalRef.current) clearInterval(questionIntervalRef.current);

    const qLimit = currentQuestion.timeLimit;

    questionIntervalRef.current = setInterval(() => {
      if (!isActiveRef.current || hasSubmitted) return;

      if (!qLimit) {
        setQuestionTimer(0);
        return;
      }

      setQuestionTimer((prev) => {
        const next = prev + 1;
        if (next >= qLimit) {
          setIsQuestionTimeUp(true);
          return qLimit;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (questionIntervalRef.current) clearInterval(questionIntervalRef.current);
      questionIntervalRef.current = null;
    };
  }, [currentQuestionIndex, currentQuestion.timeLimit, hasSubmitted, currentQuestion]);

  /**
   *  Auto-submit ONLY if active
   */
  const handleSubmit = useCallback(() => {
    if (!isActiveRef.current) return;
    if (hasSubmitted) return;

    setHasSubmitted(true);

    // stop timers immediately
    if (quizIntervalRef.current) clearInterval(quizIntervalRef.current);
    if (questionIntervalRef.current) clearInterval(questionIntervalRef.current);

    quizIntervalRef.current = null;
    questionIntervalRef.current = null;

    const payload = questions.map((q, idx) => ({
      questionId: q.id,
      answers: answers[idx] ?? [],
    }));

    const finalSpent = Math.min(timeSpent, timeLimit ?? timeSpent);
    onSubmit(payload, finalSpent);
  }, [answers, hasSubmitted, onSubmit, questions, timeLimit, timeSpent]);

  useEffect(() => {
    if (!isActiveRef.current) return;
    if (!isQuizTimeUp) return;

    //  If user leaves quiz => isActiveRef false => submit won't happen
    // handleSubmit();
  }, [isQuizTimeUp, handleSubmit]);

  /**
   *  Auto-next question only if active
   */
  const handleNext = useCallback(() => {
    if (!isActiveRef.current || hasSubmitted) return;
    if (currentQuestionIndex >= totalQuestions - 1) return;

    setCurrentQuestionIndex((idx) => Math.min(idx + 1, totalQuestions - 1));
  }, [currentQuestionIndex, totalQuestions, hasSubmitted]);

  useEffect(() => {
    if (!isActiveRef.current) return;
    if (isQuestionTimeUp) handleNext();
  }, [isQuestionTimeUp, handleNext]);

  const handlePrevious = () => {
    if (!isActiveRef.current || hasSubmitted) return;
    setCurrentQuestionIndex((idx) => Math.max(idx - 1, 0));
  };

  /**
   *  Cancel quiz: stop timers & deactivate
   */
  const handleCancel = () => {
    isActiveRef.current = false;

    if (quizIntervalRef.current) clearInterval(quizIntervalRef.current);
    if (questionIntervalRef.current) clearInterval(questionIntervalRef.current);

    quizIntervalRef.current = null;
    questionIntervalRef.current = null;

    onCancel();
  };

  const handleSingleChoice = (selectedIdx: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: [selectedIdx],
    }));
  };

  const handleMultipleChoice = (selectedIdx: string) => {
    setAnswers((prev) => {
      const prevAnswers = prev[currentQuestionIndex] ?? [];
      const updated = prevAnswers.includes(selectedIdx)
        ? prevAnswers.filter((o) => o !== selectedIdx)
        : [...prevAnswers, selectedIdx];

      return { ...prev, [currentQuestionIndex]: updated };
    });
  };

  function renderOptions(question: QuizQuestion, qIndex: number) {
    switch (question.type) {
      case 'single-choice': {
        const selected = answers[qIndex]?.[0] ?? '';
        return (
          <RadioGroup value={selected} onValueChange={handleSingleChoice}>
            <div className="space-y-3">
              {question.options.map((option, idx) => (
                <div
                  key={option.value}
                  className={cn(
                    'flex items-center space-x-3 p-4 border rounded-lg transition-colors',
                    'hover:bg-accent/50 cursor-pointer',
                    selected === String(idx) && 'bg-primary/10 border-primary'
                  )}
                >
                  <RadioGroupItem value={String(idx)} id={`option-${qIndex}-${idx}`} />
                  <Label htmlFor={`option-${qIndex}-${idx}`} className="flex-1 cursor-pointer">
                    {option.value}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );
      }

      case 'multiple-choice': {
        const selectedIndices = answers[qIndex] || [];
        return (
          <div className="space-y-3">
            {question.options.map((option, idx) => {
              const isChecked = selectedIndices.includes(String(idx));
              return (
                <div
                  key={option.value}
                  className={cn(
                    'flex items-center space-x-3 p-4 border rounded-lg transition-colors',
                    'hover:bg-accent/50 cursor-pointer',
                    isChecked && 'bg-primary/10 border-primary'
                  )}
                  onClick={() => handleMultipleChoice(String(idx))}
                  role="checkbox"
                  aria-checked={isChecked}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      handleMultipleChoice(String(idx));
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleMultipleChoice(String(idx))}
                    className="form-checkbox h-4 w-4 accent-primary"
                    tabIndex={-1}
                  />
                  <Label className="flex-1 cursor-pointer">{option.value}</Label>
                </div>
              );
            })}
          </div>
        );
      }

      default:
        return (
          <div className="text-muted-foreground text-sm italic">
            Question type <span className="font-semibold">{question.type}</span> not implemented.
          </div>
        );
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                {quiz.title}
              </CardTitle>

              <div className="flex gap-3 items-center">
                {typeof timeLimit === 'number' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <AlarmClock className="h-3 w-3" />
                    {formatTime(Math.max(timeLimit - quizTimer, 0))}
                  </Badge>
                )}

                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(timeSpent)}
                </Badge>
              </div>
            </div>

            {description && (
              <div className="text-muted-foreground text-sm flex gap-1 items-center">
                <Info className="h-4 w-4 opacity-70" />
                {description}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span className="font-medium">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {requirePassingScore && passingScore && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Passing score: {passingScore}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{currentQuestion.question}</h3>

                {currentQuestion.timeLimit && (
                  <Badge variant="secondary" className="flex items-center gap-1 ml-2">
                    <AlarmClock className="h-3 w-3" />
                    {formatTime(Math.max(currentQuestion.timeLimit - questionTimer, 0))}
                  </Badge>
                )}
              </div>

              {renderOptions(currentQuestion, currentQuestionIndex)}

              {isQuestionTimeUp && (
                <div className="mt-3 px-2 py-1 bg-red-50 dark:bg-red-900/10 border text-xs border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-200 rounded flex gap-1 items-center">
                  <AlarmClock className="h-3 w-3" /> Time up for this question! Advancing.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {isLastQuestion ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || hasSubmitted}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={
                      !answers[currentQuestionIndex] || answers[currentQuestionIndex].length === 0
                    }
                  >
                    Next Question
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="ghost" type="button" onClick={handleCancel}>
          Exit Quiz
        </Button>
      </div>
    </div>
  );
}
