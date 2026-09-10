import sleep from "./sleep.ts";

type PoolOptions = {
  retry?: number;
  retryCheck?: (error: unknown) => Promise<boolean> | boolean;
  minRequestIntervalMs?: number;
  logProgress?: boolean;
  /** Shares request pacing and progress across sequential transfer batches. */
  state?: { nextRequestStart: number; completed: number; total: number };
};

/** Runs indexed AI request tasks with bounded concurrency and retry handling. */
export default async function runAIRequestPool<T>(
  tasks: ((beforeRequest: () => Promise<void>) => Promise<T>)[],
  poolSize: number,
  options: PoolOptions = {},
): Promise<{
  results: (T | undefined)[];
  errors: (unknown | undefined)[];
}> {
  if (!Number.isInteger(poolSize) || poolSize < 1) {
    throw new Error("poolSize must be a positive integer.");
  }

  const results: (T | undefined)[] = Array(tasks.length).fill(undefined);
  const errors: (unknown | undefined)[] = Array(tasks.length).fill(undefined);
  let nextIndex = 0;
  const state = options.state ?? {
    nextRequestStart: 0,
    completed: 0,
    total: tasks.length,
  };

  const beforeRequest = async () => {
    const interval = options.minRequestIntervalMs ?? 0;
    const now = Date.now();
    const requestStart = Math.max(now, state.nextRequestStart);
    state.nextRequestStart = requestStart + interval;
    const wait = requestStart - now;
    if (wait > 0) {
      await sleep(wait);
    }
  };

  const worker = async () => {
    while (nextIndex < tasks.length) {
      const index = nextIndex++;
      let retries = 0;

      while (true) {
        try {
          results[index] = await tasks[index](beforeRequest);
          break;
        } catch (error) {
          const shouldRetry = retries < (options.retry ?? 0) &&
            (options.retryCheck ? await options.retryCheck(error) : true);
          if (!shouldRetry) {
            errors[index] = error;
            break;
          }
          retries++;
        }
      }

      state.completed++;
      if (options.logProgress) {
        console.log(`Processed ${state.completed} of ${state.total} requests.`);
      }
    }
  };

  await Promise.all(
    Array.from(
      { length: Math.min(poolSize, tasks.length) },
      () => worker(),
    ),
  );

  return { results, errors };
}
