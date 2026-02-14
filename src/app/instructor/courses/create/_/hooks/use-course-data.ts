/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { courseService } from '@/services/course.service';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage, sleep } from '@/lib/utils';
import { useAbortController } from './use-abort-controller';
import { AdvancedInfoFormData, BasicInfoFormData } from '../schemas/course-schemas';
import { CurriculumFormData, Lesson, Quiz } from '../schemas/curriculum-schema';
import { LessonPayload, QuizPayload, CoursePayload } from '@/types/course';
import { TabId } from '../components/tab-navigation';

interface CourseDataProps {
  basicForm: UseFormReturn<BasicInfoFormData>;
  advancedForm: UseFormReturn<AdvancedInfoFormData>;
  curriculumForm: UseFormReturn<CurriculumFormData>;
  saveFormData: () => void;
  clearSavedData: () => void;
}

interface ValidationState {
  basic: boolean;
  advanced: boolean;
  curriculum: boolean;
}

interface SubmissionError {
  id: string;
  section: string;
  message: string;
  retryable: boolean;
  operation?: () => Promise<void>;
  meta?: Record<string, unknown>;
}

const BATCH_SIZE = 5;
const RETRY_MAX = 2;
const RETRY_DELAY = 1000;

function useFormChangeEffect<T extends FieldValues>(
  form: UseFormReturn<T>,
  setHasUnsavedChanges: (c: boolean) => void
) {
  useEffect(() => {
    const subscription = form.watch(() => setHasUnsavedChanges(true));
    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, [form, setHasUnsavedChanges]);
}

function isRetryableFromMessage(message?: string): boolean {
  if (!message) return true;
  const lower = message.toLowerCase();
  return !(lower.includes('validation') || lower.includes('required') || lower.includes('400'));
}

function mapToQuizPayload(quiz: Quiz): QuizPayload {
  return {
    title: quiz.title,
    description: quiz.description,
    maxAttempts: quiz.maxAttempts,
    showResults: quiz.showResults,
    isRequired: quiz.isRequired,
    timeLimit: quiz.timeLimit,
    passingScore: quiz.passingScore,
    questions: quiz.questions.map((q) => ({
      question: q.question,
      type: q.type,
      explanation: q.explanation,
      points: q.points,
      required: q.required,
      timeLimit: q.timeLimit,
      options: q.options.map((opt) => ({
        value: opt.text ?? '',
        isCorrect: opt.isCorrect,
      })),
    })),
  };
}

function mapToLessonPayload(lesson: Lesson): LessonPayload {
  const { content } = lesson;
  return {
    isPreview: content?.isPreview,
    description: lesson.description,
    estimatedDuration: lesson.estimatedDuration,
    order: lesson.order,
    title: lesson.title,
    isPublished: lesson.isPublished,
    contentType: content!.type!,
    contentUrl: ['video', 'document', 'audio'].includes(content?.type ?? '')
      ? (content?.file?.url as string)
      : content!.url!,
    metadata: {
      title: content?.file?.name,
      fileName: ['video', 'document', 'audio'].includes(content?.type ?? '')
        ? content?.file?.name
        : undefined,
      mimeType: ['video', 'document', 'audio'].includes(content?.type ?? '')
        ? content?.file?.type
        : undefined,
      fileSize:
        ['video', 'document', 'audio'].includes(content?.type ?? '') && content?.file?.size
          ? parseInt(content?.file?.size as any)
          : undefined,
      url: ['video', 'document', 'audio'].includes(content?.type ?? '')
        ? content?.file?.url
        : (content?.url ?? undefined),
    },
    id: '',
  };
}

export function useCourseData({
  basicForm,
  advancedForm,
  curriculumForm,
  saveFormData,
  clearSavedData,
}: CourseDataProps) {
  // State management
  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [validationState, setValidationState] = useState<ValidationState>({
    basic: false,
    advanced: false,
    curriculum: false,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const router = useRouter();
  const { signal, abort } = useAbortController();
  const submissionErrorsRef = useRef<SubmissionError[]>([]);
  const sectionIdMapRef = useRef<Map<string, string>>(new Map());

  // Watch form changes to trigger unsaved changes flag
  useFormChangeEffect(basicForm, setHasUnsavedChanges);
  useFormChangeEffect(advancedForm, setHasUnsavedChanges);
  useFormChangeEffect(curriculumForm, setHasUnsavedChanges);

  const validateAllForms = useCallback(async (): Promise<ValidationState> => {
    const [basic, advanced, curriculum] = await Promise.all([
      basicForm.trigger(),
      advancedForm.trigger(),
      curriculumForm.trigger(),
    ]);
    const state = { basic, advanced, curriculum };
    setValidationState(state);
    return state;
  }, [basicForm, advancedForm, curriculumForm]);

  const collectCoursePayload = useCallback((): CoursePayload => {
    const basic = basicForm.getValues();
    const advanced = advancedForm.getValues();
    return {
      courseId: basic.courseId,
      title: basic.title,
      subTitle: basic.subTitle,
      category: basic.category,
      subCategory: basic.subCategory,
      language: basic.language,
      subtitleLanguage: basic.subtitleLanguage,
      level: basic.level,
      price: basic.price,
      discountPrice: basic.discountPrice,
      currency: basic.currency,
      durationUnit: basic.duration?.unit,
      durationValue: basic.duration?.value,
      topics: basic.topics,
      description: advanced.description,
      thumbnail: advanced.thumbnail,
      trailer: advanced.trailer,
      learningOutcomes: advanced.learningOutcomes?.map((o) => o.text) || [],
      targetAudience: advanced.targetAudience?.map((o) => o.text) || [],
      requirements: advanced.requirements?.map((o) => o.text) || [],
    };
  }, [basicForm, advancedForm]);

  /**
   * Retry helper - best practice: handle exponential backoff and signal cancellation
   */
  const executeWithRetry = useCallback(
    async <T = any>(
      operation: () => Promise<T>,
      context: string,
      maxRetries: number = RETRY_MAX
    ): Promise<T> => {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (signal.aborted) throw new Error('Operation cancelled');
        try {
          return await operation();
        } catch (error) {
          if (attempt === maxRetries) {
            throw { original: error, attempts: attempt + 1, context };
          }
          await sleep(RETRY_DELAY * Math.pow(2, attempt));
        }
      }
      throw new Error('Unreachable code in executeWithRetry');
    },
    [signal]
  );

  /**
   * Process in batches - best practice: avoid overwhelming server/resources
   */
  const processBatch = useCallback(
    async <T>(
      items: T[],
      processor: (item: T, idx: number) => Promise<void>,
      onProgress?: (completed: number, total: number) => void,
      getOperation?: (item: T, idx: number) => (() => Promise<void>) | undefined
    ) => {
      const total = items.length;
      let completedCount = 0;

      for (let i = 0; i < total; i += BATCH_SIZE) {
        if (signal.aborted) break;
        const batch = items.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
          batch.map((item, idxInBatch) => processor(item, i + idxInBatch))
        );
        results.forEach((result, j) => {
          completedCount++;
          if (result.status === 'rejected') {
            const idx = i + j;
            const item = batch[j];
            const msg = getErrorMessage(result.reason);
            submissionErrorsRef.current.push({
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              section: 'Curriculum',
              message: msg,
              retryable: isRetryableFromMessage(msg),
              operation: getOperation?.(item, idx),
              meta: { idx },
            });
          }
        });
        onProgress?.(completedCount, total);
      }
      return {
        total,
        completed: completedCount,
        errors: [...submissionErrorsRef.current],
      };
    },
    [signal]
  );

  /**
   * Creates the most basic course info via API, sets courseId on form, and saves state
   */
  const createCourseBasicData = useCallback(async () => {
    setIsLoading(true);
    try {
      const basic = basicForm.getValues();
      const response = await courseService.createCourse(
        {
          title: basic.title,
          subTitle: basic.subTitle,
          category: basic.category,
          subCategory: basic.subCategory,
          subtitleLanguage: basic.subtitleLanguage,
          language: basic.language,
          level: basic.level,
          price: basic.price,
          discountPrice: basic.discountPrice,
          currency: basic.currency,
          durationUnit: basic.duration?.unit,
          durationValue: basic.duration?.value,
          topics: basic.topics,
        },
        { retry: 0, signal }
      );
      if (!response.success) throw new Error(response.message || 'Failed to create course');
      const courseId = response.data?.id;
      basicForm.setValue('courseId', courseId);
      setHasUnsavedChanges(false);
      saveFormData();
      toast.success({ title: 'Course created', description: 'Ready to add content' });
      return courseId;
    } catch (error) {
      toast.error({
        title: 'Failed to create course',
        description: getErrorMessage(error, 'Something went wrong'),
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [basicForm, saveFormData, signal]);

  /**
   * Updates course info via API if there are unsaved changes
   */
  const updateCourseData = useCallback(async () => {
    if (!hasUnsavedChanges) return;
    setIsLoading(true);
    try {
      saveFormData();
      const payload = collectCoursePayload();
      if (!payload.courseId) throw new Error('Course ID required for update');
      const response = await courseService.updateCourse(payload.courseId, payload, {
        retry: 0,
        signal,
      });
      if (!response.success) throw new Error(response.message || 'Failed to update course');
      setHasUnsavedChanges(false);
      toast.success({ title: 'Course updated', description: 'Changes saved successfully' });
      return response.data;
    } catch (error) {
      toast.error({ title: 'Failed to update course', description: getErrorMessage(error) });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [collectCoursePayload, hasUnsavedChanges, saveFormData, signal]);

  /**
   * Handles curriculum batch creation process (sections, lessons, quizzes)
   */
  const submitCurriculum = useCallback(
    async (courseId: string) => {
      setIsLoading(true);
      submissionErrorsRef.current = [];
      sectionIdMapRef.current.clear();
      try {
        const curriculum = curriculumForm.getValues();

        // Step : Create sections
        await processBatch(
          curriculum.sections || [],
          async (section) => {
            if (signal.aborted) throw new Error('Operation cancelled');
            const response = await executeWithRetry(
              () =>
                courseService.createSection(courseId, {
                  title: section.title,
                  description: section.description,
                  order: section.order ?? 0,
                  isPublished: section.isPublished,
                }),
              `Section: ${section.title}`
            );
            if (response?.success && response.data?.id) {
              sectionIdMapRef.current.set(section.id, response.data.id);
            } else {
              throw new Error(response?.message || 'Failed to create section');
            }
          },
          undefined,
          (section) => async () => {
            const response = await courseService.createSection(courseId, {
              title: section.title,
              description: section.description,
              order: section.order ?? 0,
              isPublished: section.isPublished,
            });
            if (!response.success) throw new Error(response.message || 'Failed');
          }
        );

        // Step : Create lessons
        const lessonEntries =
          (curriculum.sections || []).flatMap((section) => {
            const sectionId = sectionIdMapRef.current.get(section.id);
            if (!sectionId) return [];
            return (section.lessons || []).map((lesson) => ({ lesson, sectionId }));
          }) || [];
        await processBatch(
          lessonEntries,
          async ({ lesson, sectionId }) => {
            if (signal.aborted) throw new Error('Operation cancelled');
            await executeWithRetry(
              () => courseService.createLesson(courseId, sectionId, mapToLessonPayload(lesson)),
              `Lesson: ${lesson.title}`
            );
          },
          undefined,
          (entry) => async () => {
            const { lesson, sectionId } = entry;
            const response = await courseService.createLesson(
              courseId,
              sectionId,
              mapToLessonPayload(lesson)
            );
            if (!response.success) throw new Error(response.message || 'Failed');
          }
        );

        // Step : Create quizzes
        const quizEntries =
          (curriculum.sections || [])
            .filter((s) => s.quiz)
            .flatMap((section) => {
              const sectionId = sectionIdMapRef.current.get(section.id);
              if (!sectionId) return [];
              return [{ quiz: section.quiz, sectionId }];
            }) || [];
        await processBatch(
          quizEntries,
          async ({ quiz, sectionId }) => {
            if (signal.aborted) throw new Error('Operation cancelled');
            if (!quiz) return;
            await executeWithRetry(
              () => courseService.createQuiz(courseId, sectionId, mapToQuizPayload(quiz)),
              `Quiz: ${quiz.title}`
            );
          },
          undefined,
          (entry) => async () => {
            const { quiz, sectionId } = entry;
            if (!quiz) return;
            const response = await courseService.createQuiz(
              courseId,
              sectionId,
              mapToQuizPayload(quiz)
            );
            if (!response.success) throw new Error(response.message || 'Failed');
          }
        );

        // Handle errors summary
        if (submissionErrorsRef.current.length > 0) {
          const retryableErrors = submissionErrorsRef.current.filter((e) => e.retryable);
          if (retryableErrors.length > 0) {
            toast.warning({
              title: `${retryableErrors.length} items need retry`,
              description: 'Click retry to complete submission',
            });
            return false;
          }
          toast.error({
            title: 'Some items failed',
            description: 'Some curriculum items failed and require manual fix',
          });
          return false;
        }

        return true;
      } catch (error) {
        const msg = getErrorMessage(error);
        toast.error({
          title: 'Failed to create curriculum',
          description: msg,
        });
        submissionErrorsRef.current.push({
          id: Date.now().toString(),
          section: 'Curriculum',
          message: msg,
          retryable: isRetryableFromMessage(msg),
          operation: undefined,
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [curriculumForm, executeWithRetry, processBatch, signal]
  );

  /**
   * Publish handler - validates, creates, submits all, and navigates
   */
  const submitCourseForm = useCallback(async () => {
    setIsLoading(true);
    try {
      const validation = await validateAllForms();
      if (!validation.basic || !validation.advanced || !validation.curriculum) {
        toast.error({
          title: 'Validation failed',
          description: 'Please complete all sections',
        });
        return;
      }
      let courseId = basicForm.getValues().courseId;
      if (!courseId) {
        courseId = await createCourseBasicData();
        if (!courseId) throw new Error('Failed to create course');
      }
      // await updateCourseData();
      const curriculumSuccess = await submitCurriculum(courseId);
      if (!curriculumSuccess) return;
      const payload = collectCoursePayload();
      const response = await courseService.updateCourse(courseId, {
        ...payload,
      });
      if (response.success) {
        clearSavedData();
        basicForm.reset();
        advancedForm.reset();
        curriculumForm.reset();
        toast.success({
          title: 'Course saved successfully',
          description: 'Your course is all set',
        });
        setTimeout(() => router.push(`/instructor/courses/${courseId}`), 1000);
      } else {
        throw new Error(response.message || 'Failed to submit');
      }
    } catch (error) {
      // Security: do not expose sensitive error, show message and log error in debug
      console.error('Submit failed:', error);
      toast.error({ title: 'Course submit failed', description: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  }, [
    validateAllForms,
    // basicForm,
    basicForm,
    advancedForm,
    curriculumForm,
    createCourseBasicData,
    // updateCourseData,
    submitCurriculum,
    collectCoursePayload,
    clearSavedData,
    router,
  ]);

  /**
   * Retry handler for failures during curriculum submission
   */
  const retrySubmitCourseForm = useCallback(async () => {
    if (submissionErrorsRef.current.length === 0) {
      await submitCourseForm();
      return;
    }
    setIsLoading(true);
    const retryableErrors = submissionErrorsRef.current.filter((e) => e.retryable && e.operation);
    try {
      const results = await Promise.allSettled(retryableErrors.map((e) => e.operation!()));
      const failures = results.filter((r) => r.status === 'rejected');
      if (failures.length === 0) {
        submissionErrorsRef.current = submissionErrorsRef.current.filter((e) => !e.retryable);
        toast.success({ title: 'All retried items submitted successfully' });
        await submitCourseForm();
      } else {
        toast.error({
          title: `${failures.length} items still failing`,
          description: 'Please review and try again',
        });
      }
    } catch (error) {
      toast.error({
        title: 'Retry failed',
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, [submitCourseForm]);

  /**
   * Checks if any submission error is retryable
   */
  const isSubmitRetryable = useCallback((): boolean => {
    return submissionErrorsRef.current.some((e) => e.retryable);
  }, []);

  /**
   * Save and continue to next tab - improves navigation UX and guarantees saved state
   */
  const onSaveAndNext = useCallback(async () => {
    setIsLoading(true);
    try {
      const tabOrder: TabId[] = ['basic', 'advanced', 'curriculum', 'publish'];
      const currentIndex = tabOrder.indexOf(activeTab);
      if (currentIndex === -1) return;

      let isValid = false;

      const showValidationErrorToast = () => {
        toast.error({
          title: 'Validation Error',
          description: 'Please fill in all required fields before continuing.',
        });
      };

      switch (activeTab) {
        case 'basic': {
          isValid = await basicForm.trigger(undefined, { shouldFocus: true });
          if (!isValid) {
            showValidationErrorToast();
            break;
          }
          const basicData = basicForm.getValues();
          if (!basicData.courseId) {
            await createCourseBasicData();
          } else {
            await updateCourseData();
          }
          setHasUnsavedChanges(false);
          setActiveTab(tabOrder[currentIndex + 1]);
          break;
        }
        case 'advanced': {
          isValid = await advancedForm.trigger(undefined, { shouldFocus: true });
          if (!isValid) {
            showValidationErrorToast();
            break;
          }
          await updateCourseData();
          setHasUnsavedChanges(false);
          setActiveTab(tabOrder[currentIndex + 1]);
          break;
        }
        case 'curriculum': {
          isValid = await curriculumForm.trigger(undefined, { shouldFocus: true });
          if (!isValid) {
            showValidationErrorToast();
            break;
          }
          saveFormData();
          setHasUnsavedChanges(false);
          setActiveTab(tabOrder[currentIndex + 1]);
          break;
        }
        default:
          break;
      }
    } catch (error) {
      toast.error({
        title: 'Error',
        description: getErrorMessage(error),
      });
      // Logging for debugging purposes
      console.error('Navigation failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [
    activeTab,
    basicForm,
    advancedForm,
    curriculumForm,
    createCourseBasicData,
    updateCourseData,
    saveFormData,
    setActiveTab,
    setHasUnsavedChanges,
  ]);

  /**
   * Saves all form data, validates all, and triggers save feedback UX
   */
  const onSave = useCallback(async () => {
    setIsLoading(true);
    try {
      const isValid = await validateAllForms();
      if (!Object.values(isValid).every(Boolean)) {
        toast.error({
          title: 'Validation failed',
          description: 'Please fill in all required fields',
        });
        return;
      }
      const basicData = basicForm.getValues();
      if (!basicData.courseId) {
        await createCourseBasicData();
      } else {
        await updateCourseData();
      }
      setHasUnsavedChanges(false);
      toast.success({ title: 'Saved', description: 'All changes saved successfully' });
    } catch (error) {
      toast.error({ title: 'Save failed', description: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  }, [validateAllForms, basicForm, createCourseBasicData, updateCourseData]);

  /**
   * Handles saving and opening preview, validating existence of course ID
   */
  const onSaveAndPreview = useCallback(async () => {
    try {
      await onSave();
      const courseId = basicForm.getValues()?.courseId;
      if (!courseId) {
        toast.error({ title: "Can't preview course before creation" });
        return;
      }
      window.open(`/course/preview/${courseId}`, '_blank');
    } catch (error) {
      // Only log, don't toast to user because onSave already handles errors
      console.error('Preview failed:', error);
    }
  }, [onSave, basicForm]);

  /**
   * Clears all form states and related saved data, error, and resets navigation
   */
  const clearFormData = useCallback(() => {
    try {
      // Reset forms to defaults
      basicForm.reset();
      advancedForm.reset();
      curriculumForm.reset();

      // Clear local/draft data
      clearSavedData();

      // Reset state
      setActiveTab('basic');
      setHasUnsavedChanges(false);

      // Clear error and maps
      submissionErrorsRef.current = [];
      sectionIdMapRef.current.clear();

      toast.success({
        title: 'All course data cleared',
        description: 'All form fields and unsaved data have been cleared.',
      });
    } catch (error) {
      toast.error({
        title: 'Failed to clear course data',
        description: getErrorMessage(error),
      });
    }
  }, [basicForm, advancedForm, curriculumForm, clearSavedData]);

  // Cleanup on unmount, abort pending ops
  useEffect(() => {
    return () => {
      abort();
      submissionErrorsRef.current = [];
      sectionIdMapRef.current.clear();
    };
  }, [abort]);

  // Expose all control handlers/state
  return {
    activeTab,
    setActiveTab,
    isLoading,
    validationState,
    hasUnsavedChanges,
    isSubmitRetryable,
    submitCourseForm,
    retrySubmitCourseForm,
    onSave,
    onSaveAndNext,
    onSaveAndPreview,
    clearFormData,
  };
}
