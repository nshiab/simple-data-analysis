import { mkdtempSync } from "node:fs";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Runs work in a unique temporary directory and removes it afterwards.
 *
 * @param prefix - The temporary directory name prefix.
 * @param operation - The work to run with the temporary directory path.
 * @returns The result of the operation.
 * @internal
 */
export default async function withTemporaryDirectory<T>(
  prefix: string,
  operation: (directory: string) => Promise<T>,
): Promise<T> {
  const directory = mkdtempSync(join(tmpdir(), prefix));
  let outcome:
    | { success: true; value: T }
    | { success: false; error: unknown };

  try {
    outcome = { success: true, value: await operation(directory) };
  } catch (error) {
    outcome = { success: false, error };
  }

  try {
    await rm(directory, { recursive: true, force: true });
  } catch (cleanupError) {
    if (!outcome.success) {
      throw new AggregateError(
        [outcome.error, cleanupError],
        "The bucket operation and temporary-file cleanup both failed.",
        { cause: outcome.error },
      );
    }
    throw cleanupError;
  }

  if (!outcome.success) {
    throw outcome.error;
  }
  return outcome.value;
}
