'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, AlertCircle, Plus, CheckCircle, Save } from 'lucide-react';
import { useWatch, UseFormReturn } from 'react-hook-form';
import { CurriculumFormData } from '../schemas/curriculum-schema';
import { SectionEditor } from '../components/editors/section-editor';
import { calculateTotalDuration } from '../utils/curriculum-utils';
import { CourseControllerAPI } from '../hooks/use-course-controller';
import { getDocument } from '@/lib/utils';

interface CurriculumTabProps {
  curriculumForm: UseFormReturn<CurriculumFormData>;
  courseId: string;
  controller: CourseControllerAPI;
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

interface ValidationIssue {
  type: 'error' | 'warning';
  path: string;
  message: string;
  sectionIndex?: number;
  lessonIndex?: number;
}

const ValidationAlert: React.FC<{
  issues: ValidationIssue[];
  onIssueClick: (issue: ValidationIssue) => void;
}> = ({ issues, onIssueClick }) => {
  const errors = issues.filter((i) => i.type === 'error');
  // const warnings = issues.filter((i) => i.type === 'warning');

  if (issues.length === 0) return null;

  return (
    <div className="space-y-2">
      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-red-800 dark:text-red-200 mb-2">
                {errors.length} Validation Error{errors.length !== 1 ? 's' : ''}
              </p>
              <ul className="space-y-1.5">
                {errors.slice(0, 5).map((error, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => onIssueClick(error)}
                      className="w-full text-left text-sm text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 hover:underline transition-colors"
                    >
                      <span className="font-medium">{error.path}:</span> {error.message}
                    </button>
                  </li>
                ))}
                {errors.length > 5 && (
                  <li className="text-sm text-red-600 dark:text-red-400">
                    +{errors.length - 5} more errors
                  </li>
                )}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* {warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                {warnings.length} Recommendation{warnings.length !== 1 ? 's' : ''}
              </p>
              <ul className="space-y-1.5">
                {warnings.slice(0, 3).map((warning, idx) => (
                  <li key={idx} className="text-sm text-amber-700 dark:text-amber-300">
                    <span className="font-medium">{warning.path}:</span> {warning.message}
                  </li>
                ))}
                {warnings.length > 3 && (
                  <li className="text-sm text-amber-600 dark:text-amber-400">
                    +{warnings.length - 3} more recommendations
                  </li>
                )}
              </ul>
            </div>
          </div>
        </motion.div>
      )} */}
    </div>
  );
};

