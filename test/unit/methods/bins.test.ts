import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should add a column with the bins and an interval of 10", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/dataRank.csv");
  await table.bins("Mark", 10, "bins");
  const data = await table.getData();

  assertEquals(data, [
    { Name: "Lily", Subject: "Maths", Mark: 65, bins: "[60-69]" },
    { Name: "Lily", Subject: "Science", Mark: 80, bins: "[80-89]" },
    { Name: "Lily", Subject: "English", Mark: 70, bins: "[70-79]" },
    { Name: "Isabella", Subject: "Maths", Mark: 50, bins: "[50-59]" },
    { Name: "Isabella", Subject: "Science", Mark: 70, bins: "[70-79]" },
    { Name: "Isabella", Subject: "English", Mark: 90, bins: "[90-99]" },
    { Name: "Olivia", Subject: "Maths", Mark: 55, bins: "[50-59]" },
    { Name: "Olivia", Subject: "Science", Mark: 60, bins: "[60-69]" },
    { Name: "Olivia", Subject: "English", Mark: 89, bins: "[80-89]" },
  ]);

  await sdb.done();
});

Deno.test("should add a column with the bins and an interval of 10 and 45 as start value", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/dataRank.csv");
  await table.bins("Mark", 10, "bins", {
    startValue: 45,
  });
  const data = await table.getData();

  assertEquals(data, [
    { Name: "Lily", Subject: "Maths", Mark: 65, bins: "[65-74]" },
    { Name: "Lily", Subject: "Science", Mark: 80, bins: "[75-84]" },
    { Name: "Lily", Subject: "English", Mark: 70, bins: "[65-74]" },
    { Name: "Isabella", Subject: "Maths", Mark: 50, bins: "[45-54]" },
    { Name: "Isabella", Subject: "Science", Mark: 70, bins: "[65-74]" },
    { Name: "Isabella", Subject: "English", Mark: 90, bins: "[85-94]" },
    { Name: "Olivia", Subject: "Maths", Mark: 55, bins: "[55-64]" },
    { Name: "Olivia", Subject: "Science", Mark: 60, bins: "[55-64]" },
    { Name: "Olivia", Subject: "English", Mark: 89, bins: "[85-94]" },
  ]);

  await sdb.done();
});

Deno.test("should add a column with the bins and an interval of 0.5", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/dataRank.csv");
  await table.bins("Mark", 0.5, "bins");
  const data = await table.getData();

  assertEquals(data, [
    { Name: "Lily", Subject: "Maths", Mark: 65, bins: "[65-65.4]" },
    { Name: "Lily", Subject: "Science", Mark: 80, bins: "[80-80.4]" },
    { Name: "Lily", Subject: "English", Mark: 70, bins: "[70-70.4]" },
    { Name: "Isabella", Subject: "Maths", Mark: 50, bins: "[50-50.4]" },
    {
      Name: "Isabella",
      Subject: "Science",
      Mark: 70,
      bins: "[70-70.4]",
    },
    {
      Name: "Isabella",
      Subject: "English",
      Mark: 90,
      bins: "[90-90.4]",
    },
    { Name: "Olivia", Subject: "Maths", Mark: 55, bins: "[55-55.4]" },
    { Name: "Olivia", Subject: "Science", Mark: 60, bins: "[60-60.4]" },
    { Name: "Olivia", Subject: "English", Mark: 89, bins: "[89-89.4]" },
  ]);

  await sdb.done();
});
