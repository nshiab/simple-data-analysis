import { existsSync, mkdirSync } from "node:fs";
import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { dot, plot } from "@observablehq/plot";
import type { Data } from "@observablehq/plot";
const output = "./test/output/";
if (!existsSync(output)) {
  mkdirSync(output);
}

Deno.test("should write a chart", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadData("test/data/files/dailyTemperatures.csv");
  await table.filter(`YEAR(time) === 2020`);
  await table.writeChart((data: Data) =>
    plot({
      title: "My chart",
      color: { legend: true, type: "diverging" },
      facet: { data: data, y: "id" },
      marginRight: 100,
      marks: [
        dot(data, { x: "time", y: "t", fill: "t", facet: "auto" }),
      ],
    }), output + "temp.png");
  // How to assert?
  assertEquals(true, true);
  await sdb.done();
});

Deno.test("should write a chart (example from docs)", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([{ year: 2024, value: 10 }, { year: 2025, value: 15 }]);

  await table.writeChart((data: Data) =>
    plot({
      marks: [
        dot(data, { x: "year", y: "value" }),
      ],
    }), output + "example.png");
  // How to assert?
  assertEquals(true, true);
  await sdb.done();
});
