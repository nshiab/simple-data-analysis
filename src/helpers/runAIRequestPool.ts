import sleep from "./sleep.ts";

type PoolOptions = {
  retry?: number;
  retryCheck?: (error: unknown) => Promise<boolean> | boolean;
  minRequestIntervalMs?: number;
  logProgress?: boolean;
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
  let completed = 0;
  let nextRequestStart = 0;

  const beforeRequest = async () => {
    const interval = options.minRequestIntervalMs ?? 0;
    const now = Date.now();
    const requestStart = Math.max(now, nextRequestStart);
    nextRequestStart = requestStart + interval;
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

      completed++;
      if (options.logProgress) {
        console.log(`Processed ${completed} of ${tasks.length} requests.`);
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
