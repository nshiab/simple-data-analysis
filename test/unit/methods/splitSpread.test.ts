import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should split and spread a string into multiple columns", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    { name: "Shiab, Nael" },
    { name: "Bruce, Graeme" },
  ]);

  await table.splitSpread("name", ",", ["lastName", "firstName"]);

  const data = await table.getData();

  assertEquals(data, [
    { name: "Shiab, Nael", lastName: "Shiab", firstName: " Nael" },
    { name: "Bruce, Graeme", lastName: "Bruce", firstName: " Graeme" },
  ]);
  await sdb.done();
});

Deno.test("should split and spread into three columns", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    { address: "123 Main St,Anytown,USA" },
    { address: "456 Oak Ave,Springfield,Canada" },
  ]);

  await table.splitSpread("address", ",", ["street", "city", "country"]);

  const data = await table.getData();

  assertEquals(data, [
    {
      address: "123 Main St,Anytown,USA",
      street: "123 Main St",
      city: "Anytown",
      country: "USA",
    },
    {
      address: "456 Oak Ave,Springfield,Canada",
      street: "456 Oak Ave",
      city: "Springfield",
      country: "Canada",
    },
  ]);
  await sdb.done();
});

Deno.test("should handle rows with fewer parts than expected", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    { data: "A,B,C" },
    { data: "D,E" },
    { data: "F" },
  ]);

  // Capture console.warn
  const originalWarn = console.warn;
  let warnMessage = "";
  console.warn = (msg: string) => {
    warnMessage = msg;
  };

  await table.splitSpread("data", ",", ["part1", "part2", "part3"]);

  // Restore console.warn
  console.warn = originalWarn;

  assertEquals(
    warnMessage,
    "splitSpread() warning: Some rows contain fewer values after splitting (1) than the number of new columns (3). Empty strings will be used for missing values.",
  );

  const data = await table.getData();

  assertEquals(data, [
    { data: "A,B,C", part1: "A", part2: "B", part3: "C" },
    { data: "D,E", part1: "D", part2: "E", part3: "" },
    { data: "F", part1: "F", part2: "", part3: "" },
  ]);
  await sdb.done();
});

Deno.test("should throw error when rows have more parts than expected", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    { data: "A,B,C,D,E" },
    { data: "F,G,H" },
    { data: "I,J,K,L" },
  ]);

  let errorThrown = false;
  let errorMessage = "";
  try {
    await table.splitSpread("data", ",", ["first", "second"]);
  } catch (error) {
    errorThrown = true;
    errorMessage = (error as Error).message;
  }

  assertEquals(errorThrown, true);
  // Check that the error message contains the expected information
  assertEquals(
    errorMessage.includes(
      "Some rows contain more values after splitting (5) than the number of new columns specified (2)",
    ),
    true,
  );
  assertEquals(
    errorMessage.includes("First 5 rows with too many values:"),
    true,
  );
  assertEquals(errorMessage.includes("A,B,C,D,E"), true);
  assertEquals(errorMessage.includes("F,G,H"), true);
  assertEquals(errorMessage.includes("I,J,K,L"), true);

  await sdb.done();
});

Deno.test("should skip validation with noCheck option when rows have more parts than expected", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    { data: "A,B,C,D,E" },
    { data: "F,G,H" },
    { data: "I,J,K,L" },
  ]);

  // This should not throw an error because noCheck is true
  await table.splitSpread("data", ",", ["first", "second"], { noCheck: true });

  const data = await table.getData();

  // Only the first two parts should be extracted
  assertEquals(data, [
    { data: "A,B,C,D,E", first: "A", second: "B" },
    { data: "F,G,H", first: "F", second: "G" },
    { data: "I,J,K,L", first: "I", second: "J" },
  ]);

  await sdb.done();
});
