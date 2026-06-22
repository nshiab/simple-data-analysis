import { assertEquals } from "@std/assert";
import { SimpleDB } from "../../../src/index.ts";

const apiKey = Deno.env.get("DATAWRAPPER_KEY");
if (typeof apiKey === "string" && apiKey !== "") {
  Deno.test("should load data from a Datawrapper chart", {
    sanitizeResources: false,
  }, async () => {
    const sdb = new SimpleDB();
    const table = sdb.newTable();

    // First write known data to the chart.
    await table.loadArray([
      { salary: "75000", hireDate: "2022-12-15" },
      { salary: "80000", hireDate: "2023-01-20" },
    ]);
    await table.toDW("ntURh");

    // Then load it back.
    const table2 = sdb.newTable();
    await table2.loadDW("ntURh");

    assertEquals(await table2.getData(), [
      { salary: "75000", hireDate: "2022-12-15" },
      { salary: "80000", hireDate: "2023-01-20" },
    ]);
  });
} else {
  console.log("No DATAWRAPPER_KEY in process.env");
}
