/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, Play, CheckCircle, AlertCircle, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  EnrollmentDetail,
  EnrollmentProgressResponse,
  QuizWithProgress,
} from '@/types/enrollment/enrollment.type';

interface CourseQuizzesTabProps {
  enrollment: EnrollmentDetail;
  progress: EnrollmentProgressResponse;
  onQuizStart: (quizId: string) => void;
}

export function CourseQuizzesTab({ enrollment, progress, onQuizStart }: CourseQuizzesTabProps) {
  // Extract quizzes with section info
  const quizzes = enrollment.sections
    .filter((section) => section.quiz)
    .map((section, index) => ({
      quiz: section.quiz!,
      sectionTitle: section.title,
      sectionOrder: index + 1,
      progress: progress.quizzes.find((q) => q.quizId === section.quiz!.id),
    }));

  const completedQuizzes = quizzes.filter((q) => q.progress?.completed).length;
  const totalQuizzes = quizzes.length;
  const averageScore =
    completedQuizzes > 0
      ? quizzes
          .filter((q) => q.progress?.completed && q.progress.score)
          .reduce((sum, q) => sum + (q.progress!.score || 0), 0) / completedQuizzes
      : 0;

  const getQuizStatusIcon = (quiz: { quiz: QuizWithProgress; progress?: any }) => {
    if (!quiz.progress?.completed) {
      return <Award className="h-6 w-6 text-primary" />;
    }

    const score = quiz.progress.score || 0;
    if (score >= 80) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    } else if (score >= 60) {
      return <AlertCircle className="h-6 w-6 text-yellow-500" />;
    } else {
      return <AlertCircle className="h-6 w-6 text-red-500" />;
    }
  };

  const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (totalQuizzes === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Quizzes Available</h3>
          <p className="text-muted-foreground">This course doesn&apos;t have any quizzes yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Quiz Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {completedQuizzes}/{totalQuizzes}
              </div>
              <div className="text-sm text-muted-foreground">Quizzes Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">
                {Math.round(averageScore)}%
              </div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">
                {progress.quizzes.reduce((sum, q) => sum + q.attempts, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Attempts</div>
            </div>
          </div>
          <Progress
            value={totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0}
            className="mb-2"
          />
          <div className="text-sm text-muted-foreground text-center">
            {totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0}% of quizzes
            completed
          </div>
        </CardContent>
      </Card>

      {/* Quiz List */}
      <div className="space-y-4">
        {quizzes.map(({ quiz, sectionTitle, sectionOrder, progress: quizProgress }, index) => (
          <Card
            key={quiz.id}
            className={cn(
              'transition-all hover:shadow-md',
              quizProgress?.completed &&
                'bg-green-50 dark:bg-green-950/10 border-green-200 dark:border-green-800'
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="shrink-0">
                    {getQuizStatusIcon({ quiz, progress: quizProgress })}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1 flex-wrap">
                      <h3 className="font-semibold">{quiz.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        Quiz {index + 1}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Section {sectionOrder}: {sectionTitle}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground flex-wrap gap-2">
                      {quiz.requirePassingScore && quiz.passingScore && (
                        <div className="flex items-center space-x-1">
                          <Award className="h-4 w-4" />
                          <span>Pass: {quiz.passingScore}%</span>
                        </div>
                      )}
                      {quizProgress?.completed && quizProgress.attempts && (
                        <div className="flex items-center space-x-1">
                          <Trophy className="h-4 w-4" />
                          <span>{quizProgress.attempts} attempts</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {quizProgress?.completed && quizProgress.score !== undefined && (
                    <Badge variant={getScoreBadgeVariant(quizProgress.score)} className="text-sm">
                      {Math.round(quizProgress.score)}%{quizProgress.passed && ' ✓'}
                    </Badge>
                  )}
                  <Button
                    variant={quizProgress?.completed ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => onQuizStart(quiz.id)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {quizProgress?.completed ? 'Retake' : 'Start'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
