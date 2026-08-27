import { assert, assertEquals, assertInstanceOf } from "@std/assert";
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
