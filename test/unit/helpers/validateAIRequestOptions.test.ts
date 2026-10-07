import { assertThrows } from "@std/assert";
import validateAIRequestOptions from "../../../src/helpers/validateAIRequestOptions.ts";

Deno.test("validates AI concurrency and provider rate limits", () => {
  validateAIRequestOptions({});
  validateAIRequestOptions({ concurrency: 2, rateLimitPerMinute: 0.5 });
  for (
    const concurrency of [
      0,
      -1,
      0.5,
      NaN,
      Infinity,
      Number.MAX_SAFE_INTEGER + 1,
    ]
  ) {
    assertThrows(
      () => validateAIRequestOptions({ concurrency }),
      Error,
      "concurrency",
    );
  }
  for (const rateLimitPerMinute of [0, -1, NaN, Infinity, Number.MIN_VALUE]) {
    assertThrows(
      () => validateAIRequestOptions({ rateLimitPerMinute }),
      Error,
      "rateLimitPerMinute",
    );
  }
});
