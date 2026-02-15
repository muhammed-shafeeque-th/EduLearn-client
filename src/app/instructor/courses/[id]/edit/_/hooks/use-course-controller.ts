'use client';

import { useRef, useCallback, useState, useEffect, useLayoutEffect } from 'react';
import type { UseFieldArrayReturn, UseFormReturn } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { CourseController, CourseControllerConfig } from '../utils/course-controller';
import type {
  Section,
  Lesson,
  Quiz,
  CurriculumFormData,
  Content,
} from '../schemas/curriculum-schema';
import type { BasicInfoFormData, AdvancedInfoFormData } from '../schemas/course-schemas';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debug = (label: string, ...data: any[]) => {
  // if (process.env.NODE_ENV === 'development') {
  if (data.length) {
    console.groupCollapsed(`[CourseController DEBUG] ${label}`);
    data.forEach((entry, idx) => {
      console.log(`Arg${data.length > 1 ? ` [${idx}]` : ''}:`, entry);
    });
    // console.trace();
    console.groupEnd();
  } else {
    console.log(`[CourseController DEBUG] ${label}`);
    // console.trace();
  }
  // }
};

export interface UseCourseControllerProps {
  courseId: string;
  instructorId: string;
  basicForm: UseFormReturn<BasicInfoFormData>;
  advancedForm: UseFormReturn<AdvancedInfoFormData>;
  curriculumForm: UseFormReturn<CurriculumFormData>;
  sectionsArray: UseFieldArrayReturn<CurriculumFormData, 'sections'>;
}

