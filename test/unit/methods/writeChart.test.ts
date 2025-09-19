import { existsSync, mkdirSync } from "node:fs";
import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { dot, plot } from "@observablehq/plot";
const output = "./test/output/";
if (!existsSync(output)) {
  mkdirSync(output);
}

Deno.test("should write a chart as a png", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dailyTemperatures.csv");
  await table.filter(`YEAR(time) === 2020`);
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
  await table.loadData("test/data/files/dailyTemperatures.csv");
  await table.filter(`YEAR(time) === 2020`);
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

Deno.test("should write a chart as a jpeg", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dailyTemperatures.csv");
  await table.filter(`YEAR(time) === 2020`);
  await table.writeChart((data: unknown[]) =>
    plot({
      title: "My chart",
      color: { legend: true, type: "diverging" },
      facet: { data: data, y: "id" },
      marginRight: 100,
      marks: [
        dot(data, { x: "time", y: "t", fill: "t", facet: "auto" }),
      ],
    }), output + "temp.jpeg");
  // How to assert?
  assertEquals(true, true);
  await sdb.done();
});

Deno.test("should write a chart as a svg", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dailyTemperatures.csv");
  await table.filter(`YEAR(time) === 2020`);
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
  await table.loadArray([{ year: 2024, value: 10 }, { year: 2025, value: 15 }]);

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
  await table.loadData("test/data/files/dailyTemperatures.csv");
  await table.filter(`YEAR(time) === 2020`);
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
