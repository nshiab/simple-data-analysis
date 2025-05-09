import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { readFileSync } from "node:fs";

Deno.test("should remove the small circle from the big circle", async () => {
  const sdb = new SimpleDB();

  const table = sdb.newTable();
  await table.loadGeoData("test/geodata/files/bigCircleWithHole.json");

  await table.fillHoles();

  await table.writeGeoData("test/output/bigCircleWithHoleFilled.json");

  assertEquals(
    JSON.parse(
      readFileSync("test/output/bigCircleWithHoleFilled.json", {
        encoding: "utf-8",
      }),
    ),
    JSON.parse(
      readFileSync("test/geodata/tests-results/bigCircleWithHoleFilled.json", {
        encoding: "utf-8",
      }),
    ),
  );
  await sdb.done();
});