export function useCourseController(props: UseCourseControllerProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const controllerRef = useRef<CourseController | null>(null);

  if (controllerRef.current === null) {
    const config: CourseControllerConfig = {
      ...props,
      onBeforeCommit: (_ops) => true,
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.detail(props.courseId) });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.courses.byInstructor(props.instructorId),
        });
      },
      onSuccess: (message: string) => {
        toast.success({ title: message });
      },
      onError: (message: string) => {
        toast.error({ title: 'Error', description: message });
      },
    };
    controllerRef.current = new CourseController(config);
  }

  const controller = controllerRef.current!;

  useLayoutEffect(() => {
    controller.updateConfig({
      ...props,
      onBeforeCommit: (_ops) => true,
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.detail(props.courseId) });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.courses.byInstructor(props.instructorId),
        });
      },
      onSuccess: (message: string) => toast.success({ title: message }),
      onError: (message: string) => toast.error({ title: 'Error', description: message }),
    });
  });

  useEffect(() => {
    return () => {
      debug('Abort commit on unmount');
      controller.abortCommit?.();
    };
  }, [controller]);

  // BASIC OPERATIONS
  const saveBasicAdvanced = useCallback(async (): Promise<boolean> => {
    debug('saveBasicAdvanced - called');
    setIsSaving(true);
    try {
      const result = await controller.saveBasicAdvanced();
      debug('saveBasicAdvanced - result', result);
      return result;
    } finally {
      setIsSaving(false);
    }
  }, [controller]);

  // SECTION OPERATIONS
  const createSection = useCallback(
    (data: Omit<Section, 'id'>) => {
      debug('createSection - called', data);
      const ret = controller.createSection(data);
      debug('createSection - return', ret);
      return ret;
    },
    [controller]
  );

  const updateSectionField = useCallback(
    <T extends keyof Section>(sectionIdx: number, key: T, value: Section[T]): void => {
      debug('updateSectionField - called', { sectionIdx, key, value });
      controller.updateSectionField(sectionIdx, key, value);
    },
    [controller]
  );

  const deleteSection = useCallback(
    (sectionIdx: number) => {
      debug('deleteSection - called', sectionIdx);
      controller.deleteSection(sectionIdx);
    },
    [controller]
  );

  const reorderSections = useCallback(
    (fromIndex: number, toIndex: number) => {
      debug('reorderSections - called', { fromIndex, toIndex });
      controller.reorderSections(fromIndex, toIndex);
    },
    [controller]
  );

  // LESSON OPERATIONS
  const createLesson = useCallback(
    (sectionIdx: number, data: Omit<Lesson, 'id'>) => {
      debug('createLesson - called', { sectionIdx, data });
      const ret = controller.createLesson(sectionIdx, data);
      debug('createLesson - return', ret);
      return ret;
    },
    [controller]
  );

  const updateLessonField = useCallback(
    <T extends keyof Lesson>(
      sectionIdx: number,
      lessonIdx: number,
      key: T,
      value: Lesson[T]
    ): void => {
      debug('updateLessonField - called', { sectionIdx, lessonIdx, key, value });
      controller.updateLessonField(sectionIdx, lessonIdx, key, value);
    },
    [controller]
  );

  const addLessonContent = useCallback(
    (sectionIdx: number, lessonIdx: number, content: Omit<Content, 'id'>): void => {
      debug('addLessonContent - called', { sectionIdx, lessonIdx, content });
      controller.addLessonContent(sectionIdx, lessonIdx, content);
    },
    [controller]
  );

  const updateLessonContent = useCallback(
    (sectionIdx: number, lessonIdx: number, updates: Partial<Content>): void => {
      debug('updateLessonContent - called', { sectionIdx, lessonIdx, updates });
      controller.updateLessonContent(sectionIdx, lessonIdx, updates);
    },
    [controller]
  );
  const removeLessonContent = useCallback(
    (sectionIdx: number, lessonIdx: number): void => {
      debug('removeLessonContent - called', { sectionIdx, lessonIdx });
      controller.removeLessonContent(sectionIdx, lessonIdx);
    },
    [controller]
  );
  // const updateLessonContent = useCallback(
  //   <T extends keyof Lesson['content']>(
  //     sectionIdx: number,
  //     lessonIdx: number,
  //     key: T,
  //     value: Lesson['content'][T]
  //   ): void => {
  //     controller.updateLessonContent(sectionIdx, lessonIdx, key, value);
  //   },
  //   [controller]
  // );

  const deleteLesson = useCallback(
    (sectionIdx: number, lessonIdx: number) => {
      debug('deleteLesson - called', { sectionIdx, lessonIdx });
      controller.deleteLesson(sectionIdx, lessonIdx);
    },
    [controller]
  );

  const reorderLessons = useCallback(
    (sectionIdx: number, fromIdx: number, toIdx: number) => {
      debug('reorderLessons - called', { sectionIdx, fromIdx, toIdx });
      controller.reorderLessons(sectionIdx, fromIdx, toIdx);
    },
    [controller]
  );

  // QUIZ OPERATIONS
  const createQuiz = useCallback(
    (sectionIdx: number, data: Omit<Quiz, 'id'>) => {
      debug('createQuiz - called', { sectionIdx, data });
      const ret = controller.createQuiz(sectionIdx, data);
      debug('createQuiz - return', ret);
      return ret;
    },
    [controller]
  );

  const updateQuizField = useCallback(
    <T extends keyof Quiz>(sectionIdx: number, quizId: string, key: T, value: Quiz[T]): void => {
      debug('updateQuizField - called', { sectionIdx, quizId, key, value });
      controller.updateQuizField(sectionIdx, quizId, key, value);
    },
    [controller]
  );

  const deleteQuiz = useCallback(
    (sectionIdx: number, quizId: string) => {
      debug('deleteQuiz - called', { sectionIdx, quizId });
      controller.deleteQuiz(sectionIdx, quizId);
    },
    [controller]
  );

  // SAVE & VALIDATION
  const commit = useCallback(async (): Promise<boolean> => {
    debug('commit - called');
    setIsLoading(true);
    try {
      const result = await controller.commit();
      debug('commit - result', result);
      return result.success;
    } finally {
      setIsLoading(false);
    }
  }, [controller]);

  const saveAll = useCallback(async (): Promise<boolean> => {
    debug('saveAll - called');
    setIsLoading(true);
    try {
      const isValid = await controller.validateAll();
      debug('saveAll - validateAll result', isValid);
      if (!isValid) {
        toast.error({
          title: 'Validation Error',
          description: 'Please fix all errors before saving',
        });
        debug('saveAll - validation failed');
        return false;
      }
      const saveResult = await controller.saveAll();
      debug('saveAll - saveAll result', saveResult);
      return saveResult;
    } finally {
      setIsLoading(false);
    }
  }, [controller]);

  const retryFailed = useCallback(async (): Promise<boolean> => {
    debug('retryFailed - called');
    setIsLoading(true);
    try {
      const success = await controller.retryFailed();
      debug('retryFailed - result', success);
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [controller]);

  const validateAll = useCallback(async (): Promise<boolean> => {
    debug('validateAll - called');
    const ret = await controller.validateAll();
    debug('validateAll - result', ret);
    return ret;
  }, [controller]);

  const validateForm = useCallback(
    async (form: 'basic' | 'advanced' | 'curriculum'): Promise<boolean> => {
      debug('validateForm - called', form);
      const ret = await controller.validateForm(form);
      debug('validateForm - result', ret);
      return ret;
    },
    [controller]
  );

  // PUBLISH COURSE
  const publishCourse = useCallback(async (): Promise<boolean> => {
    debug('publishCourse - called');
    setIsLoading(true);
    try {
      const isValid = await controller.validateAll();
      debug('publishCourse - validateAll result', isValid);
      if (!isValid) {
        toast.error({
          title: 'Validation Error',
          description: 'Please complete all required fields',
        });
        debug('publishCourse - validation failed');
        return false;
      }
      const saveSuccess = await controller.saveAll();
      debug('publishCourse - saveAll result', saveSuccess);
      if (!saveSuccess) {
        return false;
      }
      // Navigate to course page after save
      setTimeout(() => {
        debug('publishCourse - navigating to course page', `/instructor/courses/${props.courseId}`);
        // toast.info({ title: 'redirect to page is called' });
        router.push(`/instructor/courses/${props.courseId}`);
      }, 1000);

      return true;
    } finally {
      setIsLoading(false);
    }
  }, [controller, router, props.courseId]);

  // UTILITIES
  const hasUnsavedChanges = useCallback((): boolean => {
    debug('hasUnsavedChanges - called');
    const ret = controller.hasUnsavedChanges();
    debug('hasUnsavedChanges - return', ret);
    return ret;
  }, [controller]);

  const getPendingCount = useCallback((): number => {
    debug('getPendingCount - called');
    const ret = controller.getPendingOperationsCount();
    debug('getPendingCount - return', ret);
    return ret;
  }, [controller]);

  const clearPending = useCallback((): void => {
    debug('clearPending - called');
    controller.clearPendingOperations();
  }, [controller]);

  const getResults = useCallback(() => {
    debug('getResults - called');
    const ret = controller.getResults();
    debug('getResults - return', ret);
    return ret;
  }, [controller]);

  // RETURN API
  return {
    // Loading states
    isLoading,
    isSaving,

    // Basic operations
    saveBasicAdvanced,

    // Section operations
    createSection,
    updateSectionField,
    deleteSection,
    reorderSections,

    // Lesson operations
    createLesson,
    updateLessonField,
    updateLessonContent,
    addLessonContent,
    removeLessonContent,
    deleteLesson,
    reorderLessons,

    // Quiz operations
    createQuiz,
    updateQuizField,
    deleteQuiz,

    // Save & validation
    commit,
    saveAll,
    retryFailed,
    validateAll,
    validateForm,
    publishCourse,

    // Utilities
    hasUnsavedChanges,
    getPendingCount,
    clearPending,
    getResults,
  };
}

export type CourseControllerAPI = ReturnType<typeof useCourseController>;
