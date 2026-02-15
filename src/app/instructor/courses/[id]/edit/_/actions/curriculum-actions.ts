'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { courseService } from '@/services/course.service';
import { getServerSession } from 'next-auth';

// Validation schemas
const sectionSchema = z.object({
  title: z.string().min(1, 'Section title is required'),
  description: z.string().optional(),
  order: z.number(),
  isPublished: z.boolean().default(false),
});

const lessonSchema = z.object({
  title: z.string().min(1, 'Lesson title is required'),
  description: z.string().optional(),
  order: z.number(),
  isPublished: z.boolean().default(false),
  estimatedDuration: z.number().optional(),
  contentType: z.string().optional(),
  contentUrl: z.string().optional(),
  isPreview: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

const quizSchema = z.object({
  title: z.string().min(1, 'Quiz title is required'),
  description: z.string().optional(),
  maxAttempts: z.number().optional(),
  showResults: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  passingScore: z.number().optional(),
  questions: z.array(z.any()),
});

// Helper function for error handling
function handleActionError(error: unknown) {
  console.error('Server action error:', error);

  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: 'Validation error',
      details: error.errors,
    };
  }

  return {
    success: false,
    error: error instanceof Error ? error.message : 'An unexpected error occurred',
  };
}

// Helper to verify course ownership
async function verifyCourseOwnership(courseId: string) {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const course = await courseService.getCourseById(courseId);
  if (!course.success || !course.data) {
    throw new Error('Course not found');
  }

  if (course.data.instructor.id !== session.user.userId) {
    throw new Error('You do not have permission to modify this course');
  }

  return course.data;
}

