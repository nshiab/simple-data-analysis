import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should remove whitespace", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/dataTrim.json"]);

  await table.trim("key1");
  const data = await table.getData();

  assertEquals(data, [
    { key1: "a", key2: " !@a!@" },
    { key1: "b", key2: " !@b!@" },
    { key1: "c", key2: " !@c!@" },
    { key1: "d", key2: " !@d!@" },
  ]);

  await sdb.done();
});

Deno.test("should remove whitespace with column name containing spaces", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/dataTrim.json"]);
  await table.renameColumns({ key1: "key 1" });

  await table.trim("key 1");
  const data = await table.getData();

  assertEquals(data, [
    { "key 1": "a", key2: " !@a!@" },
    { "key 1": "b", key2: " !@b!@" },
    { "key 1": "c", key2: " !@c!@" },
    { "key 1": "d", key2: " !@d!@" },
  ]);

  await sdb.done();
});

Deno.test("should remove whitespace from multiple columns", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/dataTrim.json"]);

  await table.trim(["key1", "key2"]);

  const data = await table.getData();

  assertEquals(data, [
    { key1: "a", key2: "!@a!@" },
    { key1: "b", key2: "!@b!@" },
    { key1: "c", key2: "!@c!@" },
    { key1: "d", key2: "!@d!@" },
  ]);

  await sdb.done();
});

Deno.test("should remove whitespace just on the left", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/dataTrim.json"]);

  await table.trim("key1", {
    method: "leftTrim",
  });
  const data = await table.getData();

  assertEquals(data, [
    { key1: "a  ", key2: " !@a!@" },
    { key1: "b  ", key2: " !@b!@" },
    { key1: "c  ", key2: " !@c!@" },
    { key1: "d  ", key2: " !@d!@" },
  ]);

  await sdb.done();
});

Deno.test("should remove whitespace just on the right", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/dataTrim.json"]);

  await table.trim("key1", {
    method: "rightTrim",
  });
  const data = await table.getData();

  assertEquals(data, [
    { key1: "  a", key2: " !@a!@" },
    { key1: "  b", key2: " !@b!@" },
    { key1: "  c", key2: " !@c!@" },
    { key1: "  d", key2: " !@d!@" },
  ]);

  await sdb.done();
});

Deno.test("should remove specific characters", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData(["test/data/files/dataTrim.json"]);

  await table.trim("key2", {
    method: "rightTrim",
    character: "!@",
  });
  const data = await table.getData();

  assertEquals(data, [
    { key1: "  a  ", key2: " !@a" },
    { key1: "  b  ", key2: " !@b" },
    { key1: "  c  ", key2: " !@c" },
    { key1: "  d  ", key2: " !@d" },
  ]);

  await sdb.done();
});
