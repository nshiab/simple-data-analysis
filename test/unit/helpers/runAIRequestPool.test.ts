import { assertEquals, assertInstanceOf } from "@std/assert";
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
