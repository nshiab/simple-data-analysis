import { assertEquals, assertInstanceOf, assertRejects } from "@std/assert";
import { SimpleDB, SimpleTable } from "../../../src/index.ts";

Deno.test("persistent startup restores extended SDA tables", async () => {
  const directory = await Deno.makeTempDir();
  const file = `${directory}/analysis.duckdb`;
  const source = new SimpleDB({ file });
  const reopened = new SimpleDB({ file });
  try {
    source.newTable("data").loadArray([{ value: 1 }]);
    await source.close();

    await reopened.start();
    const table = await reopened.getTable("data");
    assertInstanceOf(table, SimpleTable);
    assertEquals(reopened.getTables(), [table]);
    assertEquals(typeof table.writeChart, "function");
    assertEquals(typeof table.aiEmbeddings, "function");
    assertEquals(await table.getData(), [{ value: 1 }]);
  } finally {
    await source.close();
    await reopened.close();
    await Deno.remove(directory, { recursive: true });
  }
});

Deno.test("SDA opens existing files read-only without changing their contents", async () => {
  const directory = await Deno.makeTempDir();
  const file = `${directory}/archive.duckdb`;
  const source = new SimpleDB({ file });
  const reopened = new SimpleDB({ file, readOnly: true });
  try {
    source.newTable("data").loadArray([{ value: 1 }]);
    await source.close();
    const before = await Deno.readFile(file);

    const table = await reopened.getTable("data");
    assertInstanceOf(table, SimpleTable);
    assertEquals(reopened.readOnly, true);
    assertEquals(await table.getData(), [{ value: 1 }]);
    await assertRejects(
      () => table.filter("value = 2").run(),
      Error,
      "read-only",
    );
    await reopened.close();
    assertEquals(await Deno.readFile(file), before);
  } finally {
    await source.close();
    await reopened.close();
    await Deno.remove(directory, { recursive: true });
  }
});

Deno.test("database snapshots import extended SDA tables independently", async () => {
  const directory = await Deno.makeTempDir();
  const snapshot = `${directory}/snapshot.duckdb`;
  const source = new SimpleDB();
  const imported = new SimpleDB();
  try {
    const original = source.newTable("data").loadArray([{ value: 1 }]);
    await source.writeDB(snapshot);
    await original.updateColumn("value", "2").run();

    await imported.loadDB(snapshot);
    const table = await imported.getTable("data");
    assertInstanceOf(table, SimpleTable);
    assertEquals(await table.getData(), [{ value: 1 }]);
    assertEquals(await original.getData(), [{ value: 2 }]);
  } finally {
    await source.close();
    await imported.close();
    await Deno.remove(directory, { recursive: true });
  }
});
