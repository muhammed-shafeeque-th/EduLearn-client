type SingleFlightKey = string | number | symbol;

const pendingPromises: Map<SingleFlightKey, Promise<unknown>> = new Map();

/**
 * Deduplicates concurrent executions of the same async task.
 *
 * If an invocation with the same key is already in flight, returns its promise;
 * otherwise, executes the async fn and caches its promise until it settles.
 *
 * @param key - Unique identifier for the deduplication group.
 * @param fn - Function that returns a Promise to execute (only runs once per key at a time).
 * @returns Promise<T> shared by concurrent callers for the same key.
 */
export async function singleFlight<T>(key: SingleFlightKey, fn: () => Promise<T>): Promise<T> {
  if (pendingPromises.has(key)) {
    return pendingPromises.get(key) as Promise<T>;
  }
  const promise = fn().finally(() => {
    pendingPromises.delete(key);
  });
  pendingPromises.set(key, promise);
  return promise;
}
