'use client';

import React, { useMemo } from 'react';
import { CheckCircle, Lock, PlayCircle, PenTool, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type {
  CourseItem,
  EnrollmentProgressResponse,
  LessonProgress,
  QuizProgress,
} from '@/types/enrollment/enrollment.type';

interface CourseSidebarProps {
  courseItems: CourseItem[];
  currentItemId: string;
  progress: EnrollmentProgressResponse;
  onItemClick: (item: CourseItem) => void;
  isItemLocked: (item: CourseItem) => boolean;
  onItemHover?: (item: CourseItem) => void;
}

interface ModuleGroup {
  id: string;
  title: string;
  items: CourseItem[];
  completed: number;
  total: number;
  progressPercent: number;
}

export function CourseSidebar({
  courseItems,
  currentItemId,
  progress,
  onItemClick,
  isItemLocked,
  onItemHover,
}: CourseSidebarProps) {
  // GROUP ITEMS BY MODULE

  const modules = useMemo<ModuleGroup[]>(() => {
    const moduleMap = new Map<string, CourseItem[]>();

    courseItems.forEach((item) => {
      if (!moduleMap.has(item.moduleId)) {
        moduleMap.set(item.moduleId, []);
      }
      moduleMap.get(item.moduleId)!.push(item);
    });

    return Array.from(moduleMap.entries()).map(([moduleId, items]) => {
      const completed = items.filter((item) => {
        const itemProgress = getItemProgress(item, progress);
        return itemProgress?.completed || false;
      }).length;

      const total = items.length;
      const progressPercent = total > 0 ? (completed / total) * 100 : 0;

      return {
        id: moduleId,
        title: items[0]?.moduleTitle || 'Untitled Module',
        items,
        completed,
        total,
        progressPercent,
      };
    });
  }, [courseItems, progress]);

  // HELPER FUNCTIONS

  function getItemProgress(
    item: CourseItem,
    progress: EnrollmentProgressResponse
  ): LessonProgress | QuizProgress | null {
    if (item.type === 'lesson') {
      return progress.lessons.find((l) => l.lessonId === item.id) || null;
    } else {
      return progress.quizzes.find((q) => q.quizId === item.id) || null;
    }
  }

  function getItemProgressText(item: CourseItem, progress: EnrollmentProgressResponse): string {
    const itemProgress = getItemProgress(item, progress);

    if (!itemProgress) return 'Not started';

    if (item.type === 'lesson') {
      const lessonProgress = itemProgress as LessonProgress;
      if (lessonProgress.completed) return 'Completed ✓';
      if (lessonProgress.progressPercent) {
        return `${Math.round(lessonProgress.progressPercent)}% watched`;
      }
      return 'Not started';
    } else {
      const quizProgress = itemProgress as QuizProgress;
      if (quizProgress.completed) {
        const score = quizProgress.score || 0;
        return `Score: ${Math.round(score)}%`;
      }
      if (quizProgress.attempts > 0) {
        return `${quizProgress.attempts} ${quizProgress.attempts === 1 ? 'attempt' : 'attempts'}`;
      }
      return 'Not started';
    }
  }

  function getItemIcon(item: CourseItem, isLocked: boolean, isCompleted: boolean): React.ReactNode {
    if (!isCompleted && isLocked) {
      return <Lock className="h-4 w-4 text-muted-foreground" />;
    }

    if (isCompleted) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }

    if (item.type === 'lesson') {
      return <PlayCircle className="h-4 w-4 text-primary" />;
    } else {
      return <PenTool className="h-4 w-4 text-primary" />;
    }
  }

  // RENDER

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">Overall Progress</span>
          <span className="text-sm font-bold text-primary">
            {Math.round(progress.overallProgress)}%
          </span>
        </div>
        <Progress value={progress.overallProgress} className="h-2 mb-2" />
        <p className="text-xs text-muted-foreground">
          {progress.completedUnits} of {progress.totalUnits} items completed
        </p>
      </div>

      {/* Module List */}
      <div className="space-y-4">
        {modules.map((module) => (
          <div key={module.id} className="border rounded-lg overflow-hidden bg-card">
            {/* Module Header */}
            <div className="p-3 bg-accent/30 flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <ListChecks className="h-4 w-4 text-primary shrink-0" />
                <span className="font-semibold text-sm truncate">{module.title}</span>
              </div>
              <Badge variant="secondary" className="text-xs shrink-0 ml-2">
                {module.completed}/{module.total}
              </Badge>
            </div>

            {/* Module Items */}
            <div className="divide-y">
              {module.items.map((item) => {
                const isLocked = isItemLocked(item);
                const isActive = item.id === currentItemId;
                const itemProgress = getItemProgress(item, progress);
                const isCompleted = itemProgress?.completed || false;

                return (
                  <button
                    key={item.id}
                    onClick={() => !isLocked && onItemClick(item)}
                    disabled={isLocked}
                    onMouseEnter={() => !isLocked && onItemHover?.(item)}
                    className={cn(
                      'w-full text-left p-3 flex items-center gap-3 transition-all',
                      'hover:bg-accent/50 disabled:opacity-50 disabled:cursor-not-allowed',
                      isActive && 'bg-primary/10 border-l-4 border-primary pl-2.5',
                      !isActive && !isLocked && 'hover:translate-x-1'
                    )}
                  >
                    {/* Icon */}
                    <div className="shrink-0">{getItemIcon(item, isLocked, isCompleted)}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate mb-0.5">{item.title}</div>
                      <div
                        className={cn(
                          'text-xs',
                          isCompleted
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-muted-foreground'
                        )}
                      >
                        {getItemProgressText(item, progress)}
                      </div>
                    </div>

                    {/* Status Badge */}
                    {isCompleted && <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Module Progress Bar */}
            <div className="p-2 bg-muted/30">
              <Progress value={module.progressPercent} className="h-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
