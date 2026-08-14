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
      const $module = modules?.[moduleIndex];

      if (!$module) return false;

      const errors: string[] = [];

      if (!$module.name?.trim()) {
        errors.push('Module name is required');
      }

      if (!$module.lessons || $module.lessons.length === 0) {
        errors.push('At least one lesson is required');
      }

      $module.lessons?.forEach((lesson, lessonIndex) => {
        if (!lesson.name?.trim()) {
          errors.push(`Lesson ${lessonIndex + 1}: Name is required`);
        }

        if (!lesson.content || lesson.content.length === 0) {
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

      if (!lesson.name?.trim()) {
        errors.push('Lesson name is required');
      }

      if (!lesson.content || lesson.content.length === 0) {
        errors.push('At least one content item is required');
      } else {
        lesson.content.forEach((content, contentIndex) => {
          if (!content.title?.trim()) {
            errors.push(`Content ${contentIndex + 1}: Title is required`);
          }

          if (content.type === 'link' && !content.url?.trim()) {
            errors.push(`Content ${contentIndex + 1}: URL is required for links`);
          }
        });
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
