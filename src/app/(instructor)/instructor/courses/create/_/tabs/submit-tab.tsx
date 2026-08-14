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
import { CurriculumFormData, Module, Lesson } from '../schemas/curriculum-schema';
import { calculateTotalDuration, formatDuration } from '../utils/curriculum-utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface CourseStats {
  totalDuration: number;
  totalLessons: number;
  totalModules: number;
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

// Helper Components
const PreviewStat = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) => (
  <div className="bg-background dark:bg-muted/50 p-2.5 rounded-xl border border-border shadow-sm">
    <div className="flex items-center text-muted-foreground mb-1">
      <Icon className="w-3 h-3 mr-1.5 opacity-70" />
      <span className="text-[10px] uppercase tracking-wider font-semibold">{label}</span>
    </div>
    <p className="text-xs font-bold text-foreground leading-none">{value}</p>
  </div>
);

const OptionToggle = ({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-xs font-medium text-foreground/80">{label}</span>
    <Switch defaultChecked={defaultChecked} />
  </div>
);

function computeCoursePreview(
  basicForm: UseFormReturn<BasicInfoFormData>,
  advancedForm: UseFormReturn<AdvancedInfoFormData>,
  curriculumForm: UseFormReturn<CurriculumFormData>
): CoursePreview | null {
  const basicData = basicForm.getValues();
  const advancedData = advancedForm.getValues();
  const curriculumData = curriculumForm.getValues();

  const modules: Module[] = curriculumData.modules || [];
  const totalDuration = calculateTotalDuration(modules);

  let totalLessons = 0;
  let previewContent = 0;
  const totalModules = modules.length;

  for (const $module of modules) {
    const lessons: Lesson[] = $module.lessons || [];
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
      totalModules,
      previewContent,
    },
  } as CoursePreview;
}

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
    const [pricing, setPricing] = useState<{
      price: number | undefined;
      discountPrice: number | undefined;
      currency: string;
    }>({
      price: basicForm.watch('price'),
      discountPrice: basicForm.watch('discountPrice'),
      currency: basicForm.watch('currency') || 'INR',
    });

    const [validationResults, setValidationResults] = useState<{
      basic: boolean;
      advanced: boolean;
      curriculum: boolean;
    }>({ basic: false, advanced: false, curriculum: false });

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
    ]);

    const {
      setValue,
      formState: { errors },
      trigger,
      watch,
    } = basicForm;

    const basicData = watch();

    const handleFieldUpdate = useCallback(
      async (field: keyof BasicInfoFormData, value: number | undefined) => {
        setValue(field, value);
        setPricing((prev) => ({
          ...prev,
          [field]: value,
        }));
        await trigger(field);
      },
      [setValue, trigger]
    );

    const allValid =
      validationResults.basic && validationResults.advanced && validationResults.curriculum;

    const priceError = errors.price?.message as string | undefined;
    const discountPriceError = errors.discountPrice?.message as string | undefined;

    const validationItems = useMemo(
      () => [
        {
          module: 'Basic Information',
          isValid: validationState.basic,
          items: ['Course title', 'Category & level', 'Duration', 'Pricing'],
        },
        {
          module: 'Advanced Information',
          isValid: validationState.advanced,
          items: ['Description', 'Learning outcomes', 'Target audience'],
        },
        {
          module: 'Curriculum',
          isValid: validationState.curriculum,
          items: ['Modules & lessons', 'Content for lessons'],
        },
      ],
      [validationState]
    );

    const discountPercent =
      basicData.price && basicData.discountPrice && basicData.price > 0
        ? Math.round(
            ((Number(basicData.price) - Number(basicData.discountPrice)) /
              Number(basicData.price)) *
              100
          )
        : undefined;

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

    return (
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl shadow-sm border border-border p-8"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Ready to Submit!</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Review and finalize your course details
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Validation Checklist */}
            <section className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Completion Checklist</h3>
              <div className="grid grid-cols-1 gap-4">
                {validationItems.map((item, index) => (
                  <motion.div
                    key={item.module}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-xl border ${
                      item.isValid
                        ? 'border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10'
                        : 'border-destructive/20 bg-destructive/5'
                    }`}
                  >
                    <div className="flex items-center mb-3">
                      {item.isValid ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-destructive mr-2" />
                      )}
                      <h4
                        className={`text-sm font-semibold ${
                          item.isValid ? 'text-green-900 dark:text-green-100' : 'text-destructive'
                        }`}
                      >
                        {item.module}
                      </h4>
                    </div>
                    <ul className="space-y-1.5">
                      {item.items.map((requirement, reqIndex) => (
                        <li
                          key={reqIndex}
                          className={`text-xs flex items-center ${
                            item.isValid
                              ? 'text-green-700 dark:text-green-300'
                              : 'text-destructive/70'
                          }`}
                        >
                          <span className="w-1 h-1 rounded-full bg-current mr-2 opacity-50"></span>
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              {/* Pricing Section */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl"
              >
                <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-4 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Course Pricing
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-amber-800 dark:text-amber-300">
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
                      className={`h-11 rounded-xl bg-background border-amber-200 dark:border-amber-900/50 ${priceError ? 'border-destructive ring-destructive' : ''}`}
                      placeholder="e.g. 1999"
                    />
                    {priceError && (
                      <p className="text-[10px] text-destructive font-medium flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {priceError}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                      Discount Price
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
                      className={`h-11 rounded-xl bg-background border-amber-200 dark:border-amber-900/50 ${discountPriceError ? 'border-destructive ring-destructive' : ''}`}
                      placeholder="e.g. 1499"
                    />
                    {discountPriceError && (
                      <p className="text-[10px] text-destructive font-medium flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {discountPriceError}
                      </p>
                    )}
                  </div>
                </div>
                {discountPercent !== undefined && (
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Calculated Discount: {discountPercent}% OFF
                  </p>
                )}
              </motion.div>
            </section>

            {/* Course Preview */}
            <section className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Course Preview</h3>
              {coursePreview ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-muted/30 rounded-xl p-6 border border-border"
                >
                  {/* Course Header */}
                  <div className="space-y-3 mb-6">
                    {coursePreview.title && (
                      <h4 className="text-lg font-bold text-foreground leading-tight">
                        {coursePreview.title}
                      </h4>
                    )}
                    {coursePreview.subtitle && (
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {coursePreview.subtitle}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {coursePreview.category && (
                        <Badge variant="secondary" className="rounded-lg font-semibold">
                          {coursePreview.category}
                        </Badge>
                      )}
                      {coursePreview.level && (
                        <Badge variant="outline" className="rounded-lg font-semibold capitalize">
                          {coursePreview.level}
                        </Badge>
                      )}
                      {coursePreview.language && (
                        <Badge variant="outline" className="rounded-lg font-semibold">
                          {coursePreview.language}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {/* Course Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <PreviewStat
                      icon={BookOpen}
                      label="Modules"
                      value={coursePreview.stats.totalModules}
                    />
                    <PreviewStat
                      icon={PlayCircle}
                      label="Lessons"
                      value={coursePreview.stats.totalLessons}
                    />
                    <PreviewStat
                      icon={Clock}
                      label="Duration"
                      value={formatDuration(coursePreview.stats.totalDuration)}
                    />
                    <PreviewStat
                      icon={Eye}
                      label="Free Content"
                      value={coursePreview.stats.previewContent}
                    />
                  </div>

                  {/* Learning Outcomes Preview */}
                  {Array.isArray(coursePreview.learningOutcomes) &&
                    coursePreview.learningOutcomes.length > 0 && (
                      <div className="space-y-3 mb-6 pt-6 border-t border-border">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          What you&apos;ll learn
                        </h5>
                        <ul className="space-y-2">
                          {coursePreview.learningOutcomes.slice(0, 3).map((outcome, index) => (
                            <li key={index} className="text-xs text-foreground/80 flex items-start">
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary mr-2 mt-0.5 shrink-0" />
                              <span className="line-clamp-2">{outcome.text}</span>
                            </li>
                          ))}
                          {coursePreview.learningOutcomes.length > 3 && (
                            <li className="text-[10px] font-semibold text-muted-foreground pl-5 pt-1">
                              + {coursePreview.learningOutcomes.length - 3} more outcomes
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  {/* Pricing Preview */}
                  {basicData.price && (
                    <div className="border-t border-border pt-5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground">
                          Investment:
                        </span>
                        <div className="text-right">
                          {basicData.discountPrice && (
                            <span className="text-xs text-muted-foreground line-through mr-2">
                              ₹{basicData.price}
                            </span>
                          )}
                          <span className="text-xl font-bold text-foreground">
                            ₹{basicData.discountPrice || basicData.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="bg-muted/30 rounded-xl p-10 text-center border border-dashed border-border min-h-[300px] flex flex-col items-center justify-center">
                  <div className="bg-background p-4 rounded-xl shadow-sm border mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground max-w-[200px]">
                    Complete all modules to see your course preview
                  </p>
                </div>
              )}
              {/* Submiting Options */}
              <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
                <h5 className="text-sm font-semibold text-primary mb-4 flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  Distribution Options
                </h5>
                <div className="space-y-3">
                  <OptionToggle label="Make course discoverable in marketplace" defaultChecked />
                  <OptionToggle label="Enable course reviews and ratings" defaultChecked />
                  <OptionToggle label="Send notification to followers" />
                </div>
              </div>
            </section>
          </div>
          {/* Submit Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col sm:flex-row items-center justify-between mt-10 pt-8 border-t border-border gap-6"
          >
            <div className="flex items-center gap-3">
              {allValid ? (
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500" />
                </div>
              ) : (
                <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {allValid ? 'Everything looks good!' : 'Requirements pending'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {allValid
                    ? 'You are ready to publish your course.'
                    : 'Please fix the issues in the checklist.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePreviewClick}
                className="rounded-xl h-12 px-6 flex-1 sm:flex-none"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                size="lg"
                onClick={handleSubmitClick}
                disabled={!allValid || !pricing.price || isLoading}
                className="rounded-xl h-12 px-8 flex-1 sm:flex-none shadow-lg shadow-primary/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : isSubmitRetryable() ? (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Retry Submit
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Publish Course
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }
);

SubmitTab.displayName = 'SubmitTab';
