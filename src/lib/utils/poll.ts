export type PollResult<T> = { ok: true; data: T } | { ok: false; error: Error };

export async function pollUntil<T>({
  fn,
  validate,
  interval = 2000,
  maxAttempts = 40,
  maxInterval = 30_000,
}: {
  fn: () => Promise<T>;
  validate: (t: T) => boolean;
  interval?: number;
  maxAttempts?: number;
  maxInterval?: number;
}): Promise<T> {
  let attempts = 0;
  let delay = interval;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const result = await fn();
      if (validate(result)) return result;
      // else continue
    } catch (err) {
      if (attempts >= maxAttempts) throw err;
    }
    // jittered backoff
    const jitter = Math.round(Math.random() * 300);
    await new Promise((r) => setTimeout(r, Math.min(maxInterval, delay + jitter)));
    delay = Math.min(maxInterval, Math.round(delay * 1.25));
  }
  throw new Error('Polling timeout');
}
