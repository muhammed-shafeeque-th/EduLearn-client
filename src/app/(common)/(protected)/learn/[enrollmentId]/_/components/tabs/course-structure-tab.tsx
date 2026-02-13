'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, PlayCircle, PenTool, Lock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  EnrollmentDetail,
  EnrollmentProgressResponse,
  CourseItem,
  LessonProgress,
  QuizProgress,
} from '@/types/enrollment/enrollment.type';

interface CourseStructureTabProps {
  enrollment: EnrollmentDetail;
  progress: EnrollmentProgressResponse;
  onItemClick: (item: CourseItem) => void;
  isItemLocked: (item: CourseItem) => boolean;
}

export function CourseStructureTab({
  enrollment,
  progress,
  onItemClick,
  isItemLocked,
}: CourseStructureTabProps) {
  return (
    <div className="space-y-6">
      {enrollment.sections.map((section, sectionIndex) => {
        const items: CourseItem[] = [
          ...section.lessons.map((lesson) => ({
            id: lesson.id,
            type: 'lesson' as const,
            sectionId: section.id,
            sectionTitle: section.title,
            title: lesson.title,
            order: lesson.order,
            data: lesson,
          })),
          ...(section.quiz
            ? [
                {
                  id: section.quiz.id,
                  type: 'quiz' as const,
                  sectionId: section.id,
                  sectionTitle: section.title,
                  title: section.quiz.title,
                  order: 999,
                  data: section.quiz,
                },
              ]
            : []),
        ];

        const completedItems = items.filter((item) => {
          if (item.type === 'lesson') {
            const lessonProgress = progress.lessons.find((l) => l.lessonId === item.id);
            return lessonProgress?.completed || false;
          } else {
            const quizProgress = progress.quizzes.find((q) => q.quizId === item.id);
            return quizProgress?.completed || false;
          }
        }).length;

        return (
          <Card key={section.id}>
            <div className="p-4 bg-accent/30 flex items-center justify-between border-b">
              <div>
                <h3 className="font-semibold">
                  Section {sectionIndex + 1}: {section.title}
                </h3>
                {section.description && (
                  <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                )}
              </div>
              <Badge variant="secondary">
                {completedItems}/{items.length} completed
              </Badge>
            </div>

            <div className="divide-y">
              {items.map((item) => {
                const isLocked = isItemLocked(item);
                const itemProgress =
                  item.type === 'lesson'
                    ? progress.lessons.find((l) => l.lessonId === item.id)
                    : progress.quizzes.find((q) => q.quizId === item.id);
                const isCompleted = itemProgress?.completed || false;

                return (
                  <button
                    key={item.id}
                    onClick={() => !isLocked && onItemClick(item)}
                    disabled={isLocked}
                    className={cn(
                      'w-full text-left p-4 flex items-center gap-4 transition-colors',
                      'hover:bg-accent/50 disabled:opacity-50 disabled:cursor-not-allowed',
                      isCompleted && 'bg-green-50 dark:bg-green-950/10'
                    )}
                  >
                    {/* Icon */}
                    <div className="shrink-0">
                      {isLocked ? (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      ) : isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : item.type === 'lesson' ? (
                        <PlayCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <PenTool className="h-5 w-5 text-primary" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.type === 'lesson' ? (
                          itemProgress?.completed ? (
                            <>
                              Watched{' '}
                              <span className="font-semibold">
                                {Math.round(
                                  (itemProgress as LessonProgress)?.progressPercent ?? 100
                                )}
                                %
                              </span>
                            </>
                          ) : (
                            'Not started'
                          )
                        ) : item.type === 'quiz' ? (
                          itemProgress && (itemProgress as QuizProgress).attempts > 0 ? (
                            <>
                              <span className="font-semibold">
                                {(itemProgress as QuizProgress).attempts}
                              </span>{' '}
                              {(itemProgress as QuizProgress).attempts === 1
                                ? 'attempt'
                                : 'attempts'}
                            </>
                          ) : (
                            'Not attempted'
                          )
                        ) : null}
                      </p>
                    </div>

                    {/* Arrow */}
                    {!isLocked && (
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
