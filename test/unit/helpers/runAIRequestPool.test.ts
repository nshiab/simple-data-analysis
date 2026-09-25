import { FakeTime } from "@std/testing/time";
import {
  assert,
  assertEquals,
  assertInstanceOf,
  assertRejects,
} from "@std/assert";
import runAIRequestPool from "../../../src/helpers/runAIRequestPool.ts";

Deno.test("retries a failed processed response", async () => {
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

  assertEquals(attempts, 2);
  assertEquals(results, ["valid response"]);
  assertEquals(errors, [undefined]);
});

Deno.test("records an error when retryCheck rejects it", async () => {
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

  assertEquals(attempts, 1);
  assertEquals(results, [undefined]);
  assertInstanceOf(errors[0], Error);
});

Deno.test("preserves task order with concurrent workers", async () => {
  const { results } = await runAIRequestPool([
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return "first";
    },
    () => Promise.resolve("second"),
  ], 2);

  assertEquals(results, ["first", "second"]);
});

Deno.test("spaces provider request starts across concurrent workers", async () => {
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

  assertEquals(starts.length, 3);
  assert(starts[1] - starts[0] >= 20);
  assert(starts[2] - starts[1] >= 20);
});

Deno.test("does not wait after the final provider request", async () => {
  const start = performance.now();
  await runAIRequestPool(
    [async (beforeRequest) => {
      await beforeRequest();
      return "done";
    }],
    100,
    { minRequestIntervalMs: 1_000 },
  );

  assert(performance.now() - start < 500);
});

Deno.test("refills free slots around a blocked request and bounds concurrency", async () => {
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
    assertEquals(starts.slice(0, 3), [0, 1, 2]);
    assertEquals(peak, 2);
  } finally {
    gate.resolve();
  }
  assertEquals((await pending).results, [0, 1, 2, 3]);
});

Deno.test("paces dispatched retries and sequential batches while cache hits bypass pacing", async () => {
  using time = new FakeTime(0);
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
  await time.runMicrotasks();
  await time.runAllAsync();
  assertEquals((await first).results, ["retried", "cached", "provider"]);
  const second = runAIRequestPool([task], 2, {
    minRequestIntervalMs: 100,
    state,
  });
  await time.runMicrotasks();
  await time.runAllAsync();
  await second;
  assertEquals(starts, [0, 100, 200, 300]);
  assertEquals(state.completed, 4);
});

Deno.test("retry policy failures drain active work before rejecting", async () => {
  using time = new FakeTime(0);
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
  const observed = pending.then(() => {
    settled = true;
  }, (error) => {
    settled = true;
    assertEquals(error, policyError);
  });
  await time.runMicrotasks();
  assertEquals(settled, false);
  gate.resolve();
  await observed;
  assertEquals(settled, true);
});

Deno.test("stopOnError cancels pacing waits and does not dispatch queued work or retry", async () => {
  using time = new FakeTime(0);
  let requests = 0;
  const pending = runAIRequestPool(
    Array.from(
      { length: 5 },
      () => async (beforeRequest: () => Promise<void>) => {
        await beforeRequest();
        requests++;
        throw new Error("provider failed");
      },
    ),
    2,
    { stopOnError: true, minRequestIntervalMs: 60_000 },
  );
  await assertRejects(() => pending, Error, "provider failed");
  assertEquals(requests, 1);
  await time.runMicrotasks();
  await time.runAllAsync();
  assertEquals(time.now, 0);
});

Deno.test("validates pool options even for empty input", async () => {
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
  assertEquals(await runAIRequestPool([], 1), { results: [], errors: [] });
});
