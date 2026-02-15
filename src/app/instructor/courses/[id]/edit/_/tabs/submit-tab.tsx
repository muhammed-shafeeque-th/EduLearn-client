/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  Eye,
  Globe,
  Clock,
  DollarSign,
  BookOpen,
  PlayCircle,
  FileText,
  Send,
  Loader2,
} from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { BasicInfoFormData, AdvancedInfoFormData } from '../schemas/course-schemas';
import { CurriculumFormData } from '../schemas/curriculum-schema';
import { calculateTotalDuration, formatDuration } from '../utils/curriculum-utils';
import { Label } from '@/components/ui/label';

interface SubmitTabProps {
  basicForm: UseFormReturn<BasicInfoFormData>;
  advancedForm: UseFormReturn<AdvancedInfoFormData>;
  curriculumForm: UseFormReturn<CurriculumFormData>;
  onFormSubmit: () => void;
  retrySubmit: () => void;
  isSubmitRetryable: boolean;
  isLoading: boolean;
}

export const SubmitTab: React.FC<SubmitTabProps> = ({
  basicForm,
  advancedForm,
  curriculumForm,
  onFormSubmit,
  isSubmitRetryable,
  retrySubmit,
  isLoading,
}) => {
  const [validationResults, setValidationResults] = useState<{
    basic: boolean;
    advanced: boolean;
    curriculum: boolean;
  }>({ basic: false, advanced: false, curriculum: false });
  const price = basicForm.watch('price');
  const discountPrice = basicForm.watch('discountPrice');

  const priceError = basicForm.formState.errors?.price?.message as string | undefined;
  const discountPriceError = basicForm.formState.errors?.discountPrice?.message as
    | string
    | undefined;

  const [coursePreview, setCoursePreview] = useState<any>(null);

  useEffect(() => {
    // Validate all forms
    const validateForms = async () => {
      const basicValid = await basicForm.trigger();
      const advancedValid = await advancedForm.trigger();
      const curriculumValid = await curriculumForm.trigger();

      setValidationResults({
        basic: basicValid,
        advanced: advancedValid,
        curriculum: curriculumValid,
      });

      // Generate course preview
      if (basicValid && advancedValid && curriculumValid) {
        const basicData = basicForm.getValues();
        const advancedData = advancedForm.getValues();
        const curriculumData = curriculumForm.getValues();

        const totalDuration = calculateTotalDuration(curriculumData.sections || []);
        const totalLessons =
          curriculumData.sections?.reduce(
            (sum, section) => sum + (section.lessons?.length || 0),
            0
          ) || 0;

        setCoursePreview({
          ...basicData,
          ...advancedData,
          ...curriculumData,
          stats: {
            totalDuration,
            totalLessons,
            totalSections: curriculumData.sections?.length || 0,
            previewContent:
              curriculumData.sections?.reduce(
                (sum, section) =>
                  sum +
                  (section.lessons?.reduce(
                    (lessonSum, lesson) => lessonSum + (lesson.content?.isPreview ? 1 : 0),
                    0
                  ) || 0),
                0
              ) || 0,
          },
        });
      }
    };

    validateForms();
  }, [basicForm, advancedForm, curriculumForm]);

  const validationItems = [
    {
      section: 'Basic Information',
      isValid: validationResults.basic,
      items: [
        'Course title',
        'Course category and subcategory',
        'Course level',
        'Course language',
        'Course duration',
      ],
    },
    {
      section: 'Advanced Information',
      isValid: validationResults.advanced,
      items: [
        'Course thumbnail',
        'Course description',
        'Learning outcomes (at least 4)',
        'Target audience',
        'Course requirements',
      ],
    },
    {
      section: 'Curriculum',
      isValid: validationResults.curriculum,
      items: [
        'At least one section',
        'At least one lesson per section',
        'Content for each lesson',
        'Proper naming for all components',
      ],
    },
  ];

  const allValid =
    validationResults.basic && validationResults.advanced && validationResults.curriculum;

  // const handleSubmit = () => {
  //   if (!allValid) {
  //     toast.error('Please complete all required sections before Submitting');
  //     return;
  //   }
  //   if (!pricing.price) {
  //     toast.error('Please set a price for your course');
  //     return;
  //   }
  //   onFormSubmit();
  // };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Ready to Submit!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Review your course details and Submit it to make it available to students worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Validation Checklist */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Course Completion Checklist
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Course Pricing
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Price (INR)
                  </Label>
                  <input
                    type="number"
                    value={basicForm.watch('price') ?? ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : Number(e.target.value);
                      basicForm.setValue('price', value!, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="1999.99"
                    min="0"
                    step="0.01"
                  />
                  {priceError && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {priceError}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Discount Price (Optional)
                  </Label>
                  <input
                    type="number"
                    value={basicForm.watch('discountPrice') ?? ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : Number(e.target.value);
                      basicForm.setValue('discountPrice', value!, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="1779.99"
                    min="0"
                    step="0.01"
                  />

                  {discountPriceError && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {discountPriceError}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Course Preview */}
          <div className="space-y-6">
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
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {coursePreview.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    {coursePreview.subtitle}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded">
                      {coursePreview.category}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                      {coursePreview.level}
                    </span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded">
                      {coursePreview.language}
                    </span>
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
                {coursePreview.learningOutcomes && coursePreview.learningOutcomes.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      What you&apos;ll learn:
                    </h5>
                    <ul className="space-y-1">
                      {coursePreview.learningOutcomes
                        .slice(0, 3)
                        .map((outcome: any, index: number) => (
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
                {price && (
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Price:</span>
                      <div className="flex items-center space-x-2">
                        {discountPrice && (
                          <span className="text-gray-500 dark:text-gray-400 line-through text-sm">
                            ₹{price}
                          </span>
                        )}
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          ₹{discountPrice || price}
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

            {/* Submitting Options */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                Submitting Options
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
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {allValid ? (
              <span className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Ready to Submit
              </span>
            ) : (
              <span className="flex items-center text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 mr-1" />
                Complete all sections to Submit
              </span>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2 inline" />
              Preview Course
            </button>

            <button
              onClick={() => (isSubmitRetryable ? retrySubmit() : onFormSubmit())}
              disabled={!allValid || !price || isLoading}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitRetryable ? 'Retry Submit' : 'Submit Course'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
