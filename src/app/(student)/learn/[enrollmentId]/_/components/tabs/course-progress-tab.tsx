'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Award, Target, TrendingUp, PlayCircle } from 'lucide-react';
import type {
  EnrollmentDetail,
  EnrollmentProgressResponse,
} from '@/types/enrollment/enrollment.type';

interface CourseProgressTabProps {
  enrollment: EnrollmentDetail;
  progress: EnrollmentProgressResponse;
}

export function CourseProgressTab({ enrollment, progress }: CourseProgressTabProps) {
  // Calculate statistics
  const completedLessons = progress.lessons.filter((l) => l.completed).length;
  const totalLessons = progress.lessons.length;
  const completedQuizzes = progress.quizzes.filter((q) => q.completed).length;
  const totalQuizzes = progress.quizzes.length;

  const totalWatchTime = progress.lessons.reduce((acc, l) => acc + (l.watchTime || 0), 0);
  const totalWatchHours = Math.floor(totalWatchTime / 3600);
  const totalWatchMinutes = Math.floor((totalWatchTime % 3600) / 60);

  const averageQuizScore =
    completedQuizzes > 0
      ? progress.quizzes
          .filter((q) => q.completed && q.score)
          .reduce((acc, q) => acc + (q.score || 0), 0) / completedQuizzes
      : 0;

  const passedQuizzes = progress.quizzes.filter((q) => q.completed && q.passed).length;

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Your Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Course Completion</span>
                <span className="text-sm font-bold text-primary">
                  {Math.round(progress.overallProgress)}%
                </span>
              </div>
              <Progress value={progress.overallProgress} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {progress.completedUnits} of {progress.totalUnits} learning units completed
              </p>
            </div>

            {enrollment.status === 'COMPLETED' && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      Course Completed!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Completed on {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          label="Lessons Completed"
          value={`${completedLessons}/${totalLessons}`}
          subtitle={`${totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}%`}
        />

        <StatCard
          icon={<Award className="h-5 w-5 text-blue-500" />}
          label="Quizzes Passed"
          value={`${passedQuizzes}/${totalQuizzes}`}
          subtitle={
            totalQuizzes > 0 ? `${Math.round((passedQuizzes / totalQuizzes) * 100)}%` : 'No quizzes'
          }
        />

        <StatCard
          icon={<Clock className="h-5 w-5 text-orange-500" />}
          label="Watch Time"
          value={
            totalWatchHours > 0
              ? `${totalWatchHours}h ${totalWatchMinutes}m`
              : `${totalWatchMinutes}m`
          }
          subtitle="Total learning time"
        />

        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-purple-500" />}
          label="Avg Quiz Score"
          value={`${Math.round(averageQuizScore)}%`}
          subtitle={completedQuizzes > 0 ? `${completedQuizzes} completed` : 'Not started'}
        />
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lessons Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PlayCircle className="h-4 w-4 text-primary" />
              Lessons Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progress.lessons.slice(0, 5).map((lesson) => (
                <div key={lesson.lessonId} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      Lesson {lesson.lessonId.slice(0, 8)}
                    </p>
                    {lesson.completed ? (
                      <p className="text-xs text-green-600 dark:text-green-400">Completed ✓</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {lesson.progressPercent
                          ? `${Math.round(lesson.progressPercent)}% watched`
                          : 'Not started'}
                      </p>
                    )}
                  </div>
                  {lesson.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 ml-2" />
                  ) : (
                    <Badge variant="outline" className="shrink-0 ml-2">
                      {lesson.progressPercent ? `${Math.round(lesson.progressPercent)}%` : '0%'}
                    </Badge>
                  )}
                </div>
              ))}
              {progress.lessons.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  And {progress.lessons.length - 5} more lessons...
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quizzes Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Quiz Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {progress.quizzes.length > 0 ? (
              <div className="space-y-3">
                {progress.quizzes.map((quiz) => (
                  <div key={quiz.quizId} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Quiz {quiz.quizId.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {quiz.attempts} {quiz.attempts === 1 ? 'attempt' : 'attempts'}
                      </p>
                    </div>
                    {quiz.completed ? (
                      <Badge
                        variant={quiz.passed ? 'default' : 'destructive'}
                        className="shrink-0 ml-2"
                      >
                        {Math.round(quiz.score || 0)}%
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0 ml-2">
                        Not completed
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No quizzes in this course</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <div className="shrink-0">{icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
