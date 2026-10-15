import { test, expect } from "vite-plus/test";
import { afterEach, vi } from "vite-plus/test";
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
import { assert, assertInstanceOf, assertRejects } from "../../helpers/assertions.ts";
import runAIRequestPool from "../../../src/helpers/runAIRequestPool.ts";

test("retries a failed processed response", async () => {
  let attempts = 0;
  const { results, errors } = await runAIRequestPool(
    [
      () => {
        attempts++;
        if (attempts === 1) {
          throw new Error("invalid response");
        }
        return Promise.resolve("valid response");
      },
    ],
    1,
    { retry: 1 },
  );

  expect(attempts).toEqual(2);
  expect(results).toEqual(["valid response"]);
  expect(errors).toEqual([undefined]);
});

test("records an error when retryCheck rejects it", async () => {
  let attempts = 0;
  const { results, errors } = await runAIRequestPool(
    [
      () => {
        attempts++;
        return Promise.reject(new Error("do not retry"));
      },
    ],
    1,
    {
      retry: 2,
      retryCheck: () => false,
    },
  );

  expect(attempts).toEqual(1);
  expect(results).toEqual([undefined]);
  assertInstanceOf(errors[0], Error);
});

test("preserves task order with concurrent workers", async () => {
  const { results } = await runAIRequestPool(
    [
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return "first";
      },
      () => Promise.resolve("second"),
    ],
    2,
  );

  expect(results).toEqual(["first", "second"]);
});

test("spaces provider request starts across concurrent workers", async () => {
  const starts: number[] = [];
  await runAIRequestPool(
    Array.from({ length: 3 }, () => async (beforeRequest) => {
      await beforeRequest();
      starts.push(performance.now());
      return "done";
    }),
    3,
    { minRequestIntervalMs: 30 },
  );

  expect(starts.length).toEqual(3);
  assert(starts[1] - starts[0] >= 20);
  assert(starts[2] - starts[1] >= 20);
});

test("does not release overdue requests together after the event loop stalls", async () => {
  vi.useFakeTimers({ now: 0, toFake: ["Date", "setTimeout", "clearTimeout"] });
  const starts: number[] = [];
  const pending = runAIRequestPool(
    Array.from({ length: 3 }, (_, index) => async (beforeRequest) => {
      await beforeRequest();
      starts.push(Date.now());
      if (index === 0) {
        // Expire timers without yielding to their promise continuations, as a
        // synchronous provider operation or an overloaded event loop would.
        vi.advanceTimersByTime(120);
      }
      return index;
    }),
    2,
    { minRequestIntervalMs: 50 },
  );
  await vi.runAllTimersAsync();
  await pending;
  expect(starts).toHaveLength(3);
  for (let i = 1; i < starts.length; i++) {
    expect(starts[i] - starts[i - 1]).toBeGreaterThanOrEqual(50);
  }
});

test("does not wait after the final provider request", async () => {
  const start = performance.now();
  await runAIRequestPool(
    [
      async (beforeRequest) => {
        await beforeRequest();
        return "done";
      },
    ],
    100,
    { minRequestIntervalMs: 1_000 },
  );

  assert(performance.now() - start < 500);
});

test("refills free slots around a blocked request and bounds concurrency", async () => {
  const gate = Promise.withResolvers<void>();
  const third = Promise.withResolvers<void>();
  const starts: number[] = [];
  let active = 0;
  let peak = 0;
  const pending = runAIRequestPool(
    [0, 1, 2, 3].map((id) => async () => {
      starts.push(id);
      peak = Math.max(peak, ++active);
      if (id === 0) await gate.promise;
      if (id === 2) third.resolve();
      active--;
      return id;
    }),
    2,
  );
  try {
    await third.promise;
    expect(starts.slice(0, 3)).toEqual([0, 1, 2]);
    expect(peak).toEqual(2);
  } finally {
    gate.resolve();
  }
  expect((await pending).results).toEqual([0, 1, 2, 3]);
});

test("paces dispatched retries and sequential batches while cache hits bypass pacing", async () => {
  vi.useFakeTimers({ now: 0, toFake: ["Date", "setTimeout", "clearTimeout"] });
  const state = { nextRequestStart: 0, completed: 0, total: 4 };
  const starts: number[] = [];
  let attempts = 0;
  const task = async (beforeRequest: () => Promise<void>) => {
    await beforeRequest();
    starts.push(Date.now());
    return "provider";
  };
  const first = runAIRequestPool(
    [
      async (beforeRequest) => {
        await task(beforeRequest);
        if (++attempts === 1) throw new Error("retry me");
        return "retried";
      },
      () => Promise.resolve("cached"),
      task,
    ],
    2,
    { retry: 1, minRequestIntervalMs: 100, state },
  );
  await vi.advanceTimersByTimeAsync(0);
  await vi.runAllTimersAsync();
  expect((await first).results).toEqual(["retried", "cached", "provider"]);
  const second = runAIRequestPool([task], 2, {
    minRequestIntervalMs: 100,
    state,
  });
  await vi.advanceTimersByTimeAsync(0);
  await vi.runAllTimersAsync();
  await second;
  expect(starts).toEqual([0, 100, 200, 300]);
  expect(state.completed).toEqual(4);
});

test("retry policy failures drain active work before rejecting", async () => {
  vi.useFakeTimers({ now: 0, toFake: ["Date", "setTimeout", "clearTimeout"] });
  const gate = Promise.withResolvers<void>();
  let settled = false;
  const policyError = new Error("retry predicate failed");
  const pending = runAIRequestPool(
    [
      () => Promise.reject(new Error("provider failed")),
      async () => {
        await gate.promise;
        return "finished";
      },
    ],
    2,
    {
      retry: 1,
      retryCheck: () => {
        throw policyError;
      },
    },
  );
  const observed = pending.then(
    () => {
      settled = true;
    },
    (error) => {
      settled = true;
      expect(error).toEqual(policyError);
    },
  );
  await vi.advanceTimersByTimeAsync(0);
  expect(settled).toEqual(false);
  gate.resolve();
  await observed;
  expect(settled).toEqual(true);
});

test("stopOnError cancels pacing waits and does not dispatch queued work or retry", async () => {
  vi.useFakeTimers({ now: 0, toFake: ["Date", "setTimeout", "clearTimeout"] });
  let requests = 0;
  const pending = runAIRequestPool(
    Array.from({ length: 5 }, () => async (beforeRequest: () => Promise<void>) => {
      await beforeRequest();
      requests++;
      throw new Error("provider failed");
    }),
    2,
    { stopOnError: true, minRequestIntervalMs: 60_000 },
  );
  await assertRejects(() => pending, Error, "provider failed");
  expect(requests).toEqual(1);
  await vi.advanceTimersByTimeAsync(0);
  await vi.runAllTimersAsync();
  expect(Date.now()).toEqual(0);
});

test("validates pool options even for empty input", async () => {
  for (const size of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    await assertRejects(() => runAIRequestPool([], size), Error, "poolSize");
  }
  for (const interval of [-1, NaN, Infinity]) {
    await assertRejects(
      () => runAIRequestPool([], 1, { minRequestIntervalMs: interval }),
      Error,
      "minRequestIntervalMs",
    );
  }
  expect(await runAIRequestPool([], 1)).toEqual({ results: [], errors: [] });
});