// Section Actions
export async function createSectionAction(courseId: string, data: z.infer<typeof sectionSchema>) {
  try {
    await verifyCourseOwnership(courseId);

    const validatedData = sectionSchema.parse(data);
    const result = await courseService.createSection(courseId, validatedData);

    if (result.success) {
      revalidatePath(`/instructor/courses/${courseId}/edit`);
      revalidatePath(`/instructor/courses/${courseId}`);
    }

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateSectionAction(
  courseId: string,
  sectionId: string,
  data: Partial<z.infer<typeof sectionSchema>>
) {
  try {
    // await verifyCourseOwnership(courseId);

    const result = await courseService.updateSection(courseId, sectionId, data);

    if (result.success) {
      revalidatePath(`/instructor/courses/${courseId}/edit`);
      revalidatePath(`/instructor/courses/${courseId}`);
    }

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteSectionAction(courseId: string, sectionId: string) {
  try {
    // await verifyCourseOwnership(courseId);

    const result = await courseService.deleteSection(courseId, sectionId);

    if (result.success) {
      revalidatePath(`/instructor/courses/${courseId}/edit`);
      revalidatePath(`/instructor/courses/${courseId}`);
    }

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function reorderSectionsAction(
  courseId: string,
  sectionOrders: Array<{ id: string; order: number }>
) {
  try {
    // await verifyCourseOwnership(courseId);

    // Batch update section orders
    const updatePromises = sectionOrders.map(({ id, order }) =>
      courseService.updateSection(courseId, id, { order })
    );

    const results = await Promise.allSettled(updatePromises);
    const failedUpdates = results.filter((r) => r.status === 'rejected');

    if (failedUpdates.length > 0) {
      return {
        success: false,
        error: `Failed to reorder ${failedUpdates.length} section(s)`,
      };
    }

    revalidatePath(`/instructor/courses/${courseId}/edit`);
    revalidatePath(`/instructor/courses/${courseId}`);

    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

// Lesson Actions
export async function createLessonAction(
  courseId: string,
  sectionId: string,
  data: z.infer<typeof lessonSchema>
) {
  try {
    // await verifyCourseOwnership(courseId);

    const validatedData = lessonSchema.parse(data);
    const result = await courseService.createLesson(courseId, sectionId, validatedData);

    if (result.success) {
      revalidatePath(`/instructor/courses/${courseId}/edit`);
      revalidatePath(`/instructor/courses/${courseId}`);
    }

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateLessonAction(
  courseId: string,
  sectionId: string,
  lessonId: string,
  data: Partial<z.infer<typeof lessonSchema>>
) {
  try {
    // await verifyCourseOwnership(courseId);

    const result = await courseService.updateLesson(courseId, sectionId, lessonId, data);

    if (result.success) {
      revalidatePath(`/instructor/courses/${courseId}/edit`);
      revalidatePath(`/instructor/courses/${courseId}`);
    }

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteLessonAction(courseId: string, sectionId: string, lessonId: string) {
  try {
    // await verifyCourseOwnership(courseId);

    const result = await courseService.deleteLesson(courseId, sectionId, lessonId);

    if (result.success) {
      revalidatePath(`/instructor/courses/${courseId}/edit`);
      revalidatePath(`/instructor/courses/${courseId}`);
    }

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function reorderLessonsAction(
  courseId: string,
  sectionId: string,
  lessonOrders: Array<{ id: string; order: number }>
) {
  try {
    // await verifyCourseOwnership(courseId);

    // Batch update lesson orders
    const updatePromises = lessonOrders.map(({ id, order }) =>
      courseService.updateLesson(courseId, sectionId, id, { order })
    );

    const results = await Promise.allSettled(updatePromises);
    const failedUpdates = results.filter((r) => r.status === 'rejected');

    if (failedUpdates.length > 0) {
      return {
        success: false,
        error: `Failed to reorder ${failedUpdates.length} lesson(s)`,
      };
    }

    revalidatePath(`/instructor/courses/${courseId}/edit`);
    return { success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

// Quiz Actions
export async function createQuizAction(
  courseId: string,
  sectionId: string,
  data: z.infer<typeof quizSchema>
) {
  try {
    // await verifyCourseOwnership(courseId);

    const validatedData = quizSchema.parse(data);
    const result = await courseService.createQuiz(courseId, sectionId, validatedData);

    if (result.success) {
      revalidatePath(`/instructor/courses/${courseId}/edit`);
      revalidatePath(`/instructor/courses/${courseId}`);
    }

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateQuizAction(
  courseId: string,
  sectionId: string,
  quizId: string,
  data: Partial<z.infer<typeof quizSchema>>
) {
  try {
    // await verifyCourseOwnership(courseId);

    const result = await courseService.updateQuiz(courseId, sectionId, quizId, data);

    if (result.success) {
      revalidatePath(`/instructor/courses/${courseId}/edit`);
      revalidatePath(`/instructor/courses/${courseId}`);
    }

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteQuizAction(courseId: string, sectionId: string, quizId: string) {
  try {
    // await verifyCourseOwnership(courseId);

    const result = await courseService.deleteQuiz(courseId, sectionId, quizId);

    if (result.success) {
      revalidatePath(`/instructor/courses/${courseId}/edit`);
      revalidatePath(`/instructor/courses/${courseId}`);
    }

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

// Batch Operations
export async function batchCreateLessonsAction(
  courseId: string,
  sectionId: string,
  lessons: Array<z.infer<typeof lessonSchema>>
) {
  try {
    // await verifyCourseOwnership(courseId);

    const createPromises = lessons.map((lesson) =>
      courseService.createLesson(courseId, sectionId, lesson)
    );

    const results = await Promise.allSettled(createPromises);
    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    if (successful > 0) {
      revalidatePath(`/instructor/courses/${courseId}/edit`);
    }

    return {
      success: failed === 0,
      message: `Created ${successful} lesson(s)${failed > 0 ? `, ${failed} failed` : ''}`,
      details: { successful, failed },
    };
  } catch (error) {
    return handleActionError(error);
  }
}

// Curriculum validation
export async function validateCurriculumAction(courseId: string) {
  try {
    // await verifyCourseOwnership(courseId);

    const course = await courseService.getCourseById(courseId);
    if (!course.success || !course.data) {
      throw new Error('Course not found');
    }

    const errors: string[] = [];

    // Validate sections
    if (!course.data.sections || course.data.sections.length === 0) {
      errors.push('At least one section is required');
    }

    // Validate lessons
    const totalLessons =
      course.data.sections?.reduce((sum, section) => sum + (section.lessons?.length || 0), 0) || 0;

    if (totalLessons < 3) {
      errors.push('At least 3 lessons are recommended');
    }

    // Check for lessons without content
    const lessonsWithoutContent = course.data.sections?.some((section) =>
      section.lessons?.some((lesson) => !lesson.contentType)
    );

    if (lessonsWithoutContent) {
      errors.push('All lessons must have content');
    }

    return {
      success: errors.length === 0,
      valid: errors.length === 0,
      errors,
    };
  } catch (error) {
    return handleActionError(error);
  }
}
