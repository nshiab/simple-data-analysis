import { expect } from "vite-plus/test";

/** Capture thrown errors while checking both their type and message. */
export function assertThrows<E extends Error>(
  run: () => unknown,
  errorClass: abstract new (...args: never[]) => E,
  messageIncludes?: string,
  message?: string,
): E;
export function assertThrows(
  run: () => unknown,
  errorClass?: undefined,
  messageIncludes?: string,
  message?: string,
): Error;
export function assertThrows(
  run: () => unknown,
  errorClass?: abstract new (...args: never[]) => Error,
  messageIncludes?: string,
  message?: string,
): Error {
  try {
    run();
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    if (errorClass) expect(error, message).toBeInstanceOf(errorClass);
    if (messageIncludes !== undefined) expect(error.message, message).toContain(messageIncludes);
    return error;
  }
  throw new Error("Expected the function to throw.");
}

/** Capture rejected errors for subsequent assertions without losing message checks. */
export function assertRejects<E extends Error>(
  run: () => Promise<unknown>,
  errorClass: abstract new (...args: never[]) => E,
  messageIncludes?: string,
  message?: string,
): Promise<E>;
export function assertRejects(
  run: () => Promise<unknown>,
  errorClass?: undefined,
  messageIncludes?: string,
  message?: string,
): Promise<Error>;
export async function assertRejects(
  run: () => Promise<unknown>,
  errorClass?: abstract new (...args: never[]) => Error,
  messageIncludes?: string,
  message?: string,
): Promise<Error> {
  const promise = run();
  try {
    await promise;
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    if (errorClass) expect(error, message).toBeInstanceOf(errorClass);
    if (messageIncludes !== undefined) expect(error.message, message).toContain(messageIncludes);
    return error;
  }
  throw new Error("Expected the function to reject.");
}

/** Check an absolute numeric tolerance, including exact matching infinities. */
export function assertAlmostEquals(
  actual: number,
  expected: number,
  tolerance = 1e-7,
  message?: string,
): void {
  if (Object.is(actual, expected)) return;
  expect(Math.abs(actual - expected), message).toBeLessThanOrEqual(tolerance);
}

export { ok as assert } from "node:assert/strict";

export function assertInstanceOf<T>(
  value: unknown,
  constructor: abstract new (...args: never[]) => T,
): asserts value is T {
  expect(value).toBeInstanceOf(constructor);
}
