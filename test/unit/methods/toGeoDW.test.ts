import { assertEquals } from "@std/assert";
import { SimpleDB } from "../../../src/index.ts";

const apiKey = Deno.env.get("DATAWRAPPER_KEY");
if (typeof apiKey === "string" && apiKey !== "") {
  Deno.test("should write geo data to a Datawrapper map", {
    sanitizeResources: false,
  }, async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable();
    await table.loadGeoData(
      "test/geodata/files/CanadianProvincesAndTerritories.json",
    );
    await table.toGeoDW("lDO6F");

    // Just making sure it doesn't crash for now.
    assertEquals(true, true);
  });

  Deno.test("should write geo data to a Datawrapper map with a note", {
    sanitizeResources: false,
  }, async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable();
    await table.loadGeoData(
      "test/geodata/files/CanadianProvincesAndTerritories.json",
    );
    await table.toGeoDW("lDO6F", { note: "Last updated: June 2026" });

    // Just making sure it doesn't crash for now.
    assertEquals(true, true);
  });

  Deno.test("should write geo data to a Datawrapper map and republish", {
    sanitizeResources: false,
  }, async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable();
    await table.loadGeoData(
      "test/geodata/files/CanadianProvincesAndTerritories.json",
    );
    await table.toGeoDW("lDO6F", { republish: true });

    // Just making sure it doesn't crash for now.
    assertEquals(true, true);
  });
} else {
  console.log("No DATAWRAPPER_KEY in process.env");
}
