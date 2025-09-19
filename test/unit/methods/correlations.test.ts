import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should give all correlations between numeric columns in the table and overwrite the current table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/dataCorrelations.json");
  await table.correlations();
  await table.sort({ corr: "desc" });

  const data = await table.getData();

  assertEquals(data, [
    { x: "key2", y: "key3", corr: 0.3537284140407263 },
    { x: "key2", y: "key4", corr: -0.24750187590322287 },
    { x: "key3", y: "key4", corr: -0.715142020143122 },
  ]);

  await sdb.done();
});

Deno.test("should give all correlations between numeric columns in the table and return a new table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/dataCorrelations.json");
  const newTable = await table.correlations({ outputTable: true });
  await newTable.sort({ corr: "desc" });

  const data = await newTable.getData();

  assertEquals(data, [
    { x: "key2", y: "key3", corr: 0.3537284140407263 },
    { x: "key2", y: "key4", corr: -0.24750187590322287 },
    { x: "key3", y: "key4", corr: -0.715142020143122 },
  ]);

  await sdb.done();
});

Deno.test("should give all correlations between numeric columns in the table and return a new table with a specific name in the DB", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/dataCorrelations.json");
  await table.correlations({
    outputTable: "specificTable",
  });

  const data = await sdb.customQuery(
    "select * FROM specificTable ORDER BY corr DESC",
    { returnDataFrom: "query" },
  );

  assertEquals(data, [
    { x: "key2", y: "key3", corr: 0.3537284140407263 },
    { x: "key2", y: "key4", corr: -0.24750187590322287 },
    { x: "key3", y: "key4", corr: -0.715142020143122 },
  ]);

  await sdb.done();
});

Deno.test("should give all correlations between numeric columns in the table and overwrite the current table, with one decimal", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/dataCorrelations.json");
  await table.correlations({
    decimals: 1,
  });
  await table.sort({ corr: "desc" });
  const data = await table.getData();

  assertEquals(data, [
    { x: "key2", y: "key3", corr: 0.4 },
    { x: "key2", y: "key4", corr: -0.2 },
    { x: "key3", y: "key4", corr: -0.7 },
  ]);

  await sdb.done();
});

Deno.test("should give all correlations between numeric columns in the table", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/dataCorrelations.json");
  await table.correlations({
    decimals: 1,
  });
  await table.sort({ corr: "desc" });
  const data = await table.getData();

  assertEquals(data, [
    { x: "key2", y: "key3", corr: 0.4 },
    { x: "key2", y: "key4", corr: -0.2 },
    { x: "key3", y: "key4", corr: -0.7 },
  ]);

  await sdb.done();
});

Deno.test("should give all correlations between numeric columns with a specific x column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/dataCorrelations.json");
  await table.correlations({
    x: "key2",
    decimals: 1,
  });
  await table.sort({ corr: "desc" });
  const data = await table.getData();

  assertEquals(data, [
    { x: "key2", y: "key3", corr: 0.4 },
    { x: "key2", y: "key4", corr: -0.2 },
  ]);

  await sdb.done();
});

Deno.test("should give the correlation between two specific columns", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/dataCorrelations.json");
  await table.correlations({
    x: "key2",
    y: "key3",
    decimals: 1,
  });

  const data = await table.getData();

  assertEquals(data, [{ x: "key2", y: "key3", corr: 0.4 }]);

  await sdb.done();
});

Deno.test("should give the correlation between two specific columns and with a category", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("./test/data/files/dailyTemperatures.csv");
  await table.addColumn("decade", "integer", "FLOOR(YEAR(time)/10)*10");
  await table.summarize({
    values: "t",
    categories: ["decade", "id"],
    summaries: "mean",
  });
  await table.correlations({
    x: "decade",
    y: "mean",
    categories: "id",
    decimals: 2,
  });

  await table.sort({ corr: "desc" });

  const data = await table.getData();

  assertEquals(data, [
    { id: 6158355, x: "decade", y: "mean", corr: 0.96 },
    { id: 1108380, x: "decade", y: "mean", corr: 0.95 },
    { id: 7024745, x: "decade", y: "mean", corr: 0.91 },
  ]);

  await sdb.done();
});