export const CurriculumTab = ({ curriculumForm, courseId, controller }: CurriculumTabProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showValidation, setShowValidation] = useState(false);

  const {
    control,
    formState: { errors },
    trigger,
  } = curriculumForm;

  // Watch sections in real-time for stats
  const watchedSections = useWatch({
    control,
    name: 'sections',
    defaultValue: [],
  });

  const sections = useMemo(() => watchedSections || [], [watchedSections]);
  const pendingCount = useMemo(() => controller.getPendingCount(), [controller]);

  // STATS CALCULATION

  const stats: CurriculumStats = useMemo(() => {
    const totalLessons = sections.reduce((sum, s) => sum + (s.lessons?.length || 0), 0);
    const totalContent = sections.reduce(
      (sum, s) => sum + (s.lessons?.reduce((lSum, l) => lSum + (l.content ? 1 : 0), 0) || 0),
      0
    );
    const totalQuizzes = sections.filter((s) => s.quiz).length;
    const publishedSections = sections.filter((s) => s.isPublished).length;
    const publishedLessons = sections.reduce(
      (sum, s) => sum + (s.lessons?.filter((l) => l.isPublished).length || 0),
      0
    );

    return {
      totalSections: sections.length,
      totalLessons,
      totalContent,
      totalQuizzes,
      totalDuration: calculateTotalDuration(sections),
      publishedSections,
      publishedLessons,
      completionPercentage:
        sections.length > 0 ? Math.round((publishedSections / sections.length) * 100) : 0,
    };
  }, [sections]);

  // VALIDATION

  const validationIssues: ValidationIssue[] = useMemo(() => {
    const issues: ValidationIssue[] = [];

    // Global validation
    if (stats.totalSections < 2) {
      issues.push({
        type: 'error',
        path: 'Curriculum',
        message: 'At least 2 sections required',
      });
    }

    if (stats.totalLessons < 3) {
      issues.push({
        type: 'warning',
        path: 'Curriculum',
        message: 'At least 3 lessons recommended for a complete course',
      });
    }

    if (stats.totalContent === 0) {
      issues.push({
        type: 'error',
        path: 'Content',
        message: 'Add content to at least one lesson',
      });
    }

    if (stats.totalDuration === 0) {
      issues.push({
        type: 'warning',
        path: 'Duration',
        message: 'No course duration calculated',
      });
    }

    // Section-level validation
    sections.forEach((section, sectionIdx) => {
      if (!section.title?.trim()) {
        issues.push({
          type: 'error',
          path: `Section ${sectionIdx + 1}`,
          message: 'Title is required',
          sectionIndex: sectionIdx,
        });
      }

      if (!section.lessons || section.lessons.length === 0) {
        issues.push({
          type: 'error',
          path: `Section ${sectionIdx + 1}`,
          message: 'At least one lesson required',
          sectionIndex: sectionIdx,
        });
      }

      // Lesson-level validation
      section.lessons?.forEach((lesson, lessonIdx) => {
        if (!lesson.title?.trim()) {
          issues.push({
            type: 'error',
            path: `Section ${sectionIdx + 1} → Lesson ${lessonIdx + 1}`,
            message: 'Lesson title required',
            sectionIndex: sectionIdx,
            lessonIndex: lessonIdx,
          });
        }

        if (!lesson.content) {
          issues.push({
            type: 'error',
            path: `Section ${sectionIdx + 1} → Lesson ${lessonIdx + 1}`,
            message: 'Lesson content required',
            sectionIndex: sectionIdx,
            lessonIndex: lessonIdx,
          });
        }

        if (!lesson.estimatedDuration || lesson.estimatedDuration === 0) {
          issues.push({
            type: 'warning',
            path: `Section ${sectionIdx + 1} → Lesson ${lessonIdx + 1}`,
            message: 'Estimated duration recommended',
            sectionIndex: sectionIdx,
            lessonIndex: lessonIdx,
          });
        }
      });

      // Quiz validation
      if (section.quiz) {
        if (!section.quiz.title?.trim()) {
          issues.push({
            type: 'error',
            path: `Section ${sectionIdx + 1} → Quiz`,
            message: 'Quiz title required',
            sectionIndex: sectionIdx,
          });
        }

        if (!section.quiz.questions || section.quiz.questions.length === 0) {
          issues.push({
            type: 'error',
            path: `Section ${sectionIdx + 1} → Quiz`,
            message: 'At least one question required',
            sectionIndex: sectionIdx,
          });
        }
      }
    });

    return issues;
  }, [sections, stats]);

  // const hasErrors = validationIssues.some((i) => i.type === 'error');

  const handleAddSection = useCallback(() => {
    const newSection = controller.createSection({
      title: `Section ${sections.length + 1}`,
      description: '',
      lessons: [],
      isPublished: true,
      order: sections.length,
    });

    // Auto-expand new section
    setExpandedSections((prev) => new Set(prev).add(newSection.id));

    // Scroll to new section
    setTimeout(() => {
      const element = getDocument()?.getElementById(`section-${newSection.id}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, [controller, sections.length]);

  const handleValidateAll = useCallback(async () => {
    setShowValidation(true);
    const isValid = await trigger('sections');

    if (!isValid) {
      // Scroll to first error
      const firstError = validationIssues.find((i) => i.type === 'error');
      if (firstError?.sectionIndex !== undefined) {
        const sectionId = sections[firstError.sectionIndex]?.id;
        if (sectionId) {
          setExpandedSections((prev) => new Set(prev).add(sectionId));
          setTimeout(() => {
            const element = getDocument()?.getElementById(`section-${sectionId}`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
      }
    }

    return isValid;
  }, [trigger, validationIssues, sections]);

  const handleIssueClick = useCallback(
    (issue: ValidationIssue) => {
      if (issue.sectionIndex !== undefined) {
        const sectionId = sections[issue.sectionIndex]?.id;
        if (sectionId) {
          setExpandedSections((prev) => new Set(prev).add(sectionId));
          setTimeout(() => {
            const element = getDocument()?.getElementById(`section-${sectionId}`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
      }
    },
    [sections]
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

  const getSectionError = useCallback(
    (index: number) => {
      return errors.sections?.[index];
    },
    [errors.sections]
  );

  // RENDER

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course Curriculum</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Build your course structure with sections, lessons, and quizzes
          </p>
        </div>

        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Save className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {pendingCount} unsaved change
                {pendingCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          <button
            onClick={handleAddSection}
            disabled={sections.length >= 100}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-blue-500 text-white rounded-xl hover:from-primary/90 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Section
          </button>
        </div>
      </motion.div>

      {/* Stats Summary */}
      {/* {sections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Curriculum Summary
            </h3>
            {hasErrors ? (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <XCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Incomplete</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Ready</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-3xl font-bold text-primary mb-1">{stats.totalSections}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Section{stats.totalSections !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-3xl font-bold text-primary mb-1">{stats.totalLessons}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Lessons</p>
            </div>

            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-3xl font-bold text-primary mb-1">
                {formatDuration(stats.totalDuration)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
            </div>

            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-3xl font-bold text-primary mb-1">{stats.totalQuizzes}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quizzes</p>
            </div>
          </div> */}

      {/* Progress Bar */}
      {/* <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Publication Progress
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {stats.publishedSections} / {stats.totalSections} sections
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${stats.completionPercentage}%` }}
              />
            </div>
          </div>
        </motion.div>
      )} */}

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
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Start creating your course by adding sections, lessons, and quizzes. Each section
              should contain related lessons on a specific topic.
            </p>
            <button
              onClick={handleAddSection}
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Section
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                id={`section-${section.id}`}
              >
                <SectionEditor
                  controller={controller}
                  control={control}
                  sectionIndex={index}
                  courseId={courseId}
                  isActive={expandedSections.has(section.id)}
                  onToggleActive={() => toggleSectionExpanded(section.id)}
                  canMoveUp={index > 0}
                  canMoveDown={index < sections.length - 1}
                  sectionError={getSectionError(index)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Validation Issues */}
      {showValidation && validationIssues.length > 0 && (
        <ValidationAlert issues={validationIssues} onIssueClick={handleIssueClick} />
      )}

      {/* Add Another Section Button */}
      {sections.length > 0 && sections.length < 100 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center pt-4"
        >
          <button
            onClick={handleAddSection}
            className="inline-flex items-center px-8 py-4 border-2 border-dashed border-primary/40 dark:border-primary/60 text-primary dark:text-primary-foreground rounded-xl hover:border-primary dark:hover:border-primary-foreground hover:bg-primary/5 dark:hover:bg-primary/10 transition-all font-medium group"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Add Another Section
          </button>
        </motion.div>
      )}

      {/* Validation Button */}
      {sections.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
          <button
            onClick={handleValidateAll}
            className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:border-primary hover:text-primary transition-all font-medium"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Validate Curriculum
          </button>
        </motion.div>
      )}
    </div>
  );
};

CurriculumTab.displayName = 'CurriculumTab';
