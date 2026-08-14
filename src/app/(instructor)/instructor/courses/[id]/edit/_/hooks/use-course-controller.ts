'use client';

import { useRef, useCallback, useState, useEffect, useLayoutEffect } from 'react';
import type { UseFieldArrayReturn, UseFormReturn } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { CourseController, CourseControllerConfig } from '../utils/course-controller';
import type {
  Module,
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
  modulesArray: UseFieldArrayReturn<CurriculumFormData, 'modules'>;
}

export function useCourseController(props: UseCourseControllerProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
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

  // Sync pending count
  useEffect(() => {
    const unsubscribe = controller.subscribe((count) => {
      setPendingCount(count);
    });
    return unsubscribe;
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

  // MODULE OPERATIONS
  const createModule = useCallback(
    (data: Omit<Module, 'id'>) => {
      debug('createModule - called', data);
      const ret = controller.createModule(data);
      debug('createModule - return', ret);
      return ret;
    },
    [controller]
  );

  const updateModuleField = useCallback(
    <T extends keyof Module>(moduleIdx: number, key: T, value: Module[T]): void => {
      debug('updateModuleField - called', { moduleIdx, key, value });
      controller.updateModuleField(moduleIdx, key, value);
    },
    [controller]
  );

  const deleteModule = useCallback(
    (moduleIdx: number) => {
      debug('deleteModule - called', moduleIdx);
      controller.deleteModule(moduleIdx);
    },
    [controller]
  );

  const reorderModules = useCallback(
    (fromIndex: number, toIndex: number) => {
      debug('reorderModules - called', { fromIndex, toIndex });
      controller.reorderModules(fromIndex, toIndex);
    },
    [controller]
  );

  // LESSON OPERATIONS
  const createLesson = useCallback(
    (moduleIdx: number, data: Omit<Lesson, 'id'>) => {
      debug('createLesson - called', { moduleIdx, data });
      const ret = controller.createLesson(moduleIdx, data);
      debug('createLesson - return', ret);
      return ret;
    },
    [controller]
  );

  const updateLessonField = useCallback(
    <T extends keyof Lesson>(
      moduleIdx: number,
      lessonIdx: number,
      key: T,
      value: Lesson[T]
    ): void => {
      debug('updateLessonField - called', { moduleIdx, lessonIdx, key, value });
      controller.updateLessonField(moduleIdx, lessonIdx, key, value);
    },
    [controller]
  );

  const addLessonContent = useCallback(
    (moduleIdx: number, lessonIdx: number, content: Omit<Content, 'id'>): void => {
      debug('addLessonContent - called', { moduleIdx, lessonIdx, content });
      controller.addLessonContent(moduleIdx, lessonIdx, content);
    },
    [controller]
  );

  const updateLessonContent = useCallback(
    (moduleIdx: number, lessonIdx: number, updates: Partial<Content>): void => {
      debug('updateLessonContent - called', { moduleIdx, lessonIdx, updates });
      controller.updateLessonContent(moduleIdx, lessonIdx, updates);
    },
    [controller]
  );
  const removeLessonContent = useCallback(
    (moduleIdx: number, lessonIdx: number): void => {
      debug('removeLessonContent - called', { moduleIdx, lessonIdx });
      controller.removeLessonContent(moduleIdx, lessonIdx);
    },
    [controller]
  );
  // const updateLessonContent = useCallback(
  //   <T extends keyof Lesson['content']>(
  //     moduleIdx: number,
  //     lessonIdx: number,
  //     key: T,
  //     value: Lesson['content'][T]
  //   ): void => {
  //     controller.updateLessonContent(moduleIdx, lessonIdx, key, value);
  //   },
  //   [controller]
  // );

  const deleteLesson = useCallback(
    (moduleIdx: number, lessonIdx: number) => {
      debug('deleteLesson - called', { moduleIdx, lessonIdx });
      controller.deleteLesson(moduleIdx, lessonIdx);
    },
    [controller]
  );

  const reorderLessons = useCallback(
    (moduleIdx: number, fromIdx: number, toIdx: number) => {
      debug('reorderLessons - called', { moduleIdx, fromIdx, toIdx });
      controller.reorderLessons(moduleIdx, fromIdx, toIdx);
    },
    [controller]
  );

  // QUIZ OPERATIONS
  const createQuiz = useCallback(
    (moduleIdx: number, data: Omit<Quiz, 'id'>) => {
      debug('createQuiz - called', { moduleIdx, data });
      const ret = controller.createQuiz(moduleIdx, data);
      debug('createQuiz - return', ret);
      return ret;
    },
    [controller]
  );

  const updateQuizField = useCallback(
    <T extends keyof Quiz>(moduleIdx: number, quizId: string, key: T, value: Quiz[T]): void => {
      debug('updateQuizField - called', { moduleIdx, quizId, key, value });
      controller.updateQuizField(moduleIdx, quizId, key, value);
    },
    [controller]
  );

  const deleteQuiz = useCallback(
    (moduleIdx: number, quizId: string) => {
      debug('deleteQuiz - called', { moduleIdx, quizId });
      controller.deleteQuiz(moduleIdx, quizId);
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

    // Module operations
    createModule,
    updateModuleField,
    deleteModule,
    reorderModules,

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
    hasUnsavedChanges: hasUnsavedChanges(),
    isDirty: pendingCount > 0 || hasUnsavedChanges(),
    pendingCount,
    clearPending,
    getResults,
  };
}

export type CourseControllerAPI = ReturnType<typeof useCourseController>;
