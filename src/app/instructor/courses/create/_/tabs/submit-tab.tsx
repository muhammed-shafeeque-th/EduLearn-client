'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  Eye,
  DollarSign,
  Send,
  Loader2,
  PlayCircle,
  BookOpen,
  Clock,
  FileText,
  Globe,
} from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { BasicInfoFormData, AdvancedInfoFormData } from '../schemas/course-schemas';
import { CurriculumFormData, Section, Lesson } from '../schemas/curriculum-schema';
import { calculateTotalDuration, formatDuration } from '../utils/curriculum-utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// Types for internal preview computation
interface CourseStats {
  totalDuration: number;
  totalLessons: number;
  totalSections: number;
  previewContent: number;
}

interface CoursePreview {
  title?: string;
  subtitle?: string;
  category?: string;
  level?: string;
  language?: string;
  learningOutcomes?: Array<{ text: string }>;
  stats: CourseStats;
}

interface SubmitTabProps {
  basicForm: UseFormReturn<BasicInfoFormData>;
  advancedForm: UseFormReturn<AdvancedInfoFormData>;
  curriculumForm: UseFormReturn<CurriculumFormData>;
  onFormSubmit: () => void;
  retrySubmit: () => void;
  isSubmitRetryable: () => boolean;
  isLoading: boolean;
  validationState: {
    basic: boolean;
    advanced: boolean;
    curriculum: boolean;
  };
}

// Utility: Compute course preview and stats from form data
function computeCoursePreview(
  basicForm: UseFormReturn<BasicInfoFormData>,
  advancedForm: UseFormReturn<AdvancedInfoFormData>,
  curriculumForm: UseFormReturn<CurriculumFormData>
): CoursePreview | null {
  const basicData = basicForm.getValues();
  const advancedData = advancedForm.getValues();
  const curriculumData = curriculumForm.getValues();

  // Defensive: curriculumData.sections might be undefined
  const sections: Section[] = curriculumData.sections || [];
  const totalDuration = calculateTotalDuration(sections);

  let totalLessons = 0;
  let previewContent = 0;
  const totalSections = sections.length;

  for (const section of sections) {
    const lessons: Lesson[] = section.lessons || [];
    totalLessons += lessons.length;
    for (const lesson of lessons) {
      if (lesson.content && lesson.content.isPreview) {
        previewContent += 1;
      }
    }
  }

  return {
    ...basicData,
    ...advancedData,
    ...curriculumData,
    stats: {
      totalDuration,
      totalLessons,
      totalSections,
      previewContent,
    },
  } as CoursePreview;
}

// ---

