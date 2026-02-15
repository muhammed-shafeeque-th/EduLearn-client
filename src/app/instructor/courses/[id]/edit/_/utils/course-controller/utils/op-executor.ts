import { CourseOp, CurriculumOp, IdMapping, OpResult } from '../types';
import { AdvancedInfoFormData, BasicInfoFormData } from '../../../schemas/course-schemas';
import { OperationQueue } from './op-queue';
import { isServerId, resolveId } from './utils';
import { getErrorMessage } from '@/lib/utils';
import {
  buildCoursePayload,
  buildLessonPayload,
  buildSectionPayload,
  mapToQuizPayload,
} from './helpers';
import { CurriculumSnapshot } from './curriculum-snapshot';

/**
 * Executes operations in the correct order with proper error handling
 */
export class OperationExecutor {
  private idMapping: IdMapping = {
    sections: new Map(),
    lessons: new Map(),
    quizzes: new Map(),
  };

  constructor(
    private courseId: string,
    private courseService: typeof import('@/services/course.service').courseService,
    private readonly snapshotFactory: () => CurriculumSnapshot
  ) {}

  /**
   * Execute all operations in proper order
   */
  async executeAll(queue: OperationQueue): Promise<void> {
    const ops = queue.getAll();

    console.log('Ops inside executeAll : ' + JSON.stringify(ops, null, 2));

    // Group operations by type for batch execution
    const grouped = this.groupOperations(ops);

    // Execute in order: Delete → Create → Update → Reorder
    await this.executeDeletes(grouped.deletes, queue);
    await this.executeCreates(grouped.creates, queue);
    await this.executeUpdates(grouped.updates, queue);
    await this.executeReorders(grouped.reorders, queue);
  }

  /**
   * Execute only basic/advanced updates
   */
  async executeBasicAdvanced(
    basicData: Partial<BasicInfoFormData>,
    advancedData: Partial<AdvancedInfoFormData>
  ): Promise<OpResult> {
    try {
      const payload = buildCoursePayload(basicData, advancedData);
      await this.courseService.updateCourse(this.courseId, payload);

      return {
        success: true,
        op: { type: 'BASIC_UPDATE', data: basicData },
      };
    } catch (error) {
      return {
        success: false,
        op: { type: 'BASIC_UPDATE', data: basicData },
        error: getErrorMessage(error),
      };
    }
  }

  private groupOperations(ops: readonly CourseOp[]) {
    return {
      deletes: ops.filter((op) => op.type.endsWith('_DELETE')) as Extract<
        CourseOp,
        { type: string & `${string}_DELETE` }
      >[],
      creates: ops.filter((op) => op.type.endsWith('_CREATE')) as Extract<
        CourseOp,
        { type: string & `${string}_CREATE` }
      >[],
      updates: ops.filter((op) => op.type.endsWith('_UPDATE')) as Extract<
        CourseOp,
        { type: string & `${string}_UPDATE` }
      >[],
      reorders: ops.filter((op) => op.type.endsWith('_REORDER')) as Extract<
        CourseOp,
        { type: string & `${string}_REORDER` }
      >[],
    };
  }

  private async executeDeletes(
    ops: Extract<CourseOp, { type: string & `${string}_DELETE` }>[],
    queue: OperationQueue
  ): Promise<void> {
    await Promise.all(
      ops.map(async (op) => {
        try {
          await this.executeDelete(op, queue);
        } catch (error) {
          queue.addResult({ success: false, op, error: getErrorMessage(error) });
        }
      })
    );
  }

  private async executeCreates(
    ops: Extract<CourseOp, { type: string & `${string}_CREATE` }>[],
    queue: OperationQueue
  ): Promise<void> {
    // Sections must be serial
    const sectionCreates = ops.filter((op) => op.type === 'SECTION_CREATE');
    for (const op of sectionCreates) {
      try {
        await this.executeCreate(op, queue);
      } catch (error) {
        queue.addResult({ success: false, op, error: getErrorMessage(error) });
      }
    }

    // Lessons/Quizzes parallel
    const childrenCreates = ops.filter((op) => op.type !== 'SECTION_CREATE');
    await Promise.all(
      childrenCreates.map(async (op) => {
        try {
          await this.executeCreate(op, queue);
        } catch (error) {
          queue.addResult({ success: false, op, error: getErrorMessage(error) });
        }
      })
    );
  }

  private async executeUpdates(
    ops: Extract<CourseOp, { type: string & `${string}_UPDATE` }>[],
    queue: OperationQueue
  ): Promise<void> {
    await Promise.all(
      ops.map(async (op) => {
        try {
          await this.executeUpdate(op, queue);
        } catch (error) {
          queue.addResult({ success: false, op, error: getErrorMessage(error) });
        }
      })
    );
  }

  private async executeReorders(
    ops: Extract<CourseOp, { type: string & `${string}_REORDER` }>[],
    queue: OperationQueue
  ): Promise<void> {
    // Reorders are typically cheap, run in parallel
    await Promise.allSettled(ops.map((op) => this.executeReorder(op, queue)));
  }

