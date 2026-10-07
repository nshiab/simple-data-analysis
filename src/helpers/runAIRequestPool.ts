type PoolOptions = {
  retry?: number;
  retryCheck?: (error: unknown) => Promise<boolean> | boolean;
  minRequestIntervalMs?: number;
  logProgress?: boolean;
  /** Stops taking new tasks after a terminal failure and settles active work. */
  stopOnError?: boolean;
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
  if (!Number.isSafeInteger(poolSize) || poolSize < 1) {
    throw new Error("poolSize must be a positive safe integer.");
  }
  const interval = options.minRequestIntervalMs ?? 0;
  if (!Number.isFinite(interval) || interval < 0) {
    throw new Error("minRequestIntervalMs must be finite and non-negative.");
  }

  const results: (T | undefined)[] = Array(tasks.length).fill(undefined);
  const errors: (unknown | undefined)[] = Array(tasks.length).fill(undefined);
  let nextIndex = 0;
  let failure: { error: unknown } | undefined;
  const pendingWaits = new Set<() => void>();
  const state = options.state ?? {
    nextRequestStart: 0,
    completed: 0,
    total: tasks.length,
  };

  const throwIfStopped = () => {
    if (failure) throw failure.error;
  };

  const beforeRequest = async () => {
    throwIfStopped();
    const now = Date.now();
    const requestStart = Math.max(now, state.nextRequestStart);
    state.nextRequestStart = requestStart + interval;
    const wait = requestStart - now;
    if (wait > 0) {
      await new Promise<void>((resolve) => {
        const finish = () => {
          clearTimeout(timer);
          pendingWaits.delete(finish);
          resolve();
        };
        const timer = setTimeout(finish, wait);
        pendingWaits.add(finish);
      });
    }
    // A terminal failure cancels pacing waits before they can dispatch.
    throwIfStopped();
  };

  const worker = async () => {
    try {
      while (!failure && nextIndex < tasks.length) {
        const index = nextIndex++;
        let retries = 0;

        while (true) {
          throwIfStopped();
          try {
            results[index] = await tasks[index](beforeRequest);
            break;
          } catch (error) {
            throwIfStopped();
            const shouldRetry = retries < (options.retry ?? 0) &&
              (options.retryCheck ? await options.retryCheck(error) : true);
            if (!shouldRetry) {
              if (options.stopOnError) throw error;
              errors[index] = error;
              break;
            }
            retries++;
          }
        }

        state.completed++;
        if (options.logProgress) {
          console.log(
            `Processed ${state.completed} of ${state.total} requests.`,
          );
        }
      }
    } catch (error) {
      failure ??= { error };
      for (const finish of pendingWaits) finish();
    }
  };

  await Promise.all(
    Array.from(
      { length: Math.min(poolSize, tasks.length) },
      () => worker(),
    ),
  );
  if (failure) throw failure.error;
  return { results, errors };
}
