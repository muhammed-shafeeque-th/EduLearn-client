'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, AlertCircle, Plus, XCircle } from 'lucide-react';
import { Controller, useFieldArray, UseFormReturn, useWatch } from 'react-hook-form';
import { CurriculumFormData, Section } from '../schemas/curriculum-schema';
import { SectionEditor } from '../components/editors/section-editor';
import { formatDuration, calculateTotalDuration } from '../utils/curriculum-utils';
import { useExtractZodErrors } from '../hooks/use-extract-error-message';
import { getDocument } from '@/lib/utils';

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
  // Only display the first 3 errors/warnings for brevity per best UX
  return (
    <>
      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-3 mb-1 flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-200 mb-1 text-sm">
              Validation Issue{errors.length > 1 && 's'}:
            </p>
            <ul className="space-y-0.5">
              {errors.slice(0, 3).map((error, idx) => (
                <li key={idx} className="text-xs text-red-700 dark:text-red-300 flex items-center">
                  <span className="w-1 h-1 bg-current rounded-full mr-2 inline-block" />
                  {error}
                </li>
              ))}
              {errors.length > 3 && (
                <li className="text-xs text-red-500">+{errors.length - 3} more</li>
              )}
            </ul>
          </div>
        </motion.div>
      )}
      {warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded p-3 mb-1 flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200 mb-1 text-xs">
              Recommendation{warnings.length > 1 && 's'}:
            </p>
            <ul className="space-y-0.5">
              {warnings.slice(0, 3).map((warning, idx) => (
                <li
                  key={idx}
                  className="text-xs text-amber-700 dark:text-amber-300 flex items-center"
                >
                  <span className="w-1 h-1 bg-current rounded-full mr-2 inline-block" />
                  {warning}
                </li>
              ))}
              {warnings.length > 3 && (
                <li className="text-xs text-amber-500">+{warnings.length - 3} more</li>
              )}
            </ul>
          </div>
        </motion.div>
      )}
    </>
  );
};

