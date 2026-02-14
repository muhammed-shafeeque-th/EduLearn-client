'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  FileText,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useCallback, useMemo, Suspense, useEffect } from 'react';
import { TabId, TabNavigation } from './components/tab-navigation';
import { BasicInformationTab } from './tabs/basic-information-tab';
import { AdvancedInformationTab } from './tabs/advanced-information';
import { CurriculumTab } from './tabs/curriculum-tab';
import { SubmitTab } from './tabs/submit-tab';
import { ActionButtons } from './components/action-button';
import { useCourseForm } from './hooks/use-course-form';
import { useCourseData } from './hooks/use-course-data';
import { ErrorBoundary } from '@/components/error-boundary';
import { UseFormReturn } from 'react-hook-form';
import { BasicInfoFormData } from './schemas/course-schemas';
import { CurriculumFormData } from './schemas/curriculum-schema';
import { CurriculumSkeleton } from './components/skeletons/curriculum-skelton';
import CourseCreatorErrorFallback from '../error';

const ANIMATION_VARIANTS = {
  slideIn: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
};

interface Tab {
  id: 'basic' | 'advanced' | 'curriculum' | 'publish';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
}

export const CourseCreator = () => {
  const {
    basicForm,
    advancedForm,
    curriculumForm,
    learningFields,
    audienceFields,
    requirementFields,
    appendAudience,
    appendLearning,
    removeLearning,
    removeAudience,
    removeRequirement,
    appendRequirement,

    saveFormData,
    clearSavedData,
  } = useCourseForm();

  const {
    isLoading,
    isSubmitRetryable,
    retrySubmitCourseForm,
    submitCourseForm,
    onSave,
    onSaveAndNext,
    onSaveAndPreview,
    activeTab,
    setActiveTab,
    hasUnsavedChanges,
    validationState,
    clearFormData,
  } = useCourseData({
    basicForm: basicForm as UseFormReturn<BasicInfoFormData>,
    advancedForm,
    curriculumForm: curriculumForm as UseFormReturn<CurriculumFormData>,
    saveFormData,
    clearSavedData,
  });

  const courseId = (basicForm as UseFormReturn<BasicInfoFormData>).watch('courseId');

  const tabs: Tab[] = useMemo(
    () => [
      {
        id: 'basic',
        label: 'Basic Information',
        icon: BookOpen,
        completed: validationState.basic,
      },
      {
        id: 'advanced',
        label: 'Advanced Information',
        icon: FileText,
        completed: validationState.advanced,
      },
      {
        id: 'curriculum',
        label: 'Curriculum',
        icon: Users,
        completed: validationState.curriculum,
      },
      {
        id: 'publish',
        label: 'Publish Course',
        icon: CheckCircle2,
        completed: false,
      },
    ],
    [validationState]
  );

  const handleTabChange = useCallback(
    (tabId: TabId) => {
      const currentIndex = tabs.findIndex((t) => t.id === activeTab);
      const newIndex = tabs.findIndex((t) => t.id === tabId);

      if (newIndex < currentIndex) {
        setActiveTab(tabId);
        return;
      }

      if (!courseId && tabId !== 'basic') {
        return;
      }

      setActiveTab(tabId);
    },
    [courseId, activeTab, tabs, setActiveTab]
  );

  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    },
    [hasUnsavedChanges]
  );

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [handleBeforeUnload]);

  return (
    <ErrorBoundary fallback={<CourseCreatorErrorFallback />}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="sticky top-0 z-40  bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className=" container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Course</h1>
                {hasUnsavedChanges && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center mt-1">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Unsaved changes
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={clearFormData}
                  disabled={isLoading}
                  className="flex items-center text-red-700 dark:text-red-300 px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/10 border border-red-200 dark:border-red-700 focus:outline-none text-sm transition"
                  title="Clear all course data"
                  aria-label="Clear all course data"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </button>
                {isLoading && (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-sm text-primary">Saving...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isLoading={isLoading}
            disabled={!courseId && activeTab === 'basic'}
          />
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorBoundary>
            <AnimatePresence mode="wait">
              {activeTab === 'basic' && (
                <motion.div key="basic" {...ANIMATION_VARIANTS.slideIn}>
                  <BasicInformationTab form={basicForm as UseFormReturn<BasicInfoFormData>} />
                </motion.div>
              )}

              {activeTab === 'advanced' && (
                <motion.div key="advanced" {...ANIMATION_VARIANTS.slideIn}>
                  <AdvancedInformationTab
                    form={advancedForm}
                    learningFields={learningFields}
                    audienceFields={audienceFields}
                    requirementFields={requirementFields}
                    appendLearning={appendLearning}
                    appendAudience={appendAudience}
                    appendRequirement={appendRequirement}
                    removeLearning={removeLearning}
                    removeAudience={removeAudience}
                    removeRequirement={removeRequirement}
                    courseId={courseId!}
                  />
                </motion.div>
              )}

              {activeTab === 'curriculum' && (
                <motion.div key="curriculum" {...ANIMATION_VARIANTS.slideIn}>
                  <Suspense fallback={<CurriculumSkeleton />}>
                    <CurriculumTab
                      curriculumForm={curriculumForm as UseFormReturn<CurriculumFormData>}
                      courseId={courseId!}
                    />
                  </Suspense>
                </motion.div>
              )}

              {activeTab === 'publish' && (
                <motion.div key="publish" {...ANIMATION_VARIANTS.slideIn}>
                  <SubmitTab
                    basicForm={basicForm as UseFormReturn<BasicInfoFormData>}
                    advancedForm={advancedForm}
                    curriculumForm={curriculumForm as UseFormReturn<CurriculumFormData>}
                    onFormSubmit={submitCourseForm}
                    isSubmitRetryable={isSubmitRetryable}
                    retrySubmit={retrySubmitCourseForm}
                    isLoading={isLoading}
                    validationState={validationState}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </ErrorBoundary>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <ActionButtons
              activeTab={activeTab}
              isLoading={isLoading}
              onSave={onSave}
              onSaveAndNext={onSaveAndNext}
              onSaveAndPreview={onSaveAndPreview}
              onPrevious={() => {
                const tabOrder: Array<TabId> = ['basic', 'advanced', 'curriculum', 'publish'];
                const currentIndex = tabOrder.indexOf(activeTab);
                if (currentIndex > 0) {
                  handleTabChange(tabOrder[currentIndex - 1]);
                }
              }}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          </motion.div>
        </main>
      </div>
    </ErrorBoundary>
  );
};
