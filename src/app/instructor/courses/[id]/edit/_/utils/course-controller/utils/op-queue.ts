import { CourseOp, CurriculumOp, OpResult } from '../types';

type EntityKey = `section:${string}` | `lesson:${string}` | `quiz:${string}`;

/**
 * Manages the queue of operations to be executed
 */
export class OperationQueue {
  private queue: CourseOp[] = [];
  private results: OpResult[] = [];
  private readonly executedResults: OpResult[] = [];

  push(op: CourseOp): void {
    this.queue.push(op);
  }

  pushMultiple(ops: CourseOp[]): void {
    this.queue.push(...ops);
  }

  /**
   * Update operations in the queue matching a predicate using the provided updater.
   * Returns the count of updated items.
   */
  updateCreateOp<T extends CurriculumOp>(
    predicate: (op: T) => boolean,
    updater: (op: T) => T
  ): number {
    let updatedCount = 0;
    this.queue = this.queue.map((op) => {
      if (predicate(op as T)) {
        updatedCount++;
        return updater(op as T);
      }
      return op;
    });
    return updatedCount;
  }
  /**
   * Remove all CREATE operations from the queue that match the given predicate.
   * Returns the count of removed items.
   */
  removeCreateOp<T extends CurriculumOp>(predicate: (op: T) => boolean): number {
    let removedCount = 0;
    this.queue = this.queue.filter((op) => {
      if (typeof op.type === 'string' && op.type.endsWith('_CREATE') && predicate(op as T)) {
        removedCount++;
        return false;
      }
      return true;
    });
    return removedCount;
  }

  /**
   * Returns a COPY of all queued ops. Caller code cannot mutate internals.
   */
  getAll(): readonly CourseOp[] {
    return [...this.queue];
  }

  clear(): void {
    this.queue = [];
  }

  /**
   * Add a result to result-tracking (for retries, errors, etc)
   */
  addResult(result: OpResult) {
    this.executedResults.push(result);
  }

  getResults(): readonly OpResult[] {
    return [...this.executedResults];
  }

  getFailedOps(): CourseOp[] {
    return this.executedResults.filter((r) => !r.success).map((r) => r.op);
  }

  hasFailures(): boolean {
    return this.executedResults.some((r) => !r.success);
  }

  clearResults(): void {
    this.executedResults.length = 0;
  }

  size(): number {
    return this.queue.length;
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  private getEntityKey(op: CourseOp): EntityKey | null {
    switch (op.type) {
      case 'SECTION_CREATE':
      case 'SECTION_UPDATE':
      case 'SECTION_DELETE':
      case 'SECTION_REORDER':
        return `section:${'tempId' in op ? op.tempId : op.id}`;

      case 'LESSON_CREATE':
      case 'LESSON_UPDATE':
      case 'LESSON_DELETE':
      case 'LESSON_REORDER':
        return `lesson:${'tempId' in op ? op.tempId : op.id}`;

      case 'QUIZ_CREATE':
      case 'QUIZ_UPDATE':
      case 'QUIZ_DELETE':
        return `quiz:${'tempId' in op ? op.tempId : op.id}`;

      default:
        return null;
    }
  }

  public normalize(): void {
    const ops = this.queue;

    const entityMap = new Map<EntityKey, CourseOp[]>();

    for (const op of ops) {
      const key = this.getEntityKey(op);
      if (!key) continue;

      if (!entityMap.has(key)) {
        entityMap.set(key, []);
      }
      entityMap.get(key)!.push(op);
    }

    const normalized: CourseOp[] = [];

    for (const [, entityOps] of entityMap) {
      const result = this.coalesceEntityOps(entityOps);
      if (result) normalized.push(...result);
    }

    this.queue = normalized;
  }

  private coalesceEntityOps(ops: CourseOp[]): CourseOp[] | null {
    let createOp: CourseOp | null = null;
    let updateOp: CourseOp | null = null;
    let reorderOp: CourseOp | null = null;
    let deleteOp: CourseOp | null = null;

    for (const op of ops) {
      if (op.type.endsWith('_CREATE')) {
        createOp = op;
      } else if (op.type.endsWith('_UPDATE')) {
        updateOp = updateOp ? this.mergeUpdates(updateOp, op) : op;
      } else if (op.type.endsWith('_REORDER')) {
        reorderOp = op;
      } else if (op.type.endsWith('_DELETE')) {
        deleteOp = op;
      }
    }

    if (createOp && deleteOp) {
      console.warn('Dropped ops for entity', ops);
      return null;
    }

    if (createOp) {
      if (updateOp) {
        return [this.mergeCreateAndUpdate(createOp, updateOp)];
      }

      return [createOp];
    }

    if (deleteOp) {
      return [deleteOp];
    }

    const result: CourseOp[] = [];
    if (updateOp) result.push(updateOp);
    if (reorderOp) result.push(reorderOp);

    return result.length > 0 ? result : (console.warn('Dropped ops for entity', ops) ?? null);
  }

  private mergeCreateAndUpdate(create: CourseOp, update: CourseOp): CourseOp {
    if (!('data' in create) || !('data' in update)) {
      return create;
    }

    return {
      ...create,
      data: {
        ...create.data,
        ...update.data,
      },
    } as CourseOp;
  }

  private mergeUpdates(a: CourseOp, b: CourseOp): CourseOp {
    if (!('data' in a) || !('data' in b)) {
      return b;
    }

    return {
      ...a,
      data: {
        ...a.data,
        ...b.data,
      },
    } as CourseOp;
  }
}
