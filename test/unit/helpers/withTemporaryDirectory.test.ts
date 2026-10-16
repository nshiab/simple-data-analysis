import { test, expect } from "vite-plus/test";
import { assert, assertRejects } from "../../helpers/assertions.ts";
import { existsSync } from "node:fs";
import withTemporaryDirectory from "../../../src/helpers/withTemporaryDirectory.ts";

test("withTemporaryDirectory starts work synchronously and cleans up", async () => {
  let directory = "";
  let started = false;
  const result = withTemporaryDirectory("sda-test-", (path) => {
    directory = path;
    started = true;
    assert(existsSync(path));
    return Promise.resolve("done");
  });

  assert(started);
  expect(await result).toEqual("done");
  expect(existsSync(directory)).toEqual(false);
});

test("withTemporaryDirectory cleans up after an operation fails", async () => {
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
  expect(existsSync(directory)).toEqual(false);
});
