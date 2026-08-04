import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { assert, assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { dot, plot } from "@observablehq/plot";
const output = "./test/output/";
const datavizTempDirectory = ".sda-cache/tmp/dataviz";
if (!existsSync(output)) {
  mkdirSync(output);
}

function getDatavizTempFiles(): Set<string> {
  return new Set(
    existsSync(datavizTempDirectory) ? readdirSync(datavizTempDirectory) : [],
  );
}

Deno.test("should write a chart as a png", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  table.loadData("test/data/files/dailyTemperatures.csv");
  table.filter(`YEAR(time) === 2020`);
  await table.writeChart((data: unknown[]) =>
    plot({
      title: "My chart",
      subtitle: "More context about the chart",
      color: { legend: true, type: "diverging" },
      facet: { data: data, y: "id" },
      marginRight: 100,
      marks: [
        dot(data, { x: "time", y: "t", fill: "t", facet: "auto" }),
      ],
      caption: "A caption with the data source.",
    }), output + "temp.png");
  // How to assert?
  assertEquals(true, true);
  await sdb.done();
});
Deno.test("should write a dark chart as a png", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  table.loadData("test/data/files/dailyTemperatures.csv");
  table.filter(`YEAR(time) === 2020`);
  await table.writeChart(
    (data: unknown[]) =>
      plot({
        title: "My chart",
        subtitle: "More context about the chart",
        color: { legend: true, type: "diverging" },
        facet: { data: data, y: "id" },
        marginRight: 100,
        marks: [
          dot(data, { x: "time", y: "t", fill: "t", facet: "auto" }),
        ],
        caption: "A caption with the data source.",
      }),
    output + "temp-dark.png",
    { dark: true },
  );
  // How to assert?
  assertEquals(true, true);
  await sdb.done();
});

Deno.test("should write a chart as a svg", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  table.loadData("test/data/files/dailyTemperatures.csv");
  table.filter(`YEAR(time) === 2020`);
  await table.writeChart((data: unknown[]) =>
    plot({
      title: "My chart",
      color: { legend: true, type: "diverging" },
      facet: { data: data, y: "id" },
      marginRight: 100,
      marks: [
        dot(data, { x: "time", y: "t", fill: "t", facet: "auto" }),
      ],
    }), output + "temp.svg");
  // How to assert?
  assertEquals(true, true);
  await sdb.done();
});

Deno.test("should write a chart (example from docs)", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  table.loadArray([{ year: 2024, value: 10 }, { year: 2025, value: 15 }]);

  await table.writeChart((data: unknown[]) =>
    plot({
      marks: [
        dot(data, { x: "year", y: "value" }),
      ],
    }), output + "example.png");
  // How to assert?
  assertEquals(true, true);
  await sdb.done();
});

Deno.test("should write a chart in a folder that doesn't exist", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  table.loadData("test/data/files/dailyTemperatures.csv");
  table.filter(`YEAR(time) === 2020`);
  await table.writeChart((data: unknown[]) =>
    plot({
      title: "My chart",
      color: { legend: true, type: "diverging" },
      facet: { data: data, y: "id" },
      marginRight: 100,
      marks: [
        dot(data, { x: "time", y: "t", fill: "t", facet: "auto" }),
      ],
    }), output + "/test/temp.png");
  // How to assert?
  assertEquals(true, true);
  await sdb.done();
});

Deno.test(
  "should pass dates through a temporary JSON file and remove it",
  async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable();
    table.loadArray([{
      day: "2026-08-04",
      moment: "2026-08-04T12:34:56.000Z",
      value: 1,
    }]);
    table.convert({ day: "date", moment: "timestamp" });

    const filesBefore = getDatavizTempFiles();
    let tempPath: string | undefined;

    await table.writeChart((data: unknown[]) => {
      const tempFile = [...getDatavizTempFiles()].find((file) =>
        !filesBefore.has(file) && file.endsWith(".json")
      );
      assert(tempFile !== undefined);
      tempPath = `${datavizTempDirectory}/${tempFile}`;

      const row = data[0] as Record<string, unknown>;
      assert(row.day instanceof Date);
      assert(row.moment instanceof Date);
      assertEquals(row.day.toISOString(), "2026-08-04T00:00:00.000Z");
      assertEquals(
        row.moment.toISOString(),
        "2026-08-04T12:34:56.000Z",
      );

      return plot({
        marks: [dot(data, { x: "day", y: "value" })],
      });
    }, output + "dates.png");

    assert(tempPath !== undefined);
    assertEquals(existsSync(tempPath), false);
    await sdb.done();
  },
);

Deno.test("should remove the temporary JSON file after an error", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  table.loadArray([{ value: 1 }]);

  const filesBefore = getDatavizTempFiles();
  let tempPath: string | undefined;
  const consoleError = console.error;
  try {
    console.error = () => {};
    await table.writeChart(() => {
      const tempFile = [...getDatavizTempFiles()].find((file) =>
        !filesBefore.has(file) && file.endsWith(".json")
      );
      assert(tempFile !== undefined);
      tempPath = `${datavizTempDirectory}/${tempFile}`;
      throw new Error("Expected chart error");
    }, output + "expected-error.png");
  } finally {
    console.error = consoleError;
  }

  assert(tempPath !== undefined);
  assertEquals(existsSync(tempPath), false);
  await sdb.done();
});
