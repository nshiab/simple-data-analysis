import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

// Test data from dataPad.json has key1: "a", "b", "c", "d" (single chars)
// and key2: "!@a!@", "!@b!@", "!@c!@", "!@d!@" (6 chars)

Deno.test("should left-pad with default character (space)", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/dataPad.json"]);

  // key1 = "a" (1 char), pad to 5 => "    a" (4 spaces added on left)
  await table.pad("key1", { length: 5 });
  const data = await table.getData();

  assertEquals(data, [
    { key1: "    a", key2: "!@a!@" },
    { key1: "    b", key2: "!@b!@" },
    { key1: "    c", key2: "!@c!@" },
    { key1: "    d", key2: "!@d!@" },
  ]);

  await sdb.done();
});

Deno.test("should left-pad with custom character", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/dataPad.json"]);

  // key1 = "a" (1 char), pad to 3 with "0" => "00a"
  await table.pad("key1", { length: 3, character: "0" });
  const data = await table.getData();

  assertEquals(data, [
    { key1: "00a", key2: "!@a!@" },
    { key1: "00b", key2: "!@b!@" },
    { key1: "00c", key2: "!@c!@" },
    { key1: "00d", key2: "!@d!@" },
  ]);

  await sdb.done();
});

Deno.test("should right-pad with custom character", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/dataPad.json"]);

  // key1 = "a" (1 char), pad to 4 with "*" => "a***"
  await table.pad("key1", { length: 4, character: "*", method: "rightPad" });
  const data = await table.getData();

  assertEquals(data, [
    { key1: "a***", key2: "!@a!@" },
    { key1: "b***", key2: "!@b!@" },
    { key1: "c***", key2: "!@c!@" },
    { key1: "d***", key2: "!@d!@" },
  ]);

  await sdb.done();
});

Deno.test("should pad both sides (center)", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/dataPad.json"]);

  // key1 = "a" (1 char), pad to 5 with "0", method: "both" => "00a00"
  await table.pad("key1", { length: 5, character: "0", method: "both" });
  const data = await table.getData();

  assertEquals(data, [
    { key1: "00a00", key2: "!@a!@" },
    { key1: "00b00", key2: "!@b!@" },
    { key1: "00c00", key2: "!@c!@" },
    { key1: "00d00", key2: "!@d!@" },
  ]);

  await sdb.done();
});

Deno.test("should pad multiple columns", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/dataPad.json"]);

  // key1 = "a" (1 char), pad to 10 with "_" => "_________" wait, "_________" is 7 + 1 = 8... let me count
  // LPAD("a", 10, "_") = "_________" + "a" = 10 chars total
  // key2 = "!@a!@" (6 chars), pad to 10 with "_" => "____" + "!@a!@" = 10 chars total
  await table.pad(["key1", "key2"], { length: 10, character: "_" });
  const data = await table.getData();

  assertEquals(data, [
    { key1: "_________a", key2: "_____!@a!@" },
    { key1: "_________b", key2: "_____!@b!@" },
    { key1: "_________c", key2: "_____!@c!@" },
    { key1: "_________d", key2: "_____!@d!@" },
  ]);

  await sdb.done();
});

Deno.test("should not pad if string is already at target length", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/dataPad.json"]);

  // key1 = "a" (1 char), pad to 1 => "a" (no change, already 1)
  await table.pad("key1", { length: 1, character: "0" });
  const data = await table.getData();

  assertEquals(data, [
    { key1: "a", key2: "!@a!@" },
    { key1: "b", key2: "!@b!@" },
    { key1: "c", key2: "!@c!@" },
    { key1: "d", key2: "!@d!@" },
  ]);

  await sdb.done();
});

Deno.test("should pad column name containing spaces", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/dataPad.json"]);
  await table.renameColumns({ key1: "key 1" });

  // key1 = "a" (1 char), pad to 4 with "X" => "XXXa"
  await table.pad("key 1", { length: 4, character: "X" });
  const data = await table.getData();

  assertEquals(data, [
    { "key 1": "XXXa", key2: "!@a!@" },
    { "key 1": "XXXb", key2: "!@b!@" },
    { "key 1": "XXXc", key2: "!@c!@" },
    { "key 1": "XXXd", key2: "!@d!@" },
  ]);

  await sdb.done();
});
