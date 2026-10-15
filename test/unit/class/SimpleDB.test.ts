import { test, expect } from "vite-plus/test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { rm } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import { assertInstanceOf, assertRejects } from "../../helpers/assertions.ts";
import { SimpleDB, SimpleTable } from "../../../src/index.ts";

test("persistent startup restores extended SDA tables", async () => {
  const directory = mkdtempSync(tmpdir() + "/" + "sda-test-");
  const file = `${directory}/analysis.duckdb`;
  const source = new SimpleDB({ file });
  const reopened = new SimpleDB({ file });
  try {
    source.newTable("data").loadArray([{ value: 1 }]);
    await source.close();

    await reopened.start();
    const table = await reopened.getTable("data");
    assertInstanceOf(table, SimpleTable);
    expect(reopened.getTables()).toEqual([table]);
    expect(typeof table.writeChart).toEqual("function");
    expect(typeof table.aiEmbeddings).toEqual("function");
    expect(await table.getData()).toEqual([{ value: 1 }]);
  } finally {
    await source.close();
    await reopened.close();
    await rm(directory, { recursive: true });
  }
});

test("SDA opens existing files read-only without changing their contents", async () => {
  const directory = mkdtempSync(tmpdir() + "/" + "sda-test-");
  const file = `${directory}/archive.duckdb`;
  const source = new SimpleDB({ file });
  const reopened = new SimpleDB({ file, readOnly: true });
  try {
    source.newTable("data").loadArray([{ value: 1 }]);
    await source.close();
    const before = await readFile(file);

    const table = await reopened.getTable("data");
    assertInstanceOf(table, SimpleTable);
    expect(reopened.readOnly).toEqual(true);
    expect(await table.getData()).toEqual([{ value: 1 }]);
    await assertRejects(() => table.filter("value = 2").run(), Error, "read-only");
    await reopened.close();
    expect(await readFile(file)).toEqual(before);
  } finally {
    await source.close();
    await reopened.close();
    await rm(directory, { recursive: true });
  }
});

test("database snapshots import extended SDA tables independently", async () => {
  const directory = mkdtempSync(tmpdir() + "/" + "sda-test-");
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
    expect(await table.getData()).toEqual([{ value: 1 }]);
    expect(await original.getData()).toEqual([{ value: 2 }]);
  } finally {
    await source.close();
    await imported.close();
    await rm(directory, { recursive: true });
  }
});
