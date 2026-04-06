import { UseFieldArrayReturn, UseFormReturn } from 'react-hook-form';
import { courseService } from '@/services/course';
import type {
  Module,
  Lesson,
  Quiz,
  CurriculumFormData,
  Content,
} from '../../schemas/curriculum-schema';
import type { BasicInfoFormData, AdvancedInfoFormData } from '../../schemas/course-schemas';
import { generateTempId, isTempId } from './utils/utils';
import { OperationExecutor } from './utils/op-executor';
import { FormChangeDetector } from './utils/change-detector';
import { OperationQueue } from './utils/op-queue';
import { CourseOp, OpResult } from './types';
import { getErrorMessage } from '@/lib/utils';
import { CurriculumSnapshot } from './utils/curriculum-snapshot';

type TempModule = Module & { _tempId: string };
type TempLesson = Lesson & { _tempId: string };
type TempQuiz = Quiz & { _tempId: string };

type CommitResult = {
  success: boolean;
  failedOps?: OpResult[];
};

export interface CourseControllerConfig {
  courseId: string;
  basicForm: UseFormReturn<BasicInfoFormData>;
  advancedForm: UseFormReturn<AdvancedInfoFormData>;
  modulesArray: UseFieldArrayReturn<CurriculumFormData, 'modules'>;
  curriculumForm: UseFormReturn<CurriculumFormData>;
  onSuccess?: (message: string) => void;
  onSettled?: () => void;
  onError?: (message: string) => void;
  onBeforeCommit?: (ops: readonly CourseOp[]) => boolean;
}

/**
 * Main Course Controller
 *
 * Responsibilities:
 * - Track all mutations as operations (command pattern)
 * - Execute operations in correct order
 * - Handle retries for failed operations
 * - Integrate with React Hook Form validation
 * - Provide clean API for components
 */
export class CourseController {
  private readonly queue: OperationQueue;
  private readonly executor: OperationExecutor;
  private config: CourseControllerConfig;
  private abortController: AbortController | null = null;

  constructor(config: CourseControllerConfig) {
    this.config = config;
    this.queue = new OperationQueue();
    this.executor = new OperationExecutor(
      config.courseId,
      courseService,
      () => new CurriculumSnapshot(this.config.curriculumForm.getValues())
    );
  }

  public updateConfig(newConfig: CourseControllerConfig) {
    this.config = newConfig;
  }

  /**
   * Save basic and advanced form data (only if changed)
   */
  async saveBasicAdvanced(): Promise<boolean> {
    const { basicForm, advancedForm, onError, onSuccess } = this.config;
    const basicValues = basicForm.getValues();
    const advancedValues = advancedForm.getValues();

    const basicChanges = FormChangeDetector.getDirtyPayload(
      basicValues,
      basicForm.formState.dirtyFields
    );

    const advancedChanges = FormChangeDetector.getDirtyPayload(
      advancedValues,
      advancedForm.formState.dirtyFields
    );

    if (Object.keys(basicChanges).length === 0 && Object.keys(advancedChanges).length === 0) {
      return true;
    }

    try {
      const result = await this.executor.executeBasicAdvanced(basicValues, advancedValues);

      if (!result.success) {
        onError?.(result.error ?? 'Update failed');
        return false;
      }

      basicForm.reset(basicValues);
      advancedForm.reset(advancedValues);
      onSuccess?.('Course information updated');
      return true;
    } catch (error) {
      this.config.onError?.(getErrorMessage(error));
      return false;
    } finally {
      this.config.onSettled?.();
    }
  }

  /**
   * Create a new module
   */
  createModule(data: Omit<Module, 'id'>): TempModule {
    const tempId = generateTempId('module');
    const modules = this.config.curriculumForm.getValues('modules') || [];
    const order = modules.length;

    const $module: Module = {
      ...data,
      id: tempId,
      lessons: data.lessons || [],
      order,
    };

    this.config.modulesArray.append($module, { shouldFocus: true });

    this.queue.push({
      type: 'MODULE_CREATE',
      tempId,
      data: $module,
      order: $module.order,
    });

    return { ...$module, _tempId: tempId };
  }

