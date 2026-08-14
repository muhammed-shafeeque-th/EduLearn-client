/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Queue for managing async operations with retry logic
 */
export class OperationQueue {
  private queue: Array<{
    id: string;
    operation: () => Promise<any>;
    retryCount: number;
    maxRetries: number;
  }> = [];

  constructor(private maxRetries = 3) {}

  /**
   * Add operation to queue
   */
  add(id: string, operation: () => Promise<any>) {
    this.queue.push({
      id,
      operation,
      retryCount: 0,
      maxRetries: this.maxRetries,
    });
  }

  /**
   * Execute all operations with retry logic
   */
  async executeAll(): Promise<{
    successful: string[];
    failed: Array<{ id: string; error: string }>;
  }> {
    const successful: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    for (const item of this.queue) {
      let success = false;
      let lastError: any;

      while (!success && item.retryCount <= item.maxRetries) {
        try {
          await item.operation();
          successful.push(item.id);
          success = true;
        } catch (error) {
          lastError = error;
          item.retryCount++;

          if (item.retryCount <= item.maxRetries) {
            // Exponential backoff
            await this.delay(Math.pow(2, item.retryCount) * 1000);
          }
        }
      }

      if (!success) {
        failed.push({
          id: item.id,
          error: lastError?.message || 'Unknown error',
        });
      }
    }

    // Clear successful operations
    this.queue = this.queue.filter((item) => failed.some((f) => f.id === item.id));

    return { successful, failed };
  }

  /**
   * Get remaining operations count
   */
  getRemainingCount(): number {
    return this.queue.length;
  }

  /**
   * Clear queue
   */
  clear() {
    this.queue = [];
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
