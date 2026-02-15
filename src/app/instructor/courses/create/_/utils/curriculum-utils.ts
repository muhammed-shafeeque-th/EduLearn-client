/* eslint-disable @typescript-eslint/no-explicit-any */
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const formatDuration = (minutes: number): string => {
  if (minutes === 0 || !minutes) return '0 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}min`;
};

export const calculateTotalDuration = (sections: any[]): number => {
  return sections.reduce((total, section) => {
    const sectionDuration =
      section.lessons?.reduce((lessonTotal: number, lesson: any) => {
        const lessonDuration = lesson.content?.duration || 0;
        return lessonTotal + lessonDuration;
      }, 0) || 0;
    return total + sectionDuration;
  }, 0);
};

export const calculateSectionStats = (section: any) => {
  const lessonCount = section.lessons?.length || 0;
  const totalDuration =
    section.lessons?.reduce((total: number, lesson: any) => {
      return total + (lesson.content?.duration || 0);
    }, 0) || 0;

  const contentCount =
    section.lessons?.reduce((total: number, lesson: any) => {
      return total + (lesson.content ? 1 : 0);
    }, 0) || 0;

  return {
    lessonCount,
    totalDuration,
    contentCount,
  };
};

export const validateCurriculumData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.sections || data.sections.length === 0) {
    errors.push('At least one section is required');
    return { isValid: false, errors };
  }

  data.sections?.forEach((section: any, sectionIndex: number) => {
    if (!section.title?.trim()) {
      errors.push(`Section ${sectionIndex + 1}: Title is required`);
    }

    if (!section.lessons || section.lessons.length === 0) {
      errors.push(`Section ${sectionIndex + 1}: At least one lesson is required`);
    } else {
      section.lessons?.forEach((lesson: any, lessonIndex: number) => {
        if (!lesson.title?.trim()) {
          errors.push(`Section ${sectionIndex + 1}, Lesson ${lessonIndex + 1}: Title is required`);
        }

        if (!lesson.content) {
          errors.push(
            `Section ${sectionIndex + 1}, Lesson ${lessonIndex + 1}: At least one content item is required`
          );
        }

        // Validate content items
        if (lesson.content?.type === 'link' && !lesson.content.url?.trim()) {
          errors.push(
            `Section ${sectionIndex + 1}, Lesson ${lessonIndex + 1}, Content : File or URL is required`
          );
        }

        if (
          lesson.content &&
          ['video', 'document', 'download'].includes(lesson.content.type) &&
          !lesson.content.file &&
          !lesson.content.url?.trim()
        ) {
          errors.push(
            `Section ${sectionIndex + 1}, Lesson ${lessonIndex + 1}, Content : File or URL is required`
          );
        }
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const exportCurriculumData = (data: any) => {
  const stats = {
    totalSections: data.sections?.length || 0,
    totalLessons:
      data.sections?.reduce(
        (total: number, section: any) => total + (section.lessons?.length || 0),
        0
      ) || 0,
    totalContent:
      data.sections?.reduce(
        (total: number, section: any) =>
          total +
          (section.lessons?.reduce(
            (lessonTotal: number, lesson: any) => lessonTotal + (lesson.content?.length || 0),
            0
          ) || 0),
        0
      ) || 0,
    totalDuration: calculateTotalDuration(data.sections || []),
    previewContent:
      data.sections?.reduce(
        (total: number, section: any) =>
          total +
          (section.lessons?.reduce(
            (lessonTotal: number, lesson: any) =>
              lessonTotal +
              (lesson.content?.filter((content: any) => content.isPreview).length || 0),
            0
          ) || 0),
        0
      ) || 0,
  };

  return {
    curriculum: data,
    statistics: stats,
    exportedAt: new Date().toISOString(),
  };
};

// Utility for file size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Utility for content type validation
export const getAcceptedFileTypes = (contentType: string): string => {
  const typeMap: Record<string, string> = {
    video: 'video/mp4,video/webm,video/ogg,video/avi,video/mov',
    document: '.pdf,.doc,.docx,.ppt,.pptx,.txt,.rtf',
    download: '.zip,.rar,.tar,.gz,.pdf,.jpg,.jpeg,.png,.gif,.svg',
  };

  return typeMap[contentType] || '*';
};

// Utility for generating unique lesson names
export const generateUniqueLessonName = (existingLessons: any[] = []): string => {
  const baseName = 'Lesson name';
  let counter = 1;
  let newName = baseName;

  while (existingLessons.some((lesson) => lesson.name === newName)) {
    counter++;
    newName = `${baseName} ${counter}`;
  }

  return newName;
};

// Utility for reordering arrays
export const reorderArray = <T>(list: T[], startIndex: number, endIndex: number): T[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};