  private async executeDelete(
    op: Extract<CourseOp, { type: string & `${string}_DELETE` }>,
    queue: OperationQueue
  ): Promise<void> {
    // Only delete if it's a real server ID
    if (op.type === 'SECTION_DELETE' && isServerId(op.id)) {
      await this.courseService.deleteSection(this.courseId, op.id);
      queue.addResult({
        success: true,
        op,
        error: undefined,
      });
    } else if (op.type === 'LESSON_DELETE' && isServerId(op.id)) {
      const sectionId = resolveId(op.sectionId, this.idMapping.sections);
      await this.courseService.deleteLesson(this.courseId, sectionId, op.id);
      queue.addResult({
        success: true,
        op,
        error: undefined,
      });
    } else if (op.type === 'QUIZ_DELETE' && isServerId(op.id)) {
      const sectionId = resolveId(op.sectionId, this.idMapping.sections);
      await this.courseService.deleteQuiz(this.courseId, sectionId, op.id);
      queue.addResult({
        success: true,
        op,
        error: undefined,
      });
    } else {
      // Temp ID delete (no server call needed)
      queue.addResult({ success: true, op });
    }
  }

  private async executeCreate(
    op: Extract<CurriculumOp, { type: string & `${string}_CREATE` }>,
    queue: OperationQueue
  ): Promise<void> {
    if (op.type === 'SECTION_CREATE') {
      const sectionId = resolveId(op.tempId, this.idMapping.sections);
      const snapshot = this.snapshotFactory();
      const section = snapshot.getSection(sectionId);
      if (!section) throw new Error(`Data for section ${op.tempId} not found in form snapshot`);

      const payload = buildSectionPayload(op.data);
      const result = await this.courseService.createSection(this.courseId, payload);

      if (result.success && result.data?.id) {
        this.idMapping.sections.set(op.tempId, result.data.id);
        queue.addResult({ success: true, op, newId: result.data.id });
      } else {
        queue.addResult({ success: false, op, error: result.message });
      }
    } else if (op.type === 'LESSON_CREATE') {
      const sectionId = resolveId(op.sectionId, this.idMapping.sections);
      const snapshot = this.snapshotFactory();
      const lesson = snapshot.getLesson(sectionId, op.tempId);

      if (!lesson) return;

      const payload = buildLessonPayload(lesson);

      const result = await this.courseService.createLesson(this.courseId, sectionId, payload);

      if (result.success && result.data?.id) {
        this.idMapping.lessons.set(op.tempId, result.data.id);
        queue.addResult({ success: true, op, newId: result.data.id });
      } else {
        queue.addResult({ success: false, op, error: result.message });
      }
    } else if (op.type === 'QUIZ_CREATE') {
      const sectionId = resolveId(op.sectionId, this.idMapping.sections);
      const payload = mapToQuizPayload(op.data);
      const result = await this.courseService.createQuiz(this.courseId, sectionId, payload);

      if (result.success && result.data?.id) {
        this.idMapping.quizzes.set(op.tempId, result.data.id);
        queue.addResult({ success: true, op, newId: result.data.id });
      } else {
        queue.addResult({ success: false, op, error: result.message });
      }
    }
  }

  private async executeUpdate(
    op: Extract<CourseOp, { type: string & `${string}_UPDATE` }>,
    queue: OperationQueue
  ): Promise<void> {
    const snapshot = this.snapshotFactory();
    if (op.type === 'SECTION_UPDATE') {
      const fullSection = snapshot.getSection(op.id);
      console.log('Recieved full section :' + JSON.stringify(fullSection, null, 2));

      if (!fullSection) return;
      const payload = buildSectionPayload(fullSection);
      const result = await this.courseService.updateSection(this.courseId, op.id, payload);
      queue.addResult({
        success: result.success,
        op,
        error: result.success ? undefined : result.message,
      });
    } else if (op.type === 'LESSON_UPDATE') {
      const sectionId = resolveId(op.sectionId, this.idMapping.sections);

      const snapshot = this.snapshotFactory();
      const fullLesson = snapshot.getLesson(sectionId, op.id);

      if (!fullLesson) return;

      const payload = buildLessonPayload(fullLesson); // FULL LESSON
      const result = await this.courseService.updateLesson(
        this.courseId,
        sectionId,
        op.id,
        payload
      );
      queue.addResult({
        success: result.success,
        op,
        error: result.success ? undefined : result.message,
      });
    } else if (op.type === 'QUIZ_UPDATE') {
      const sectionId = resolveId(op.sectionId, this.idMapping.sections);

      const snapshot = this.snapshotFactory();
      const quiz = snapshot.getQuiz(sectionId);

      if (!quiz) return;

      const payload = mapToQuizPayload(quiz);
      const result = await this.courseService.updateQuiz(this.courseId, sectionId, op.id, payload);
      queue.addResult({
        success: result.success,
        op,
        error: result.success ? undefined : result.message,
      });
    }
  }

  private async executeReorder(
    op: Extract<CourseOp, { type: string & `${string}_REORDER` }>,
    queue: OperationQueue
  ): Promise<void> {
    // Implement reorder logic if your API supports it
    queue.addResult({ success: true, op });
  }

  getIdMapping(): IdMapping {
    return this.idMapping;
  }
}
