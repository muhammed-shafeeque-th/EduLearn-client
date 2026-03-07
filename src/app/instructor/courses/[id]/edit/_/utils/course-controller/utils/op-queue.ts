/* eslint-disable @typescript-eslint/no-explicit-any */
import { CourseOp, CurriculumOp, OpResult } from '../types';

type EntityKey = `section:${string}` | `lesson:${string}` | `quiz:${string}`;
type Listener = (size: number) => void;

/**
 * Manages the queue of operations with reactive subscription support
 */
export class OperationQueue {
  private queue: CourseOp[] = [];
  private readonly executedResults: OpResult[] = [];
  private listeners: Set<Listener> = new Set();

  /**
   * Subscribe to queue size changes
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l(this.queue.length));
  }

  push(op: CourseOp): void {
    this.queue.push(op);
    this.notify();
  }

  pushMultiple(ops: CourseOp[]): void {
    this.queue.push(...ops);
    this.notify();
  }

  /**
   * Update operations in the queue matching a predicate
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
    if (updatedCount > 0) this.notify();
    return updatedCount;
  }

  /**
   * Remove CREATE operations matching the predicate
   */
  removeCreateOp<T extends CurriculumOp>(predicate: (op: T) => boolean): number {
    const initialLen = this.queue.length;
    this.queue = this.queue.filter((op) => {
      if (typeof op.type === 'string' && op.type.endsWith('_CREATE') && predicate(op as T)) {
        return false;
      }
      return true;
    });

    const removedCount = initialLen - this.queue.length;
    if (removedCount > 0) this.notify();
    return removedCount;
  }

  getAll(): readonly CourseOp[] {
    return [...this.queue];
  }

  clear(): void {
    this.queue = [];
    this.notify();
  }

  /**
   * Metrics and Result Tracking
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

  /**
   * Normalizes the queue by coalescing redundant operations
   */
  public normalize(): void {
    const entityMap = new Map<EntityKey, CourseOp[]>();

    for (const op of this.queue) {
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

    const hasChanged = this.queue.length !== normalized.length;
    this.queue = normalized;
    if (hasChanged) this.notify();
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
        // Only keep the LAST reorder operation as it represents the final state
        reorderOp = op;
      } else if (op.type.endsWith('_DELETE')) {
        deleteOp = op;
      }
    }

    // Optimization: If created and then deleted, just drop both
    if (createOp && deleteOp) return null;

    // Create + Update = Merged Create
    if (createOp) {
      return [updateOp ? this.mergeCreateAndUpdate(createOp, updateOp) : createOp];
    }

    // Delete trumps updates/reorders
    if (deleteOp) return [deleteOp];

    const result: CourseOp[] = [];
    if (updateOp) result.push(updateOp);
    if (reorderOp) result.push(reorderOp);

    return result.length > 0 ? result : null;
  }

  private mergeCreateAndUpdate(create: CourseOp, update: CourseOp): CourseOp {
    if (!('data' in create) || !('data' in update)) return create;

    return {
      ...create,
      data: {
        ...(create.data as any),
        ...(update.data as any),
      },
    } as CourseOp;
  }

  private mergeUpdates(a: CourseOp, b: CourseOp): CourseOp {
    if (!('data' in a) || !('data' in b)) return b;

    return {
      ...a,
      data: {
        ...(a.data as any),
        ...(b.data as any),
      },
    } as CourseOp;
  }
}
