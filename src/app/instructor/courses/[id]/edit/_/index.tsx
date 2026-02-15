'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FileText, Users, CheckCircle2 } from 'lucide-react';

import { CourseHeader } from './components/course-header';
import { TabId, TabNavigation } from './components/tab-navigation';
import { BasicInformationTab } from './tabs/basic-information-tab';
import { AdvancedInformationTab } from './tabs/advanced-information';
import { CurriculumTab } from './tabs/curriculum-tab';
import { SubmitTab } from './tabs/submit-tab';
import { ActionButtons } from './components/action-button';
import { useCourseForm } from './hooks/use-course-form';
import { ANIMATION_VARIANTS } from './utils/constants';
import { useFieldArray, UseFieldArrayReturn, UseFormReturn } from 'react-hook-form';
import { CurriculumFormData } from './schemas/curriculum-schema';
import { BasicInfoFormData } from './schemas/course-schemas';
import { Course } from '@/types/course';
import { useState } from 'react';
import { useCourseController } from './hooks/use-course-controller';

type CourseEditorProps = { course: Course };

export const CourseEditor = ({ course }: CourseEditorProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const {
    basicForm,
    advancedForm,
    curriculumForm,
    learningFields,
    audienceFields,
    requirementFields,
    appendLearning,
    appendAudience,
    appendRequirement,
    removeLearning,
    removeAudience,
    removeRequirement,
  } = useCourseForm({ course });

  const sectionsArray = useFieldArray({
    control: curriculumForm.control,
    name: 'sections',
  });

  const controller = useCourseController({
    courseId: course.id,
    instructorId: course.instructorId,
    basicForm: basicForm as UseFormReturn<BasicInfoFormData>,
    advancedForm,
    curriculumForm: curriculumForm as UseFormReturn<CurriculumFormData>,
    sectionsArray: sectionsArray as UseFieldArrayReturn<CurriculumFormData, 'sections'>,
  });

  const handleSave = async () => {
    await controller.saveBasicAdvanced();
  };

  const handleSaveAndNext = async () => {
    let isValid = false;

    switch (activeTab) {
      case 'basic':
        isValid = await controller.validateForm('basic');
        if (!isValid) return;
        await controller.saveBasicAdvanced();
        setActiveTab('advanced');
        break;

      case 'advanced':
        isValid = await controller.validateForm('advanced');
        if (!isValid) return;
        await controller.saveBasicAdvanced();
        setActiveTab('curriculum');
        break;

      case 'curriculum':
        isValid = await controller.validateForm('curriculum');
        if (!isValid) return;
        // Curriculum changes are tracked automatically via controller
        setActiveTab('submit');
        break;
    }
  };

  const handleSaveAndPreview = async () => {
    await handleSave();
    window.open(`/course/${course.id}/preview`, '_blank');
  };

  const handlePrevious = () => {
    const tabOrder: TabId[] = ['basic', 'advanced', 'curriculum', 'submit'];
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  };

  const handlePublish = async () => {
    await controller.publishCourse();
  };

  const handleClearForm = () => {
    if (controller.hasUnsavedChanges()) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to clear all data?'
      );
      if (!confirmed) return;
    }

    basicForm.reset();
    advancedForm.reset();
    curriculumForm.reset();
    controller.clearPending();
    setActiveTab('basic');
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tabs: { id: TabId; label: string; icon: any; completed: boolean }[] = [
    { id: 'basic', label: 'Basic Information', icon: BookOpen, completed: false },
    { id: 'advanced', label: 'Advanced Information', icon: FileText, completed: false },
    { id: 'curriculum', label: 'Curriculum', icon: Users, completed: false },
    { id: 'submit', label: 'Submit Course', icon: CheckCircle2, completed: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <CourseHeader clearFormData={handleClearForm} isLoading={controller.isLoading} />

      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                courseId={course.id}
              />
            </motion.div>
          )}

          {activeTab === 'curriculum' && (
            <motion.div key="curriculum" {...ANIMATION_VARIANTS.slideIn}>
              <CurriculumTab
                curriculumForm={curriculumForm as UseFormReturn<CurriculumFormData>}
                courseId={course.id!}
                controller={controller}
              />
            </motion.div>
          )}

          {activeTab === 'submit' && (
            <motion.div key="submit" {...ANIMATION_VARIANTS.slideIn}>
              <SubmitTab
                basicForm={basicForm as UseFormReturn<BasicInfoFormData>}
                advancedForm={advancedForm}
                curriculumForm={curriculumForm as UseFormReturn<CurriculumFormData>}
                onFormSubmit={handlePublish}
                isSubmitRetryable={controller.getResults().some((r) => !r.success)}
                retrySubmit={controller.retryFailed}
                isLoading={controller.isLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <ActionButtons
          activeTab={activeTab}
          isLoading={controller.isLoading}
          onSave={handleSave}
          onSaveAndNext={handleSaveAndNext}
          onSaveAndPreview={handleSaveAndPreview}
          onPrevious={handlePrevious}
          hasUnsavedChanges={controller.hasUnsavedChanges}
          disabled={activeTab === 'submit'}

          // showPublish={activeTab === 'submit'}
          // onPublish={handlePublish}
        />
      </main>
    </div>
  );
};
