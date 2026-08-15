'use client';

import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CurriculumFormData } from '../schemas/curriculum-schema';
import { validateCurriculumData } from '../utils/curriculum-utils';
import { toast } from 'sonner';

export const useCurriculumValidation = (form: UseFormReturn<CurriculumFormData>) => {
  const { watch, setError, clearErrors } = form;

  const validateCurriculum = useCallback((): boolean => {
    const data = watch();
    const { isValid, errors } = validateCurriculumData(data);

    // Clear previous errors
    clearErrors();

    if (!isValid) {
      errors.forEach((error) => {
        toast.error(error, {
          duration: 5000,
          position: 'top-center',
        });
      });

      // Set form-level error
      setError('modules', {
        type: 'manual',
        message: 'Please fix the curriculum errors before proceeding',
      });
    }

    return isValid;
  }, [watch, setError, clearErrors]);

  const validateModule = useCallback(
    (moduleIndex: number): boolean => {
      const modules = watch('modules');
      const _module = modules?.[moduleIndex];

      if (!_module) return false;

      const errors: string[] = [];

      if (!_module.title?.trim()) {
        errors.push('Module title is required');
      }

      if (!_module.lessons || _module.lessons.length === 0) {
        errors.push('At least one lesson is required');
      }

      _module.lessons?.forEach((lesson, lessonIndex) => {
        if (!lesson.title?.trim()) {
          errors.push(`Lesson ${lessonIndex + 1}: title is required`);
        }

        if (!lesson.content) {
          errors.push(`Lesson ${lessonIndex + 1}: Content is required`);
        }
      });

      if (errors.length > 0) {
        errors.forEach((error) => toast.error(error));
        return false;
      }

      return true;
    },
    [watch]
  );

  const validateLesson = useCallback(
    (moduleIndex: number, lessonIndex: number): boolean => {
      const modules = watch('modules');
      const lesson = modules?.[moduleIndex]?.lessons?.[lessonIndex];

      if (!lesson) return false;

      const errors: string[] = [];

      if (!lesson.title?.trim()) {
        errors.push('Lesson title is required');
      }

      if (!lesson.content) {
        errors.push('At least one content item is required');
      } else {
      }

      if (errors.length > 0) {
        errors.forEach((error) => toast.error(error));
        return false;
      }

      return true;
    },
    [watch]
  );

  return {
    validateCurriculum,
    validateModule,
    validateLesson,
  };
};
