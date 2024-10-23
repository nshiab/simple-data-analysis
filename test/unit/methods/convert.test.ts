import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should convert numbers to string", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/dataJustNumbers.csv"]);

  await table.convert({ key1: "string" });
  const data = await table.getData();

  assertEquals(data, [
    { key1: "1.3", key2: 2 },
    { key1: "3.0", key2: 15 },
    { key1: "8.5", key2: 10 },
    { key1: "1.0", key2: 154 },
  ]);
  await sdb.done();
});
Deno.test("should convert strings with comma as thousand separator to number", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadArray([
    { key1: "1,000.3", key2: 2 },
    { key1: "3,000,000", key2: 15 },
    { key1: "8.5", key2: 10 },
    { key1: "1.0", key2: 154 },
  ]);

  await table.convert({ key1: "number" });
  const data = await table.getData();

  assertEquals(data, [
    { key1: 1000.3, key2: 2 },
    { key1: 3000000, key2: 15 },
    { key1: 8.5, key2: 10 },
    { key1: 1.0, key2: 154 },
  ]);
  await sdb.done();
});
Deno.test("should try to convert string to number", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/data.csv"], {
    allText: true,
  });

  await table.convert({ key1: "integer" }, { try: true });
  const data = await table.getData();

  assertEquals(data, [
    { key1: 1, key2: "2" },
    { key1: 3, key2: "coucou" },
    { key1: 8, key2: "10" },
    { key1: null, key2: "croissant" },
  ]);
  await sdb.done();
});

Deno.test("should convert string to float", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/dataJustNumbers.csv"]);
  await table.convert({ key1: "string" }); // tested above

  await table.convert({ key1: "float" });
  const data = await table.getData();

  assertEquals(data, [
    { key1: 1.3, key2: 2 },
    { key1: 3, key2: 15 },
    { key1: 8.5, key2: 10 },
    { key1: 1, key2: 154 },
  ]);
  await sdb.done();
});

Deno.test("should convert string to integer", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/dataJustNumbers.csv"]);
  await table.convert({ key2: "string" }); // tested above

  await table.convert({ key2: "integer" });
  const data = await table.getData();

  assertEquals(data, [
    { key1: 1.3, key2: 2 },
    { key1: 3, key2: 15 },
    { key1: 8.5, key2: 10 },
    { key1: 1, key2: 154 },
  ]);
  await sdb.done();
});

Deno.test("should convert multiple columns in multiple types", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData(["test/data/files/dataJustNumbers.csv"]);
  await table.convert({ key1: "string" });

  await table.convert({
    key1: "float",
    key2: "string",
  });
  const data = await table.getData();

  assertEquals(data, [
    { key1: 1.3, key2: "2" },
    { key1: 3, key2: "15" },
    { key1: 8.5, key2: "10" },
    { key1: 1, key2: "154" },
  ]);
  await sdb.done();
});

Deno.test("should convert date string to date", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/dataDates.csv", {
    allText: true,
  });

  await table.convert({
    date: "date",
    datetime: "datetime",
    datetimeWithMs: "datetime",
  });

  const data = await table.getData();

  assertEquals(data, [
    {
      date: new Date("2010-01-01T00:00:00.000Z"),
      datetime: new Date("2010-01-01T14:01:12.000Z"),
      datetimeWithMs: new Date("2010-01-01T14:12:12.014Z"),
      time: "14:12:12",
      timeMs: "14:12:12.014",
      weirdDatetime: "2010/01/01_14h_01min_12sec",
    },
    {
      date: new Date("2010-01-02T00:00:00.000Z"),
      datetime: new Date("2010-01-02T01:12:54.000Z"),
      datetimeWithMs: new Date("2010-01-02T01:12:54.955Z"),
      time: "01:12:54",
      timeMs: "01:12:54.955",
      weirdDatetime: "2010/01/02_01h_12min_54sec",
    },
    {
      date: new Date("2010-01-03T00:00:00.000Z"),
      datetime: new Date("2010-01-03T02:25:01.000Z"),
      datetimeWithMs: new Date("2010-01-03T02:25:01.111Z"),
      time: "02:25:01",
      timeMs: "02:25:01.111",
      weirdDatetime: "2010/01/03_02h_25min_54sec",
    },
    {
      date: new Date("2010-01-04T00:00:00.000Z"),
      datetime: new Date("2010-01-04T23:25:15.000Z"),
      datetimeWithMs: new Date("2010-01-04T12:01:15.123Z"),
      time: "12:01:15",
      timeMs: "12:01:15.123",
      weirdDatetime: "2010/01/04_23h_25min_15sec",
    },
  ]);
  await sdb.done();
});

