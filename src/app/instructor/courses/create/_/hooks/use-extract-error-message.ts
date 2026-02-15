/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';

type ExtractedError = {
  path: string;
  message: string;
  sectionIndex?: number;
  lessonIndex?: number;
  quizIndex?: number;
};

type ErrorObject = Record<string, any> & { message?: string };

export function useExtractZodErrors(errors: any) {
  return useMemo(() => {
    const extractedErrors: ExtractedError[] = [];

    function extractErrors(
      obj: ErrorObject,
      path: string[] = [],
      sectionIndex?: number,
      lessonIndex?: number,
      quizIndex?: number
    ) {
      if (!obj || typeof obj !== 'object') return;

      // Base case: direct message
      if (obj.message) {
        extractedErrors.push({
          path: path.join(' → '),
          message: obj.message,
          sectionIndex,
          lessonIndex,
          quizIndex,
        });
        return;
      }

      for (const [key, value] of Object.entries(obj)) {
        if (!value || key === 'message') continue;

        // Handle arrays like sections, lessons, questions
        if (Array.isArray(value)) {
          value.forEach((child, idx) => {
            let newSectionIndex = sectionIndex;
            let newLessonIndex = lessonIndex;
            let newQuizIndex = quizIndex;
            const newPath = [...path];

            switch (key) {
              case 'sections':
                newSectionIndex = idx;
                newPath.push(`Section ${idx + 1}`);
                break;
              case 'lessons':
                newLessonIndex = idx;
                newPath.push(`Lesson ${idx + 1}`);
                break;
              case 'questions':
                newQuizIndex = idx;
                newPath.push(`Question ${idx + 1}`);
                break;
              default:
                newPath.push(`${key}[${idx}]`);
                break;
            }

            extractErrors(child, newPath, newSectionIndex, newLessonIndex, newQuizIndex);
          });
          continue;
        }

        // Handle nested objects
        if (typeof value === 'object') {
          const newPath = [...path];

          // Add contextual labels only once
          if (key === 'quiz') {
            newPath.push('Quiz');
          } else if (['name', 'description', 'content', 'title'].includes(key)) {
            const fieldName = key.charAt(0).toUpperCase() + key.slice(1);
            newPath.push(fieldName);
          } else if (!['root', '_errors'].includes(key)) {
            // Avoid redundant or system-level keys
            newPath.push(key.charAt(0).toUpperCase() + key.slice(1));
          }

          extractErrors(value, newPath, sectionIndex, lessonIndex, quizIndex);
        }
      }
    }

    /**  Handle Section-level errors **/
    const sectionErrors = Array.isArray(errors.sections) ? (errors.sections as ErrorObject[]) : [];

    sectionErrors.forEach((sectionError, sectionIndex) => {
      extractErrors(sectionError, [`Section ${sectionIndex + 1}`], sectionIndex);
    });

    /**  Handle root-level errors **/
    const rootMessage =
      errors?.sections?.root?.message ??
      errors?.message ??
      (typeof errors.sections === 'string' ? errors.sections : null);

    if (rootMessage) {
      extractedErrors.push({
        path: 'Curriculum',
        message: rootMessage || 'Curriculum validation failed',
      });
    }

    return extractedErrors;
  }, [errors]);
}
