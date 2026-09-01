import { assert, assertEquals, assertRejects } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { dot, plot } from "@observablehq/plot";
const output = await Deno.makeTempDir({ prefix: "sda-write-chart-" }) + "/";

async function assertArtifact(path: string): Promise<void> {
  const contents = await Deno.readFile(path);
  assert(contents.byteLength > 8, `Expected ${path} to be non-empty`);
  if (path.endsWith(".png")) {
    assertEquals(Array.from(contents.slice(0, 8)), [
      137,
      80,
      78,
      71,
      13,
      10,
      26,
      10,
    ]);
  } else {
    assert(new TextDecoder().decode(contents).includes("<svg"));
  }
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
  await assertArtifact(output + "temp.png");
  await sdb.close();
});

Deno.test("should reject when the chart function throws", async () => {
  const sdb = new SimpleDB();
  try {
    const table = sdb.newTable().loadArray([{ value: 1 }]);
    const error = new Error("chart rendering failed");

    await assertRejects(
      () =>
        table.writeChart(() => {
          throw error;
        }, output + "throwing-chart.svg"),
      Error,
      error.message,
    );
  } finally {
    await sdb.close();
  }
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
  await assertArtifact(output + "temp-dark.png");
  await sdb.close();
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
  await assertArtifact(output + "temp.svg");
  await sdb.close();
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
  await assertArtifact(output + "example.png");
  await sdb.close();
});

Deno.test("should use functions and values from the surrounding scope", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  table.loadArray([{ year: 2024, value: 10 }, { year: 2025, value: 15 }]);

  const fill = "steelblue";
  const getRadius = (value: unknown) => Number(value) * 0.5;

  await table.writeChart((data: unknown[]) =>
    plot({
      marks: [
        dot(data, {
          x: "year",
          y: "value",
          fill,
          r: (d) => getRadius(d.value),
        }),
      ],
    }), output + "surrounding-scope.png");

  await assertArtifact(output + "surrounding-scope.png");
  await sdb.close();
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
  await assertArtifact(output + "/test/temp.png");
  await sdb.close();
});

Deno.test(
  "should pass dates to a chart",
  async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable();
    table.loadArray([{
      day: "2026-08-04",
      moment: "2026-08-04T12:34:56.000Z",
      value: 1,
    }]);
    table.convert({ day: "date", moment: "timestamp" });

    await table.writeChart((data: unknown[]) => {
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

    await sdb.close();
  },
);