export const CurriculumTab = React.memo(({ curriculumForm, courseId }: CurriculumTabProps) => {
  const [, setExpandedSections] = useState<Set<string>>(new Set());

  const {
    control,
    formState: { errors },
    trigger,
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

  // Real-time form values for curr. stats & validation w/o stale values.
  const watchedSections = useWatch({ control, name: 'sections', defaultValue: [] });
  const currentSections = useMemo(() => watchedSections || [], [watchedSections]);

  const allErrors = useExtractZodErrors(errors);

  // Memoized stats calculation
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

  // Validation logic (move to a custom hook if logic grows.)
  const validation: ValidationResult = useMemo(() => {
    const vErrors: string[] = [];
    const vWarnings: string[] = [];

    if (stats.totalSections <= 1) {
      vErrors.push('At least 2 sections required');
    }
    if (stats.totalLessons < 3) {
      vWarnings.push('At least 3 lessons recommended');
    }
    if (stats.totalContent === 0) {
      vErrors.push('Add content to lessons');
    }
    if (stats.totalDuration === 0) {
      vWarnings.push('No course duration calculated');
    }
    currentSections.forEach((section, idx) => {
      if (!section.title?.trim()) {
        vErrors.push(`Section ${idx + 1}: Title required`);
      }
      section.lessons?.forEach((lesson, lIdx) => {
        if (!lesson.title?.trim()) {
          vErrors.push(`Section ${idx + 1}, Lesson ${lIdx + 1}: Name required`);
        }
        if (!lesson.content) {
          vErrors.push(`Section ${idx + 1}, Lesson ${lIdx + 1}: Add content`);
        }
      });
    });

    return {
      isValid: vErrors.length === 0,
      warnings: vWarnings,
      errors: vErrors,
    };
  }, [stats, currentSections]);

  // Debounced validation to avoid excessive trigger calls on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      trigger('sections');
    }, 400);
    return () => clearTimeout(timer);
  }, [currentSections, trigger]);

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
    setExpandedSections((prev) => new Set([...prev, newSection.id]));
  }, [sections.length, append]);

  const handleRemoveSection = useCallback(
    async (index: number) => {
      const sectionId = sections[index]?.id;
      remove(index);
      setExpandedSections((prev) => {
        const next = new Set(prev);
        next.delete(sectionId);
        return next;
      });
    },
    [remove, sections]
  );

  const handleErrorClick = (sectionIndex?: number) => {
    if (sectionIndex !== undefined) {
      const sectionId = sections[sectionIndex]?.id;
      if (sectionId) {
        setExpandedSections((prev) => new Set([...prev, sectionId]));
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

  const getSectionError = useCallback(
    (index: number) => {
      return errors.sections?.[index];
    },
    [errors.sections]
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
    <div className="space-y-6">
      {/* Header with stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course Curriculum</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Build your course structure with sections, lessons, and assessments
          </p>
        </div>

        <button
          onClick={handleAddSection}
          disabled={sections.length >= 100}
          className="inline-flex items-center px-6 py-3 bg-linear-to-r from-primary to-blue-500 text-white rounded-xl hover:from-primary/90 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          aria-label="Add new section"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Section
        </button>
      </motion.div>

      {/* Curriculum Summary */}
      {sections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Curriculum Summary
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary mb-1">{stats.totalSections}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Section{stats.totalSections !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold text-primary mb-1">{stats.totalLessons}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Lessons</p>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold text-primary mb-1">
                {formatDuration(stats.totalDuration)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold text-primary mb-1">{stats.completionPercentage}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Publication Progress
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {stats.publishedSections} / {stats.totalSections}
              </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-linear-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${stats.completionPercentage}%`,
                }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Modern, concise validation alerts */}
      <ValidationAlert errors={validation.errors} warnings={validation.warnings} />

      {/* Sections List */}
      <div className="space-y-4">
        {sections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800/50"
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Build Your Curriculum
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start by adding your first section
            </p>

            <button
              onClick={handleAddSection}
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Section
            </button>
          </motion.div>
        ) : (
          <AnimatePresence>
            {sections.map((section, index) => (
              <Controller
                key={section.id}
                name={`sections.${index}`}
                control={control}
                render={({ field }) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    id={`section-${section.id}`}
                  >
                    <SectionEditor
                      section={field.value}
                      sectionIndex={index}
                      courseId={courseId}
                      onToggleActive={() => toggleSectionExpanded(section.id)}
                      onUpdate={async (updates) => {
                        field.onChange({ ...field.value, ...updates });
                      }}
                      onRemove={() => handleRemoveSection(index)}
                      onMove={(direction) => handleMoveSection(index, direction)}
                      canMoveUp={index > 0}
                      canMoveDown={index < sections.length - 1}
                      sectionError={getSectionError(index)}
                      triggerValidation={trigger}
                    />
                  </motion.div>
                )}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Global Validation Errors */}
      {allErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 mt-2"
        >
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1 text-sm">
                There{' '}
                {allErrors.length === 1
                  ? 'is 1 validation error'
                  : `are ${allErrors.length} validation errors`}
              </h4>
              <ul className="space-y-1">
                {allErrors.map((error, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => handleErrorClick(error.sectionIndex)}
                      className="w-full text-left rounded hover:bg-red-100/80 dark:hover:bg-red-900/40 transition-colors group py-0.5 px-1"
                      type="button"
                    >
                      <div className="flex items-start space-x-2">
                        <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs font-medium text-red-700 dark:text-red-300 block">
                            {error.path}
                          </span>
                          <span className="text-xs text-red-600 dark:text-red-400">
                            {error.message}
                          </span>
                        </div>
                        <span className="text-xs text-red-600 dark:text-red-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Go to error →
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Add Section Button */}
      {sections.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center pt-6"
        >
          <button
            onClick={handleAddSection}
            disabled={sections.length >= 100}
            className="inline-flex items-center px-8 py-4 border-2 border-dashed border-primary/30 dark:border-primary text-primary dark:text-primary-foreground rounded-xl hover:border-primary dark:hover:border-primary-foreground hover:bg-primary/5 dark:hover:bg-primary/10 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Another Section
          </button>
        </motion.div>
      )}
    </div>
  );
});

CurriculumTab.displayName = 'CurriculumTab';