export const SubmitTab = React.memo(
  ({
    basicForm,
    advancedForm,
    curriculumForm,
    onFormSubmit,
    isSubmitRetryable,
    retrySubmit,
    isLoading,
    validationState,
  }: SubmitTabProps) => {
    // State for pricing
    const [pricing, setPricing] = useState<{
      price: number | undefined;
      discountPrice: number | undefined;
      currency: string;
    }>({
      price: basicForm.watch('price'),
      discountPrice: basicForm.watch('discountPrice'),
      currency: basicForm.watch('currency') || 'INR',
    });

    // State to track form validation results for all tabs
    const [validationResults, setValidationResults] = useState<{
      basic: boolean;
      advanced: boolean;
      curriculum: boolean;
    }>({ basic: false, advanced: false, curriculum: false });

    // Effect: Automatically validate the forms as their refs change
    useEffect(() => {
      let isMounted = true;

      const validateForms = async () => {
        const [basicValid, advancedValid, curriculumValid] = await Promise.all([
          basicForm.trigger(),
          advancedForm.trigger(),
          curriculumForm.trigger(),
        ]);

        if (isMounted) {
          setValidationResults({
            basic: basicValid,
            advanced: advancedValid,
            curriculum: curriculumValid,
          });
        }
      };

      validateForms();

      return () => {
        isMounted = false;
      };
    }, [basicForm, advancedForm, curriculumForm]);

    // Memo: Compute course preview from current form states
    const coursePreview = useMemo(() => {
      if (validationResults.basic && validationResults.advanced && validationResults.curriculum) {
        return computeCoursePreview(basicForm, advancedForm, curriculumForm);
      }
      return null;
    }, [
      validationResults.basic,
      validationResults.advanced,
      validationResults.curriculum,
      basicForm,
      advancedForm,
      curriculumForm,
      // BasicInfoFormData, AdvancedInfoFormData, CurriculumFormData could change (deeply) but form refs are stable
    ]);

    // Form error helpers
    const {
      setValue,
      formState: { errors },
      trigger,
      watch,
    } = basicForm;

    const basicData = watch();

    // Handle controlled numeric inputs, with number/undefined conversion
    const handleFieldUpdate = useCallback(
      async (field: keyof BasicInfoFormData, value: number | undefined) => {
        setValue(field, value);
        setPricing((prev) => ({
          ...prev,
          [field]: value,
        }));
        await trigger(field); // Trigger field validation
      },
      [setValue, trigger]
    );

    // Validation: Ready for Submit?
    const allValid =
      validationResults.basic && validationResults.advanced && validationResults.curriculum;

    // Error messages
    const priceError = errors.price?.message as string | undefined;
    const discountPriceError = errors.discountPrice?.message as string | undefined;

    // Checklist items for UI
    const validationItems = useMemo(
      () => [
        {
          section: 'Basic Information',
          isValid: validationState.basic,
          items: ['Course title', 'Category & level', 'Duration', 'Pricing'],
        },
        {
          section: 'Advanced Information',
          isValid: validationState.advanced,
          items: ['Description', 'Learning outcomes', 'Target audience'],
        },
        {
          section: 'Curriculum',
          isValid: validationState.curriculum,
          items: ['Sections & lessons', 'Content for lessons'],
        },
      ],
      [validationState]
    );

    // Discount computation
    const discountPercent =
      basicData.price && basicData.discountPrice && basicData.price > 0
        ? Math.round(
            ((Number(basicData.price) - Number(basicData.discountPrice)) /
              Number(basicData.price)) *
              100
          )
        : undefined;

    // Button handlers
    const handlePreviewClick = useCallback(() => {
      if (typeof window !== 'undefined') {
        import('@/hooks/use-toast').then(({ toast }) => {
          toast.info({
            title: 'Coming soon',
            description: 'Course preview will be available shortly.',
          });
        });
      }
    }, []);

    const handleSubmitClick = useCallback(() => {
      if (isSubmitRetryable()) {
        retrySubmit();
      } else {
        onFormSubmit();
      }
    }, [isSubmitRetryable, retrySubmit, onFormSubmit]);

    // ---

    return (
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Ready to Submit!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Review and Submit your course</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Validation Checklist */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Completion Checklist
              </h3>
              {validationItems.map((item, index) => (
                <motion.div
                  key={item.section}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-2 ${
                    item.isValid
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                      : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-center mb-3">
                    {item.isValid ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                    )}
                    <h4
                      className={`font-medium ${
                        item.isValid
                          ? 'text-green-900 dark:text-green-100'
                          : 'text-red-900 dark:text-red-100'
                      }`}
                    >
                      {item.section}
                    </h4>
                  </div>
                  <ul className="space-y-1">
                    {item.items.map((requirement, reqIndex) => (
                      <li
                        key={reqIndex}
                        className={`text-sm flex items-center ${
                          item.isValid
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-red-700 dark:text-red-300'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-2"></span>
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}

              {/* Pricing Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
              >
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-3 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Course Pricing
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label className="block text-sm text-yellow-800 dark:text-yellow-200 mb-1">
                      Price (₹)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={basicData.price ?? ''}
                      onChange={(e) =>
                        handleFieldUpdate(
                          'price',
                          e.target.value === '' ? undefined : parseFloat(e.target.value)
                        )
                      }
                      className={`w-full border-yellow-300 dark:border-yellow-700  ${priceError ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="1999.99"
                    />
                    {priceError && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {priceError}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="block text-sm text-yellow-800 dark:text-yellow-200 mb-1">
                      Discount Price (Optional)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={basicData.discountPrice ?? ''}
                      onChange={(e) =>
                        handleFieldUpdate(
                          'discountPrice',
                          e.target.value === '' ? undefined : parseFloat(e.target.value)
                        )
                      }
                      className={`w-full border-yellow-300 dark:border-yellow-700  ${discountPriceError ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="1499.99"
                    />
                    {discountPriceError && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {discountPriceError}
                      </p>
                    )}
                  </div>
                  {discountPercent !== undefined && (
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      Discount: {discountPercent}%
                    </div>
                  )}
                </div>
              </motion.div>
            </section>

            {/* Course Preview */}
            <section className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Course Preview
              </h3>
              {coursePreview ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-6"
                >
                  {/* Course Header */}
                  <div>
                    {coursePreview.title && (
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {coursePreview.title}
                      </h4>
                    )}
                    {coursePreview.subtitle && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                        {coursePreview.subtitle}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {coursePreview.category && (
                        <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded">
                          {coursePreview.category}
                        </span>
                      )}
                      {coursePreview.level && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                          {coursePreview.level}
                        </span>
                      )}
                      {coursePreview.language && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded">
                          {coursePreview.language}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Course Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                        <BookOpen className="w-4 h-4 mr-1" />
                        <span className="text-xs">Sections</span>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {coursePreview.stats.totalSections}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                        <PlayCircle className="w-4 h-4 mr-1" />
                        <span className="text-xs">Lessons</span>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {coursePreview.stats.totalLessons}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-xs">Duration</span>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatDuration(coursePreview.stats.totalDuration)}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                        <Eye className="w-4 h-4 mr-1" />
                        <span className="text-xs">Free Content</span>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {coursePreview.stats.previewContent}
                      </p>
                    </div>
                  </div>
                  {/* Learning Outcomes Preview */}
                  {Array.isArray(coursePreview.learningOutcomes) &&
                    coursePreview.learningOutcomes.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                          What you&apos;ll learn:
                        </h5>
                        <ul className="space-y-1">
                          {coursePreview.learningOutcomes.slice(0, 3).map((outcome, index) => (
                            <li
                              key={index}
                              className="text-sm text-gray-600 dark:text-gray-300 flex items-start"
                            >
                              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              {outcome.text}
                            </li>
                          ))}
                          {coursePreview.learningOutcomes.length > 3 && (
                            <li className="text-sm text-gray-500 dark:text-gray-400">
                              +{coursePreview.learningOutcomes.length - 3} more...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  {/* Pricing Preview */}
                  {basicData.price && (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Price:</span>
                        <div className="flex items-center space-x-2">
                          {basicData.discountPrice && (
                            <span className="text-gray-500 dark:text-gray-400 line-through text-sm">
                              ₹{basicData.price}
                            </span>
                          )}
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            ₹{basicData.discountPrice || basicData.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Complete all sections to see course preview
                  </p>
                </div>
              )}
              {/* Submiting Options */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  Submiting Options
                </h5>
                <div className="space-y-2">
                  <Label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 mr-2"
                    />
                    <span className="text-blue-800 dark:text-blue-200">
                      Make course discoverable in marketplace
                    </span>
                  </Label>
                  <Label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 mr-2"
                    />
                    <span className="text-blue-800 dark:text-blue-200">
                      Enable course reviews and ratings
                    </span>
                  </Label>
                  <Label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 mr-2"
                    />
                    <span className="text-blue-800 dark:text-blue-200">
                      Send notification to followers
                    </span>
                  </Label>
                </div>
              </div>
            </section>
          </div>
          {/* Submit Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 gap-4"
          >
            <div className="text-sm">
              {allValid ? (
                <span className="flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Ready to Submit
                </span>
              ) : (
                <span className="flex items-center text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Complete all sections to Submit
                </span>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handlePreviewClick}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                <Eye className="w-4 h-4 mr-2 inline" />
                Preview
              </button>
              <button
                type="button"
                onClick={handleSubmitClick}
                disabled={!allValid || !pricing.price || isLoading}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium inline-flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submiting...
                  </>
                ) : isSubmitRetryable() ? (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Retry Submit
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Course
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }
);

SubmitTab.displayName = 'SubmitTab';