  /**
   * Update an existing module field
   */
  updateModuleField<T extends keyof Module>(moduleIndex: number, key: T, value: Module[T]): void {
    const $module = this.config.curriculumForm.getValues(`modules.${moduleIndex}`);
    if (!$module) return;

    this.config.curriculumForm.setValue(`modules.${moduleIndex}.${key}` as const, value as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
    const moduleId = $module.id;

    if (!isTempId(moduleId)) {
      this.queue.push({
        type: 'MODULE_UPDATE',
        id: moduleId,
        data: { [key]: value },
      });
    } else {
      this.updatePendingCreate('MODULE_CREATE', moduleId, { [key]: value });
    }
  }

  /**
   * Delete a module
   */
  deleteModule(moduleIdx: number): void {
    const $module = this.config.curriculumForm.getValues(`modules.${moduleIdx}`);
    this.config.modulesArray.remove(moduleIdx);

    if ($module && !isTempId($module.id)) {
      this.queue.push({
        type: 'MODULE_DELETE',
        id: $module.id,
      });
    } else if ($module) {
      this.removePendingCreate('MODULE_CREATE', $module.id);
    }
  }

  /**
   * Reorder modules
   */
  reorderModules(from: number, to: number): void {
    this.config.modulesArray.move(from, to);
    const moduleId = this.config.curriculumForm.getValues(`modules.${from}`).id;
    if (!moduleId || isTempId(moduleId)) return;
    this.queue.push({
      type: 'MODULE_REORDER',
      id: moduleId,
      newOrder: to,
    });
  }

  createLesson(moduleIdx: number, data: Omit<Lesson, 'id'>): TempLesson {
    const tempId = generateTempId('lesson');
    const lessonsPath = `modules.${moduleIdx}.lessons` as const;

    const allModules = this.config.curriculumForm.getValues('modules');
    const currentModule = allModules[moduleIdx];

    if (!currentModule) {
      console.error(`Module index ${moduleIdx} not found in form data.`);
      throw new Error('Target module not found');
    }

    const moduleId = currentModule.id;

    const lessons: Lesson[] = this.config.curriculumForm.getValues(lessonsPath) ?? [];

    const lesson: Lesson = {
      ...data,
      id: tempId,
      order: data.order ?? lessons.length,
    };

    this.config.curriculumForm.setValue(lessonsPath, [...lessons, lesson], {
      shouldDirty: true,
      shouldValidate: true,
    });

    this.queue.push({
      type: 'LESSON_CREATE',
      moduleId,
      tempId,
      data: lesson,
      order: lessons.length,
    });

    return { ...lesson, _tempId: tempId };
  }

  /**
   * Update an existing lesson field
   */
  updateLessonField<T extends keyof Lesson>(
    moduleIdx: number,
    lessonIdx: number,
    key: T,
    value: Lesson[T]
  ): void {
    const $module = this.config.curriculumForm.getValues(`modules.${moduleIdx}`);
    if (!$module) throw new Error('module does exist');

    const path = `modules.${moduleIdx}.lessons.${lessonIdx}.${key}` as const;
    this.config.curriculumForm.setValue(path, value as never, {
      shouldDirty: true,
      shouldValidate: true,
    });

    const lesson = this.config.curriculumForm.getValues(
      `modules.${moduleIdx}.lessons.${lessonIdx}`
    );

    if (!lesson) return;
    if (!isTempId(lesson.id)) {
      this.queue.push({
        type: 'LESSON_UPDATE',
        id: lesson.id,
        moduleId: module.id,
        data: { [key]: value },
      });
    } else {
      this.updatePendingCreate('LESSON_CREATE', lesson.id, { [key]: value });
    }
  }
  /**
   * Update the entire content of an existing lesson in a module.
   * Performs a shallow merge with any existing content (for partial updates).
   */
  updateLessonContent(moduleIdx: number, lessonIdx: number, updates: Partial<Content>): void {
    const path = `modules.${moduleIdx}.lessons.${lessonIdx}.content` as const;

    const lesson = this.config.curriculumForm.getValues(
      `modules.${moduleIdx}.lessons.${lessonIdx}`
    );
    if (!lesson) return;

    const mergedContent = {
      ...(lesson.content ?? {}),
      ...updates,
    };

    this.config.curriculumForm.setValue(path, mergedContent as never, {
      shouldDirty: true,
      shouldValidate: true,
    });

    const lessonId = lesson.id;
    const moduleId = this.config.curriculumForm.getValues(`modules.${moduleIdx}`).id;

    if (!isTempId(lessonId)) {
      this.queue.push({
        type: 'LESSON_UPDATE',
        id: lessonId,
        moduleId: moduleId,
        data: { content: mergedContent },
      });
    } else {
      this.updatePendingCreate('LESSON_CREATE', lessonId, { content: mergedContent });
    }
  }
  /**
   * Remove all content from a lesson in a module.
   * This sets the lesson content field to undefined (deletes content object).
   */
  removeLessonContent(moduleIdx: number, lessonIdx: number): void {
    const path = `modules.${moduleIdx}.lessons.${lessonIdx}.content` as const;

    const lesson = this.config.curriculumForm.getValues(
      `modules.${moduleIdx}.lessons.${lessonIdx}`
    );
    if (!lesson) return;

    this.config.curriculumForm.setValue(path, undefined as never, {
      shouldDirty: true,
      shouldValidate: true,
    });

    const lessonId = lesson.id;
    const $module = this.config.curriculumForm.getValues(`modules.${moduleIdx}`);

    if (!isTempId(lessonId)) {
      this.queue.push({
        type: 'LESSON_UPDATE',
        id: lessonId,
        moduleId: module.id,
        data: { content: undefined },
      });
    } else {
      this.updatePendingCreate('LESSON_CREATE', lessonId, { content: undefined });
    }
  }

  /**
   * Add new content to the specified lesson, generating a temporary id.
   * Overwrites any existing content on the lesson.
   */
  addLessonContent(moduleIdx: number, lessonIdx: number, content: Omit<Content, 'id'>): void {
    const newContent: Content = {
      ...content,
      id: generateTempId('content'),
    };

    const path = `modules.${moduleIdx}.lessons.${lessonIdx}.content` as const;

    this.config.curriculumForm.setValue(path, newContent as never, {
      shouldDirty: true,
      shouldValidate: true,
    });

    const lesson = this.config.curriculumForm.getValues(
      `modules.${moduleIdx}.lessons.${lessonIdx}`
    );
    if (!lesson) return;

    const lessonId = lesson.id;
    const $module = this.config.curriculumForm.getValues(`modules.${moduleIdx}`);

    if (!isTempId(lessonId)) {
      this.queue.push({
        type: 'LESSON_UPDATE',
        id: lessonId,
        moduleId: module.id,
        data: { content: newContent },
      });
    } else {
      this.updatePendingCreate('LESSON_CREATE', lessonId, { content: newContent });
    }
  }

  /**
   * Delete a lesson
   */
  deleteLesson(moduleIndex: number, lessonIndex: number): void {
    const lessonsPath = `modules.${moduleIndex}.lessons` as const;
    const lessons = [...(this.config.curriculumForm.getValues(lessonsPath) || [])];

    const [removed] = lessons.splice(lessonIndex, 1);

    const $module = this.config.curriculumForm.getValues(`modules.${moduleIndex}`);
    this.config.curriculumForm.setValue(lessonsPath, lessons, { shouldDirty: true });

    if (removed) {
      if (!isTempId(removed.id)) {
        this.queue.push({
          type: 'LESSON_DELETE',
          id: removed.id,
          moduleId: module.id,
        });
      } else {
        this.removePendingCreate('LESSON_CREATE', removed.id);
      }
    }
  }

  /**
   * Reorder lessons within a module
   */
  reorderLessons(moduleIdx: number, from: number, to: number): void {
    const lessonsPath = `modules.${moduleIdx}.lessons` as const;
    const lessons = [...(this.config.curriculumForm.getValues(lessonsPath) || [])];

    if (from < 0 || from >= lessons.length || to < 0 || to >= lessons.length) return;

    const [movedLesson] = lessons.splice(from, 1);
    lessons.splice(to, 0, movedLesson);

    this.config.curriculumForm.setValue(lessonsPath, lessons, { shouldDirty: true });

    const lessonOrder = lessons.filter((l) => !isTempId(l.id)).map((l) => l.order);

    const $module = this.config.modulesArray.fields[moduleIdx];
    const moduleId = module.id;

    if (!isTempId(moduleId) && lessonOrder.length === lessons.length) {
      this.queue.push({
        type: 'LESSON_REORDER',
        moduleId,
        id: movedLesson.id,
        newOrder: lessonOrder,
      });
    }
  }

  /**
   * Create a quiz for a module (using module array index for target)
   */
  createQuiz(moduleIdx: number, data: Omit<Quiz, 'id'>): TempQuiz {
    const tempId = generateTempId('quiz');
    const quiz: Quiz = {
      ...data,
      id: tempId,
    };

    const currentModule = this.config.curriculumForm.getValues(`modules.${moduleIdx}`);
    if (!currentModule) throw new Error(`Module at index ${moduleIdx} not found`);

    const moduleId = currentModule.id;

    this.config.curriculumForm.setValue(`modules.${moduleIdx}.quiz`, quiz, {
      shouldDirty: true,
      shouldValidate: true,
    });

    this.queue.push({
      type: 'QUIZ_CREATE',
      moduleId,
      tempId,
      data: quiz,
    });

    return { ...quiz, _tempId: tempId };
  }

  /**
   * Update a quiz (using module array index for target)
   */
  updateQuizField<T extends keyof Quiz>(
    moduleIdx: number,
    quizId: string,
    key: T,
    value: Quiz[T]
  ): void {
    const $module = this.config.curriculumForm.getValues(`modules.${moduleIdx}`);
    if (!module) return;

    const moduleId = module.id;
    const quiz = this.config.curriculumForm.getValues(`modules.${moduleIdx}.quiz`);

    if (!quiz || quiz.id !== quizId) return;

    const updatedQuiz = { ...quiz, [key]: value };

    this.config.curriculumForm.setValue(`modules.${moduleIdx}.quiz`, updatedQuiz, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (!isTempId(quizId)) {
      this.queue.push({
        type: 'QUIZ_UPDATE',
        id: quizId,
        moduleId,
        data: { [key]: value },
      });
    } else {
      this.updatePendingCreate('QUIZ_CREATE', quizId, { [key]: value });
    }
  }
  /**
   * Safely update the `questions` array of a quiz within a module.
   * Only supports updating the entire questions array.
   * @param moduleIdx The index of the module within the form.
   * @param quizId The id of the quiz to update.
   * @param questions The new questions array to replace the current one.
   */
  updateQuizQuestionField(moduleIdx: number, quizId: string, questions: Quiz['questions']): void {
    const $module = this.config.curriculumForm.getValues(`modules.${moduleIdx}`);
    if (!module) return;

    const moduleId = module.id;

    const quiz = this.config.curriculumForm.getValues(`modules.${moduleIdx}.quiz`);
    if (!quiz || quiz.id !== quizId) return;

    const updatedQuiz = { ...quiz, questions };

    this.config.curriculumForm.setValue(`modules.${moduleIdx}.quiz`, updatedQuiz, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (!isTempId(quizId)) {
      this.queue.push({
        type: 'QUIZ_UPDATE',
        id: quizId,
        moduleId,
        data: { questions },
      });
    } else {
      this.updatePendingCreate('QUIZ_CREATE', quizId, { questions });
    }
  }

  /**
   * Delete a quiz (using module array index for target)
   */
  deleteQuiz(moduleIdx: number, quizId: string): void {
    const $module = this.config.modulesArray.fields[moduleIdx];
    if (!module) return;
    const moduleId = module.id;

    this.config.curriculumForm.setValue(`modules.${moduleIdx}.quiz`, undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (!isTempId(quizId)) {
      this.queue.push({
        type: 'QUIZ_DELETE',
        id: quizId,
        moduleId,
      });
    } else {
      this.removePendingCreate('QUIZ_CREATE', quizId);
    }
  }

  /**
   * Execute all pending operations
   */
  async commit(): Promise<CommitResult> {
    console.log('Commit called');

    console.log('Operation Ops : ' + JSON.stringify(this.queue.getAll(), null, 2));
    console.log('Queue is Empty : ' + this.queue.isEmpty());

    this.queue.normalize();
    console.log('Operation normalized : ' + JSON.stringify(this.queue.getAll(), null, 2));
    if (this.queue.isEmpty()) return { success: true };

    if (this.config.onBeforeCommit) {
      const ops = this.queue.getAll();
      try {
        const shouldProceed = this.config.onBeforeCommit(ops);
        if (shouldProceed === false) return { success: false };
      } catch (e) {
        this.config.onError?.(getErrorMessage(e) ?? 'onBeforeCommit threw an error');
        return { success: false };
      }
    }

    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    try {
      const executorPromise = this.executor.executeAll(this.queue);

      if (signal.aborted) {
        this.config.onError?.('Commit aborted');
        return { success: false };
      }

      await Promise.race([
        executorPromise,
        new Promise<never>((_, reject) =>
          signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
        ),
      ]);

      if (this.queue.hasFailures()) {
        const failedOps = this.queue.getFailedOps();
        this.config.onError?.(`${failedOps.length} operation(s) failed. You can retry.`);
        this.abortController = null;
        return {
          success: false,
          failedOps: this.queue.getResults().filter((r) => !r.success),
        };
      }

      this.queue.clear();

      this.config.curriculumForm.reset(undefined, { keepValues: true });

      this.config.onSuccess?.('All changes saved successfully');
      this.abortController = null;
      return { success: true };
    } catch (error) {
      if (error instanceof Error && error.message === 'aborted') {
        this.config.onError?.('Commit aborted');
      } else {
        const message = getErrorMessage(error, 'Unknown error');
        this.config.onError?.(message);
      }
      this.abortController = null;
      return { success: false };
    } finally {
      this.config.onSettled?.();
    }
  }

  /**
   * Abort an in-progress or next commit.
   * If a commit is in progress, will abort it via AbortController.
   * If no commit in progress, will abort the next commit invoked.
   */
  abortCommit(): void {
    if (this.abortController) {
      this.abortController.abort();
    } else {
      this.abortController = new AbortController();
      this.abortController.abort();
    }
  }

  /**
   * Retry failed operations
   */
  async retryFailed(): Promise<boolean> {
    const failedOps = this.queue.getFailedOps();
    if (failedOps.length === 0) return true;

    const retryQueue = new OperationQueue();
    retryQueue.pushMultiple(failedOps);

    try {
      await this.executor.executeAll(retryQueue);

      if (retryQueue.hasFailures()) {
        this.config.onError?.('Some operations still failed');
        return false;
      }

      this.queue.clear();
      this.config.onSuccess?.('All operations completed');
      return true;
    } catch (error) {
      const message = getErrorMessage(error, 'Unknown error');
      this.config.onError?.(message);
      return false;
    } finally {
      this.config.onSettled?.();
    }
  }

  /**
   * Save everything (basic + advanced + curriculum)
   */
  async saveAll(): Promise<boolean> {
    const basicAdvancedSuccess = await this.saveBasicAdvanced();
    if (!basicAdvancedSuccess) return false;

    const result = await this.commit();
    return result.success;
  }

  /**
   * Validate all forms
   */
  async validateAll(): Promise<boolean> {
    const [basicValid, advancedValid, curriculumValid] = await Promise.all([
      this.config.basicForm.trigger(),
      this.config.advancedForm.trigger(),
      this.config.curriculumForm.trigger(),
    ]);

    return basicValid && advancedValid && curriculumValid;
  }

  /**
   * Validate specific form
   */
  async validateForm(form: 'basic' | 'advanced' | 'curriculum'): Promise<boolean> {
    const formMap = {
      basic: this.config.basicForm,
      advanced: this.config.advancedForm,
      curriculum: this.config.curriculumForm,
    };

    const isFormValid = await formMap[form].trigger();
    const errors = formMap[form].formState?.errors;
    console.log(`Errors of ${form} : ` + JSON.stringify(errors, null, 2));

    return isFormValid;
  }

  /**
   * Check if there are unsaved changes
   */
  hasUnsavedChanges(): boolean {
    return (
      !this.queue.isEmpty() ||
      FormChangeDetector.hasBasicAdvancedChanges(this.config.basicForm, this.config.advancedForm) ||
      this.config.curriculumForm.formState.isDirty
    );
  }

  /**
   * Get pending operations count
   */
  getPendingOperationsCount(): number {
    return this.queue.size();
  }

  /**
   * Clear all pending operations
   */
  clearPendingOperations(): void {
    this.queue.clear();
  }

  /**
   * Get operation results
   */
  getResults(): readonly OpResult[] {
    return this.queue.getResults();
  }

  /**
   * Subscribe to operation queue changes
   */
  subscribe(listener: (size: number) => void): () => void {
    return this.queue.subscribe(listener);
  }

  private updatePendingCreate(
    type: 'MODULE_CREATE' | 'LESSON_CREATE' | 'QUIZ_CREATE',
    tempId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updates: any
  ): void {
    this.queue.updateCreateOp(
      (op) => op.type === type && 'tempId' in op && op.tempId === tempId,
      (op) => ('data' in op ? { ...op, data: { ...op.data, ...updates } } : { ...op })
    );
  }

  private removePendingCreate(
    type: 'MODULE_CREATE' | 'LESSON_CREATE' | 'QUIZ_CREATE',
    tempId: string
  ): void {
    this.queue.removeCreateOp((op) => op.type === type && 'tempId' in op && op.tempId === tempId);

    /**
     *  const ops = this.queue.getAll();
    const filtered = ops.filter(
      (op) => !(op.type === type && 'tempId' in op && op.tempId === tempId)
    );
    this.queue.clear();
    this.queue.pushMultiple(filtered as CourseOp[]);
     */
  }
}
