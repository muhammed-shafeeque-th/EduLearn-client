'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { serverCourseService } from '@/services/server-service-clients';

// Validation schemas
const moduleSchema = z.object({
  title: z.string().min(1, 'Module title is required'),
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

  const course = await serverCourseService.getCourseById(courseId);
  if (!course.success || !course.data) {
    throw new Error('Course not found');
  }

  if (course.data.instructor.id !== session.user.userId) {
    throw new Error('You do not have permission to modify this course');
  }

  return course.data;
}

// Module Actions
export async function createModuleAction(courseId: string, data: z.infer<typeof moduleSchema>) {
  try {
    await verifyCourseOwnership(courseId);

    const validatedData = moduleSchema.parse(data);
    const result = await serverCourseService.createModule(courseId, validatedData);

    if (result.success) {
      revalidatePath(`/instructor/courses/${courseId}/edit`);
      revalidatePath(`/instructor/courses/${courseId}`);
    }

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateModuleAction(
  courseId: string,
  moduleId: string,
  data: Partial<z.infer<typeof moduleSchema>>
) {
  try {
    // await verifyCourseOwnership(courseId);

    const result = await serverCourseService.updateModule(courseId, moduleId, data);

    if (result.success) {
      revalidatePath(`/instructor/courses/${courseId}/edit`);
      revalidatePath(`/instructor/courses/${courseId}`);
    }

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteModuleAction(courseId: string, moduleId: string) {
  try {
    // await verifyCourseOwnership(courseId);

    const result = await serverCourseService.deleteModule(courseId, moduleId);

    if (result.success) {
      revalidatePath(`/instructor/courses/${courseId}/edit`);
      revalidatePath(`/instructor/courses/${courseId}`);
    }

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function reorderModulesAction(
  courseId: string,
  moduleOrders: Array<{ id: string; order: number }>
) {
  try {
    // await verifyCourseOwnership(courseId);

    // Batch update module orders
    const updatePromises = moduleOrders.map(({ id, order }) =>
      serverCourseService.updateModule(courseId, id, { order })
    );

    const results = await Promise.allSettled(updatePromises);
    const failedUpdates = results.filter((r) => r.status === 'rejected');

    if (failedUpdates.length > 0) {
      return {
        success: false,
        error: `Failed to reorder ${failedUpdates.length} module(s)`,
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
  moduleId: string,
  data: z.infer<typeof lessonSchema>
) {
  try {
    // await verifyCourseOwnership(courseId);

    const validatedData = lessonSchema.parse(data);
    const result = await serverCourseService.createLesson(courseId, moduleId, validatedData);

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
  moduleId: string,
  lessonId: string,
  data: Partial<z.infer<typeof lessonSchema>>
) {
  try {
    // await verifyCourseOwnership(courseId);

    const result = await serverCourseService.updateLesson(courseId, moduleId, lessonId, data);

    if (result.success) {
      revalidatePath(`/instructor/courses/${courseId}/edit`);
      revalidatePath(`/instructor/courses/${courseId}`);
    }

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteLessonAction(courseId: string, moduleId: string, lessonId: string) {
  try {
    // await verifyCourseOwnership(courseId);

    const result = await serverCourseService.deleteLesson(courseId, moduleId, lessonId);

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
  moduleId: string,
  lessonOrders: Array<{ id: string; order: number }>
) {
  try {
    // await verifyCourseOwnership(courseId);

    // Batch update lesson orders
    const updatePromises = lessonOrders.map(({ id, order }) =>
      serverCourseService.updateLesson(courseId, moduleId, id, { order })
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
  moduleId: string,
  data: z.infer<typeof quizSchema>
) {
  try {
    // await verifyCourseOwnership(courseId);

    const validatedData = quizSchema.parse(data);
    const result = await serverCourseService.createQuiz(courseId, moduleId, validatedData);

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
  moduleId: string,
  quizId: string,
  data: Partial<z.infer<typeof quizSchema>>
) {
  try {
    // await verifyCourseOwnership(courseId);

    const result = await serverCourseService.updateQuiz(courseId, moduleId, quizId, data);

    if (result.success) {
      revalidatePath(`/instructor/courses/${courseId}/edit`);
      revalidatePath(`/instructor/courses/${courseId}`);
    }

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteQuizAction(courseId: string, moduleId: string, quizId: string) {
  try {
    // await verifyCourseOwnership(courseId);

    const result = await serverCourseService.deleteQuiz(courseId, moduleId, quizId);

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
  moduleId: string,
  lessons: Array<z.infer<typeof lessonSchema>>
) {
  try {
    // await verifyCourseOwnership(courseId);

    const createPromises = lessons.map((lesson) =>
      serverCourseService.createLesson(courseId, moduleId, lesson)
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

    const course = await serverCourseService.getCourseById(courseId);
    if (!course.success || !course.data) {
      throw new Error('Course not found');
    }

    const errors: string[] = [];

    // Validate modules
    if (!course.data.modules || course.data.modules.length === 0) {
      errors.push('At least one module is required');
    }

    // Validate lessons
    const totalLessons =
      course.data.modules?.reduce((sum, module) => sum + (module.lessons?.length || 0), 0) || 0;

    if (totalLessons < 3) {
      errors.push('At least 3 lessons are recommended');
    }

    // Check for lessons without content
    const lessonsWithoutContent = course.data.modules?.some((module) =>
      module.lessons?.some((lesson) => !lesson.contentType)
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
