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
      setError('sections', {
        type: 'manual',
        message: 'Please fix the curriculum errors before proceeding',
      });
    }

    return isValid;
  }, [watch, setError, clearErrors]);

  const validateSection = useCallback(
    (sectionIndex: number): boolean => {
      const sections = watch('sections');
      const section = sections?.[sectionIndex];

      if (!section) return false;

      const errors: string[] = [];

      if (!section.title?.trim()) {
        errors.push('Section title is required');
      }

      if (!section.lessons || section.lessons.length === 0) {
        errors.push('At least one lesson is required');
      }

      section.lessons?.forEach((lesson, lessonIndex) => {
        if (!lesson.title?.trim()) {
          errors.push(`Lesson ${lessonIndex + 1}: Title is required`);
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
    (sectionIndex: number, lessonIndex: number): boolean => {
      const sections = watch('sections');
      const lesson = sections?.[sectionIndex]?.lessons?.[lessonIndex];

      if (!lesson) return false;

      const errors: string[] = [];

      if (!lesson.title?.trim()) {
        errors.push('Lesson title is required');
      }

      if (!lesson.content) {
        errors.push('Content is required');
      } else {
        const content = lesson.content;
        if (!content.url && !content.file) {
          errors.push('File or URL is required for content');
        }
        if (typeof content.url === 'string' && !content.url.trim()) {
          errors.push('Content URL cannot be empty');
        }
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
    validateSection,
    validateLesson,
  };
};
