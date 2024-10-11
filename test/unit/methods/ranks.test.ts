import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

// Based on https://www.sqlshack.com/overview-of-sql-rank-functions/

const sdb = new SimpleDB();

Deno.test("should add a column with the rank", async () => {
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataRank.csv");
  await table.ranks("Mark", "rank");
  const data = await table.getData();
  assertEquals(data, [
    { Name: "Isabella", Subject: "Maths", Mark: 50, rank: 1 },
    { Name: "Olivia", Subject: "Maths", Mark: 55, rank: 2 },
    { Name: "Olivia", Subject: "Science", Mark: 60, rank: 3 },
    { Name: "Lily", Subject: "Maths", Mark: 65, rank: 4 },
    { Name: "Lily", Subject: "English", Mark: 70, rank: 5 },
    { Name: "Isabella", Subject: "Science", Mark: 70, rank: 5 },
    { Name: "Lily", Subject: "Science", Mark: 80, rank: 7 },
    { Name: "Olivia", Subject: "English", Mark: 89, rank: 8 },
    { Name: "Isabella", Subject: "English", Mark: 90, rank: 9 },
  ]);
});
Deno.test("should add a column with the rank in descending order", async () => {
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataRank.csv");
  await table.ranks("Mark", "rank", { order: "desc" });
  const data = await table.getData();
  assertEquals(data, [
    { Name: "Isabella", Subject: "English", Mark: 90, rank: 1 },
    { Name: "Olivia", Subject: "English", Mark: 89, rank: 2 },
    { Name: "Lily", Subject: "Science", Mark: 80, rank: 3 },
    { Name: "Lily", Subject: "English", Mark: 70, rank: 4 },
    { Name: "Isabella", Subject: "Science", Mark: 70, rank: 4 },
    { Name: "Lily", Subject: "Maths", Mark: 65, rank: 6 },
    { Name: "Olivia", Subject: "Science", Mark: 60, rank: 7 },
    { Name: "Olivia", Subject: "Maths", Mark: 55, rank: 8 },
    { Name: "Isabella", Subject: "Maths", Mark: 50, rank: 9 },
  ]);
});
Deno.test("should add a column with the rank and no gaps", async () => {
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataRank.csv");
  await table.ranks("Mark", "rank", {
    noGaps: true,
  });
  const data = await table.getData();

  assertEquals(data, [
    { Name: "Isabella", Subject: "Maths", Mark: 50, rank: 1 },
    { Name: "Olivia", Subject: "Maths", Mark: 55, rank: 2 },
    { Name: "Olivia", Subject: "Science", Mark: 60, rank: 3 },
    { Name: "Lily", Subject: "Maths", Mark: 65, rank: 4 },
    { Name: "Lily", Subject: "English", Mark: 70, rank: 5 },
    { Name: "Isabella", Subject: "Science", Mark: 70, rank: 5 },
    { Name: "Lily", Subject: "Science", Mark: 80, rank: 6 },
    { Name: "Olivia", Subject: "English", Mark: 89, rank: 7 },
    { Name: "Isabella", Subject: "English", Mark: 90, rank: 8 },
  ]);
});
Deno.test("should add a column with the rank after grouping with one category", async () => {
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataRank.csv");
  await table.ranks("Mark", "rank", {
    categories: "Subject",
  });
  await table.sort({
    Subject: "asc",
    Mark: "asc",
  });
  const data = await table.getData();
  assertEquals(data, [
    { Name: "Lily", Subject: "English", Mark: 70, rank: 1 },
    { Name: "Olivia", Subject: "English", Mark: 89, rank: 2 },
    { Name: "Isabella", Subject: "English", Mark: 90, rank: 3 },
    { Name: "Isabella", Subject: "Maths", Mark: 50, rank: 1 },
    { Name: "Olivia", Subject: "Maths", Mark: 55, rank: 2 },
    { Name: "Lily", Subject: "Maths", Mark: 65, rank: 3 },
    { Name: "Olivia", Subject: "Science", Mark: 60, rank: 1 },
    { Name: "Isabella", Subject: "Science", Mark: 70, rank: 2 },
    { Name: "Lily", Subject: "Science", Mark: 80, rank: 3 },
  ]);
});
Deno.test("should add a column with the rank after grouping with multiple categories", async () => {
  const table = sdb.newTable();
  await table.loadData("test/data/files/dataRank.csv");
  await table.ranks("Mark", "rank", {
    categories: ["Name", "Subject"],
  });

  await table.sort({
    Name: "asc",
    Subject: "asc",
    Mark: "asc",
  });

  const data = await table.getData();

  assertEquals(data, [
    { Name: "Isabella", Subject: "English", Mark: 90, rank: 1 },
    { Name: "Isabella", Subject: "Maths", Mark: 50, rank: 1 },
    { Name: "Isabella", Subject: "Science", Mark: 70, rank: 1 },
    { Name: "Lily", Subject: "English", Mark: 70, rank: 1 },
    { Name: "Lily", Subject: "Maths", Mark: 65, rank: 1 },
    { Name: "Lily", Subject: "Science", Mark: 80, rank: 1 },
    { Name: "Olivia", Subject: "English", Mark: 89, rank: 1 },
    { Name: "Olivia", Subject: "Maths", Mark: 55, rank: 1 },
    { Name: "Olivia", Subject: "Science", Mark: 60, rank: 1 },
  ]);
});

await sdb.done();