Deno.test("should convert date and time strings to dates", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/dataDates.csv", {
    allText: true,
  });

  await table.convert({
    date: "date",
    datetime: "datetime",
    datetimeWithMs: "datetime",
    time: "time",
    timeMs: "time",
  });

  const types = await table.getTypes();

  assertEquals(types, {
    date: "DATE",
    datetime: "TIMESTAMP",
    datetimeWithMs: "TIMESTAMP",
    time: "TIME",
    timeMs: "TIME",
    weirdDatetime: "VARCHAR",
  });
  await sdb.done();
});

Deno.test("should convert date and time from string to date with a specific format", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/dataDates.csv", {
    allText: true,
  });

  await table.convert(
    { weirdDatetime: "time" },
    {
      datetimeFormat: "%Y/%m/%d_%Hh_%Mmin_%Ssec",
    },
  );
  await table.selectColumns("weirdDatetime");
  const data = await table.getData();

  assertEquals(data, [
    {
      weirdDatetime: new Date("2010-01-01T14:01:12.000Z"),
    },
    {
      weirdDatetime: new Date("2010-01-02T01:12:54.000Z"),
    },
    {
      weirdDatetime: new Date("2010-01-03T02:25:54.000Z"),
    },
    {
      weirdDatetime: new Date("2010-01-04T23:25:15.000Z"),
    },
  ]);
  await sdb.done();
});

Deno.test("should convert dates to strings", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/dataDates.csv", {
    allText: true,
  });

  await table.convert({
    date: "date",
    datetime: "datetime",
    datetimeWithMs: "datetime",
    time: "time",
    timeMs: "time",
  });
  await table.convert(
    { weirdDatetime: "time" },
    {
      datetimeFormat: "%Y/%m/%d_%Hh_%Mmin_%Ssec",
    },
  ); // tested above

  await table.convert({
    date: "string",
    datetime: "string",
    datetimeWithMs: "string",
    time: "string",
    timeMs: "string",
    weirdDatetime: "string",
  });
  const data = await table.getData();

  assertEquals(data, [
    {
      date: "2010-01-01",
      datetime: "2010-01-01 14:01:12",
      datetimeWithMs: "2010-01-01 14:12:12.014",
      time: "14:12:12",
      timeMs: "14:12:12.014",
      weirdDatetime: "2010-01-01 14:01:12",
    },
    {
      date: "2010-01-02",
      datetime: "2010-01-02 01:12:54",
      datetimeWithMs: "2010-01-02 01:12:54.955",
      time: "01:12:54",
      timeMs: "01:12:54.955",
      weirdDatetime: "2010-01-02 01:12:54",
    },
    {
      date: "2010-01-03",
      datetime: "2010-01-03 02:25:01",
      datetimeWithMs: "2010-01-03 02:25:01.111",
      time: "02:25:01",
      timeMs: "02:25:01.111",
      weirdDatetime: "2010-01-03 02:25:54",
    },
    {
      date: "2010-01-04",
      datetime: "2010-01-04 23:25:15",
      datetimeWithMs: "2010-01-04 12:01:15.123",
      time: "12:01:15",
      timeMs: "12:01:15.123",
      weirdDatetime: "2010-01-04 23:25:15",
    },
  ]);
  await sdb.done();
});

Deno.test("should convert dates to strings with a specific format", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/dataDates.csv");

  await table.convert(
    {
      date: "string",
      datetime: "string",
      datetimeWithMs: "string",
    },
    {
      datetimeFormat: "%Y/%m/%d_%Hh_%Mmin_%Ssec",
    },
  );
  const data = await table.getData();

  assertEquals(data, [
    {
      date: "2010/01/01_00h_00min_00sec",
      datetime: "2010/01/01_14h_01min_12sec",
      datetimeWithMs: "2010/01/01_14h_12min_12sec",
      time: "14:12:12",
      timeMs: "14:12:12.014",
      weirdDatetime: "2010/01/01_14h_01min_12sec",
    },
    {
      date: "2010/01/02_00h_00min_00sec",
      datetime: "2010/01/02_01h_12min_54sec",
      datetimeWithMs: "2010/01/02_01h_12min_54sec",
      time: "01:12:54",
      timeMs: "01:12:54.955",
      weirdDatetime: "2010/01/02_01h_12min_54sec",
    },
    {
      date: "2010/01/03_00h_00min_00sec",
      datetime: "2010/01/03_02h_25min_01sec",
      datetimeWithMs: "2010/01/03_02h_25min_01sec",
      time: "02:25:01",
      timeMs: "02:25:01.111",
      weirdDatetime: "2010/01/03_02h_25min_54sec",
    },
    {
      date: "2010/01/04_00h_00min_00sec",
      datetime: "2010/01/04_23h_25min_15sec",
      datetimeWithMs: "2010/01/04_12h_01min_15sec",
      time: "12:01:15",
      timeMs: "12:01:15.123",
      weirdDatetime: "2010/01/04_23h_25min_15sec",
    },
  ]);
  await sdb.done();
});

