/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';

type ExtractedError = {
  path: string;
  message: string;
  moduleIndex?: number;
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
      moduleIndex?: number,
      lessonIndex?: number,
      quizIndex?: number
    ) {
      if (!obj || typeof obj !== 'object') return;

      // Base case: direct message
      if (obj.message) {
        extractedErrors.push({
          path: path.join(' → '),
          message: obj.message,
          moduleIndex,
          lessonIndex,
          quizIndex,
        });
        return;
      }

      for (const [key, value] of Object.entries(obj)) {
        if (!value || key === 'message') continue;

        // Handle arrays like modules, lessons, questions
        if (Array.isArray(value)) {
          value.forEach((child, idx) => {
            let newModuleIndex = moduleIndex;
            let newLessonIndex = lessonIndex;
            let newQuizIndex = quizIndex;
            const newPath = [...path];

            switch (key) {
              case 'modules':
                newModuleIndex = idx;
                newPath.push(`Module ${idx + 1}`);
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

            extractErrors(child, newPath, newModuleIndex, newLessonIndex, newQuizIndex);
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

          extractErrors(value, newPath, moduleIndex, lessonIndex, quizIndex);
        }
      }
    }

    /**  Handle Module-level errors **/
    const moduleErrors = Array.isArray(errors.modules) ? (errors.modules as ErrorObject[]) : [];

    moduleErrors.forEach((moduleError, moduleIndex) => {
      extractErrors(moduleError, [`Module ${moduleIndex + 1}`], moduleIndex);
    });

    /**  Handle root-level errors **/
    const rootMessage =
      errors?.modules?.root?.message ??
      errors?.message ??
      (typeof errors.modules === 'string' ? errors.modules : null);

    if (rootMessage) {
      extractedErrors.push({
        path: 'Curriculum',
        message: rootMessage || 'Curriculum validation failed',
      });
    }

    return extractedErrors;
  }, [errors]);
}
