import { assertEquals } from "@std/assert";
import { SimpleDB } from "../../../src/index.ts";

const apiKey = Deno.env.get("DATAWRAPPER_KEY");
if (typeof apiKey === "string" && apiKey !== "") {
  Deno.test("should write the data to a Datawrapper chart", {
    sanitizeResources: false,
  }, async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable();
    await table.loadArray([
      { salary: 75000, hireDate: "2022-12-15" },
      { salary: 80000, hireDate: "2023-01-20" },
    ]);
    await table.toDW("ntURh");

    // Just making sure it doesn't crash for now.
    assertEquals(true, true);
  });

  Deno.test("should write the data to a Datawrapper chart with a note", {
    sanitizeResources: false,
  }, async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable();
    await table.loadArray([
      { salary: 75000, hireDate: "2022-12-15" },
    ]);
    await table.toDW("ntURh", { note: "Last updated: June 2026" });

    // Just making sure it doesn't crash for now.
    assertEquals(true, true);
  });

  Deno.test("should write the data to a Datawrapper chart and republish", {
    sanitizeResources: false,
  }, async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable();
    await table.loadArray([
      { salary: 75000, hireDate: "2022-12-15" },
    ]);
    await table.toDW("ntURh", { republish: true });

    // Just making sure it doesn't crash for now.
    assertEquals(true, true);
  });
} else {
  console.log("No DATAWRAPPER_KEY in process.env");
}