Deno.test("should convert numbers to booleans", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadArray([{ key1: 0 }, { key1: 1 }]);

  await table.convert({ key1: "boolean" });
  const data = await table.getData();

  assertEquals(data, [{ key1: false }, { key1: true }]);
  await sdb.done();
});

Deno.test("should convert booleans to numbers", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadArray([{ key1: false }, { key1: true }]);

  await table.convert({ key1: "number" });
  const data = await table.getData();

  assertEquals(data, [{ key1: 0 }, { key1: 1 }]);
  await sdb.done();
});
Deno.test("should convert dates and times to numbers (ms)", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/dataDates.csv");

  await table.convert({
    time: "time",
    timeMs: "time",
  });

  await table.convert({
    date: "number",
    datetime: "number",
    datetimeWithMs: "number",
    time: "number",
    timeMs: "number",
  });
  await table.selectColumns([
    "date",
    "datetime",
    "datetimeWithMs",
    "time",
    "timeMs",
  ]);

  const data = await table.getData();
  assertEquals(data, [
    {
      date: 1262304000000,
      datetime: 1262354472000,
      datetimeWithMs: 1262355132014,
      time: 51132000,
      timeMs: 51132014,
    },
    {
      date: 1262390400000,
      datetime: 1262394774000,
      datetimeWithMs: 1262394774955,
      time: 4374000,
      timeMs: 4374955,
    },
    {
      date: 1262476800000,
      datetime: 1262485501000,
      datetimeWithMs: 1262485501111,
      time: 8701000,
      timeMs: 8701111,
    },
    {
      date: 1262563200000,
      datetime: 1262647515000,
      datetimeWithMs: 1262606475123,
      time: 43275000,
      timeMs: 43275123,
    },
  ]);
  await sdb.done();
});
Deno.test("should convert numbers (ms) to dates and time", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/dataDates.csv");

  await table.convert({
    time: "time",
    timeMs: "time",
  });
  await table.convert({
    date: "number",
    datetime: "number",
    datetimeWithMs: "number",
    time: "number",
    timeMs: "number",
  });
  await table.convert({
    date: "date",
    datetime: "datetime",
    datetimeWithMs: "datetime",
    time: "time",
    timeMs: "time",
  });

  await table.selectColumns([
    "date",
    "datetime",
    "datetimeWithMs",
    "time",
    "timeMs",
  ]);

  const data = await table.getData();

  assertEquals(data, [
    {
      date: new Date("2010-01-01T00:00:00.000Z"),
      datetime: new Date("2010-01-01T14:01:12.000Z"),
      datetimeWithMs: new Date("2010-01-01T14:12:12.014Z"),
      time: "14:12:12",
      timeMs: "14:12:12.014",
    },
    {
      date: new Date("2010-01-02T00:00:00.000Z"),
      datetime: new Date("2010-01-02T01:12:54.000Z"),
      datetimeWithMs: new Date("2010-01-02T01:12:54.955Z"),
      time: "01:12:54",
      timeMs: "01:12:54.955",
    },
    {
      date: new Date("2010-01-03T00:00:00.000Z"),
      datetime: new Date("2010-01-03T02:25:01.000Z"),
      datetimeWithMs: new Date("2010-01-03T02:25:01.111Z"),
      time: "02:25:01",
      timeMs: "02:25:01.111",
    },
    {
      date: new Date("2010-01-04T00:00:00.000Z"),
      datetime: new Date("2010-01-04T23:25:15.000Z"),
      datetimeWithMs: new Date("2010-01-04T12:01:15.123Z"),
      time: "12:01:15",
      timeMs: "12:01:15.123",
    },
  ]);
  await sdb.done();
});
