import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { readFileSync } from "node:fs";

Deno.test("should simplify the geometries", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  await table.simplify(0.5);
  await table.reducePrecision(1);
  await table.sort();

  await table.writeGeoData(
    "test/output/CanadianProvincesAndTerritories-simplified.json",
  );

  assertEquals(
    JSON.parse(
      readFileSync(
        "test/output/CanadianProvincesAndTerritories-simplified.json",
        { encoding: "utf-8" },
      ),
    ),
    JSON.parse(readFileSync(
      "test/geodata/tests-results/CanadianProvincesAndTerritories-simplified.json",
      { encoding: "utf-8" },
    )),
  );
  await sdb.done();
});
Deno.test("should simplify the geometries but keep the outer boundaries intact", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  await table.simplify(0.5, { simplifyBoundary: false });
  await table.reducePrecision(1);
  await table.sort();

  await table.writeGeoData(
    "test/output/CanadianProvincesAndTerritories-simplified-interior.json",
  );

  assertEquals(
    JSON.parse(readFileSync(
      "test/output/CanadianProvincesAndTerritories-simplified-interior.json",
      { encoding: "utf-8" },
    )),
    JSON.parse(readFileSync(
      "test/geodata/tests-results/CanadianProvincesAndTerritories-simplified-interior.json",
      { encoding: "utf-8" },
    )),
  );
  await sdb.done();
});
Deno.test("should simplify the geometries from a specific column", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadGeoData(
    "test/geodata/files/CanadianProvincesAndTerritories.json",
  );
  await table.simplify(0.5, { column: "geom" });
  await table.reducePrecision(1);
  await table.sort();

  await table.writeGeoData(
    "test/output/CanadianProvincesAndTerritories-simplified-column.json",
  );

  assertEquals(
    JSON.parse(readFileSync(
      "test/output/CanadianProvincesAndTerritories-simplified-column.json",
      { encoding: "utf-8" },
    )),
    JSON.parse(readFileSync(
      "test/geodata/tests-results/CanadianProvincesAndTerritories-simplified.json",
      { encoding: "utf-8" },
    )),
  );
  await sdb.done();
});
