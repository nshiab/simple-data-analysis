import { assert, assertEquals, assertRejects } from "@std/assert";
import { existsSync } from "node:fs";
import withTemporaryDirectory from "../../../src/helpers/withTemporaryDirectory.ts";

Deno.test("withTemporaryDirectory starts work synchronously and cleans up", async () => {
  let directory = "";
  let started = false;
  const result = withTemporaryDirectory("sda-test-", (path) => {
    directory = path;
    started = true;
    assert(existsSync(path));
    return Promise.resolve("done");
  });

  assert(started);
  assertEquals(await result, "done");
  assertEquals(existsSync(directory), false);
});

Deno.test("withTemporaryDirectory cleans up after an operation fails", async () => {
  let directory = "";
  await assertRejects(
    () =>
      withTemporaryDirectory("sda-test-", (path) => {
        directory = path;
        return Promise.reject(new Error("operation failed"));
      }),
    Error,
    "operation failed",
  );
  assertEquals(existsSync(directory), false);
});
