'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  AlertCircle,
  Plus,
  Zap,
  Clock,
  PlayCircle,
  FileCheck,
  ChevronRight,
} from 'lucide-react';
import { useFieldArray, UseFormReturn, useWatch, FormProvider } from 'react-hook-form';
import { CurriculumFormData, Section } from '../schemas/curriculum-schema';
import { SectionEditor } from '../components/editors/section-editor';
import { formatDuration, calculateTotalDuration } from '../utils/curriculum-utils';
import { useExtractZodErrors } from '../hooks/use-extract-error-message';
import { getDocument } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CurriculumTabProps {
  curriculumForm: UseFormReturn<CurriculumFormData>;
  courseId: string;
}

interface CurriculumStats {
  totalSections: number;
  totalLessons: number;
  totalContent: number;
  totalQuizzes: number;
  totalDuration: number;
  publishedSections: number;
  publishedLessons: number;
  completionPercentage: number;
}

interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

const ValidationAlert: React.FC<{ errors?: string[]; warnings?: string[] }> = ({
  errors = [],
  warnings = [],
}) => {
  if (errors.length === 0 && warnings.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-50/50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/50 rounded-2xl p-4 flex items-start gap-4"
        >
          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="font-bold text-red-900 dark:text-red-200 text-sm">
              Critical Issues ({errors.length})
            </p>
            <ul className="mt-1.5 space-y-1">
              {errors.slice(0, 2).map((error, idx) => (
                <li
                  key={idx}
                  className="text-xs text-red-700/80 dark:text-red-300/80 flex items-center gap-2"
                >
                  <div className="w-1 h-1 bg-red-400 rounded-full" />
                  {error}
                </li>
              ))}
              {errors.length > 2 && (
                <li className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1">
                  + {errors.length - 2} more validation errors
                </li>
              )}
            </ul>
          </div>
        </motion.div>
      )}

      {warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/50 rounded-2xl p-4 flex items-start gap-4"
        >
          <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl">
            <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-bold text-amber-900 dark:text-amber-200 text-sm">
              Optimization Tips
            </p>
            <ul className="mt-1.5 space-y-1">
              {warnings.slice(0, 2).map((warning, idx) => (
                <li
                  key={idx}
                  className="text-xs text-amber-700/80 dark:text-amber-300/80 flex items-center gap-2"
                >
                  <div className="w-1 h-1 bg-amber-400 rounded-full" />
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export const CurriculumTab = React.memo(({ curriculumForm, courseId }: CurriculumTabProps) => {
  const [, setExpandedSections] = useState<Set<string>>(new Set());

  const {
    control,
    formState: { errors },
  } = curriculumForm;

  const {
    fields: sections,
    append,
    remove,
    move,
  } = useFieldArray({
    control,
    name: 'sections',
  });

  const watchedSections = useWatch({ control, name: 'sections', defaultValue: [] });
  const currentSections = useMemo(() => watchedSections || [], [watchedSections]);

  const allErrors = useExtractZodErrors(errors);

  const stats: CurriculumStats = useMemo(() => {
    return {
      totalSections: currentSections.length,
      totalLessons: currentSections.reduce((sum, s) => sum + (s.lessons?.length || 0), 0),
      totalContent: currentSections.reduce(
        (sum, s) => sum + (s.lessons?.reduce((lSum, l) => lSum + (l.content ? 1 : 0), 0) || 0),
        0
      ),
      totalQuizzes: currentSections.filter((s) => s.quiz).length,
      totalDuration: calculateTotalDuration(currentSections),
      publishedSections: currentSections.filter((s) => s.isPublished).length,
      publishedLessons: currentSections.reduce(
        (sum, s) => sum + (s.lessons?.filter((l) => l.isPublished).length || 0),
        0
      ),
      completionPercentage:
        currentSections.length > 0
          ? Math.round(
              (currentSections.filter((s) => s.isPublished).length / currentSections.length) * 100
            )
          : 0,
    };
  }, [currentSections]);

  const validation: ValidationResult = useMemo(() => {
    const vErrors: string[] = [];
    const vWarnings: string[] = [];

    if (stats.totalSections < 1) {
      vErrors.push('At least 1 section is required');
    }
    if (stats.totalLessons < 3 && stats.totalSections > 0) {
      vWarnings.push('Courses with at least 3-5 lessons have higher engagement');
    }
    if (stats.totalContent === 0 && stats.totalLessons > 0) {
      vErrors.push('Lessons must have content (videos/documents)');
    }

    return {
      isValid: vErrors.length === 0,
      warnings: vWarnings,
      errors: vErrors,
    };
  }, [stats]);

  const handleAddSection = useCallback(async () => {
    const newSection: Section = {
      id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `Section ${sections.length + 1}`,
      description: '',
      lessons: [],
      isPublished: true,
      order: sections.length,
    };

    append(newSection);
  }, [sections.length, append]);

  const handleRemoveSection = useCallback(
    async (index: number) => {
      remove(index);
    },
    [remove]
  );

  const handleErrorClick = (sectionIndex?: number) => {
    if (sectionIndex !== undefined) {
      const sectionId = sections[sectionIndex]?.id;
      if (sectionId) {
        setTimeout(() => {
          const element = getDocument()?.getElementById(`section-${sectionId}`);
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  };

  const handleMoveSection = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex >= 0 && newIndex < sections.length) {
        move(index, newIndex);
      }
    },
    [sections.length, move]
  );

  const toggleSectionExpanded = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  return (
    <FormProvider {...curriculumForm}>
      <div className="space-y-6 pb-20">
        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Course Curriculum</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Design your learning path. Organize your content into logical sections and engaging
              lessons.
            </p>
          </div>

          <Button
            size="lg"
            onClick={handleAddSection}
            disabled={sections.length >= 100}
            className="rounded-xl h-11 px-6 font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>

        {/* Stats Grid */}
        {sections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="md:col-span-3 bg-card rounded-xl p-5 border border-border shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatItem
                  label="Sections"
                  value={stats.totalSections}
                  icon={BookOpen}
                  color="text-blue-500"
                />
                <StatItem
                  label="Lessons"
                  value={stats.totalLessons}
                  icon={PlayCircle}
                  color="text-primary"
                />
                <StatItem
                  label="Total Duration"
                  value={formatDuration(stats.totalDuration)}
                  icon={Clock}
                  color="text-emerald-500"
                />
                <StatItem
                  label="Resources"
                  value={stats.totalContent}
                  icon={FileCheck}
                  color="text-amber-500"
                />
              </div>

              <div className="mt-6 pt-5 border-t border-border space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">Publication Readiness</span>
                  <Badge variant="secondary" className="rounded-lg px-2 py-0.5 text-[10px]">
                    {stats.completionPercentage}% Ready
                  </Badge>
                </div>
                <Progress
                  value={stats.completionPercentage}
                  className="h-1.5 rounded-full overflow-hidden"
                />
              </div>
            </div>

            <div className="bg-primary rounded-xl p-6 text-primary-foreground shadow-sm flex flex-col justify-center items-center text-center space-y-2">
              <Zap className="w-6 h-6 opacity-80" />
              <div>
                <p className="text-2xl font-bold">{stats.totalLessons}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                  Total Lessons
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Validation Feedback */}
        <ValidationAlert errors={validation.errors} warnings={validation.warnings} />

        {/* Sections Architecture */}
        <div className="space-y-4">
          {sections.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-xl bg-muted/30"
            >
              <div className="bg-background p-4 rounded-xl border shadow-sm mb-4">
                <BookOpen className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                Start Building Your Curriculum
              </h3>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
                Your curriculum is the heart of the learning experience. Add your first section to
                begin.
              </p>
              <Button size="lg" onClick={handleAddSection} className="rounded-xl h-11 px-8">
                Create First Section
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4 relative">
              <AnimatePresence mode="popLayout" initial={false}>
                {sections.map((section, index) => (
                  <motion.div
                    key={section.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    id={`section-${section.id}`}
                  >
                    <SectionEditor
                      sectionIndex={index}
                      courseId={courseId}
                      onToggleActive={() => toggleSectionExpanded(section.id)}
                      onRemove={() => handleRemoveSection(index)}
                      onMove={(direction) => handleMoveSection(index, direction)}
                      canMoveUp={index > 0}
                      canMoveDown={index < sections.length - 1}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Error Summary */}
        <AnimatePresence>
          {allErrors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-card border border-destructive/20 rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <h4 className="font-semibold text-sm">
                  Validation Summary ({allErrors.length} issues)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {allErrors.map((error, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleErrorClick(error.sectionIndex)}
                    className="text-left p-3 rounded-lg bg-destructive/5 border border-destructive/10 hover:border-destructive/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-destructive/70">
                        {error.path}
                      </span>
                      <ChevronRight className="w-3 h-3 text-destructive/40" />
                    </div>
                    <p className="text-xs font-medium text-foreground leading-snug">
                      {error.message}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Add Section */}
        {sections.length > 0 && (
          <div className="flex justify-center pt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={handleAddSection}
              className="rounded-xl border-dashed border-2 h-14 px-10 text-muted-foreground hover:text-primary hover:border-primary transition-all group"
            >
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
              Add Another Section
            </Button>
          </div>
        )}
      </div>
    </FormProvider>
  );
});

// Helper component for statistics
const StatItem = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5 mb-0.5">
      <div className={`${color} p-1 rounded-md bg-opacity-10 bg-current`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
    <p className="text-xl font-bold text-foreground">{value}</p>
  </div>
);

CurriculumTab.displayName = 'CurriculumTab';
