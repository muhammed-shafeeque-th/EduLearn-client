/* eslint-disable @typescript-eslint/no-explicit-any */

export class BatchOperations {
  /**
   * Execute operations in batches to avoid overwhelming the server
   */
  static async executeBatch<T>(
    operations: Array<() => Promise<T>>,
    batchSize = 5,
    onProgress?: (completed: number, total: number) => void
  ): Promise<Array<{ success: boolean; data?: T; error?: any }>> {
    const results: Array<{ success: boolean; data?: T; error?: any }> = [];

    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);

      const batchResults = await Promise.allSettled(batch.map((op) => op()));

      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push({ success: true, data: result.value });
        } else {
          results.push({ success: false, error: result.reason });
        }
      });

      onProgress?.(Math.min(i + batchSize, operations.length), operations.length);
    }

    return results;
  }
}
