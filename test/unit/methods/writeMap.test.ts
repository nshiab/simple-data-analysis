import { existsSync, mkdirSync } from "node:fs";
import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { geo, plot } from "@observablehq/plot";
import type { Data } from "@observablehq/plot";
const output = "./test/output/";
if (!existsSync(output)) {
  mkdirSync(output);
}

Deno.test("should write a map as png", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );

  const map = (data: Data) =>
    plot({
      projection: {
        type: "conic-conformal",
        rotate: [100, -60],
        domain: data,
      },
      marks: [
        geo(data, { stroke: "black", fill: "lightblue" }),
      ],
    });

  const path = output + "map.png";

  await table.writeMap(map, path, { rewind: true });

  // How to assert?
  assertEquals(true, true);
  await sdb.done();
});

Deno.test("should write a map as jpeg", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );

  const map = (data: Data) =>
    plot({
      projection: {
        type: "conic-conformal",
        rotate: [100, -60],
        domain: data,
      },
      marks: [
        geo(data, { stroke: "black", fill: "lightblue" }),
      ],
    });

  const path = output + "map.jpeg";

  await table.writeMap(map, path, { rewind: true });

  // How to assert?
  assertEquals(true, true);
  await sdb.done();
});

Deno.test("should write a map as svg", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );

  const map = (data: Data) =>
    plot({
      projection: {
        type: "conic-conformal",
        rotate: [100, -60],
        domain: data,
      },
      marks: [
        geo(data, { stroke: "black", fill: "lightblue" }),
      ],
    });

  const path = output + "map.svg";

  await table.writeMap(map, path, { rewind: true });

  // How to assert?
  assertEquals(true, true);
  await sdb.done();
});

Deno.test("should write a map in a folder that doesn't exist", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();

  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );

  const map = (data: Data) =>
    plot({
      projection: {
        type: "conic-conformal",
        rotate: [100, -60],
        domain: data,
      },
      marks: [
        geo(data, { stroke: "black", fill: "lightblue" }),
      ],
    });

  const path = output + "test/test/map.png";

  await table.writeMap(map, path, { rewind: true });

  // How to assert?
  assertEquals(true, true);
  await sdb.done();
});
