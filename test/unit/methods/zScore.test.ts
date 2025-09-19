import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should add a column with the zScore", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    { name: "Chloe", age: 33 },
    { name: "Philip", age: 33 },
    { name: "Sonny", age: 57 },
    { name: "Frazer", age: 64 },
    { name: "Sarah", age: 64 },
    { name: "Frankie", age: 65 },
    { name: "Morgan", age: 33 },
    { name: "Jeremy", age: 34 },
    { name: "Claudia", age: 35 },
    { name: "Evangeline", age: 21 },
    { name: "Amelia", age: 29 },
    { name: "Marie", age: 30 },
    { name: "Kiara", age: 31 },
    { name: "Isobel", age: 31 },
    { name: "Genevieve", age: 32 },
    { name: "Jane", age: 32 },
  ]);
  await table.zScore("age", "ageZ");

  await table.sort({ ageZ: "asc" });

  const data = await table.getData();

  assertEquals(data, [
    { name: "Evangeline", age: 21, ageZ: -1.2869460097256922 },
    { name: "Amelia", age: 29, ageZ: -0.7149700054031624 },
    { name: "Marie", age: 30, ageZ: -0.6434730048628461 },
    { name: "Kiara", age: 31, ageZ: -0.5719760043225299 },
    { name: "Isobel", age: 31, ageZ: -0.5719760043225299 },
    { name: "Genevieve", age: 32, ageZ: -0.5004790037822137 },
    { name: "Jane", age: 32, ageZ: -0.5004790037822137 },
    { name: "Chloe", age: 33, ageZ: -0.42898200324189745 },
    { name: "Philip", age: 33, ageZ: -0.42898200324189745 },
    { name: "Morgan", age: 33, ageZ: -0.42898200324189745 },
    { name: "Jeremy", age: 34, ageZ: -0.3574850027015812 },
    { name: "Claudia", age: 35, ageZ: -0.28598800216126496 },
    { name: "Sonny", age: 57, ageZ: 1.2869460097256922 },
    { name: "Frazer", age: 64, ageZ: 1.787425013507906 },
    { name: "Sarah", age: 64, ageZ: 1.787425013507906 },
    { name: "Frankie", age: 65, ageZ: 1.858922014048222 },
  ]);

  await sdb.done();
});

Deno.test("should add a column with the zScore rounded to 3 decimals", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    { name: "Chloe", age: 33 },
    { name: "Philip", age: 33 },
    { name: "Sonny", age: 57 },
    { name: "Frazer", age: 64 },
    { name: "Sarah", age: 64 },
    { name: "Frankie", age: 65 },
    { name: "Morgan", age: 33 },
    { name: "Jeremy", age: 34 },
    { name: "Claudia", age: 35 },
    { name: "Evangeline", age: 21 },
    { name: "Amelia", age: 29 },
    { name: "Marie", age: 30 },
    { name: "Kiara", age: 31 },
    { name: "Isobel", age: 31 },
    { name: "Genevieve", age: 32 },
    { name: "Jane", age: 32 },
  ]);
  await table.zScore("age", "ageSigma", {
    decimals: 3,
  });

  await table.sort({ ageSigma: "asc" });

  const data = await table.getData();

  assertEquals(data, [
    { name: "Evangeline", age: 21, ageSigma: -1.287 },
    { name: "Amelia", age: 29, ageSigma: -0.715 },
    { name: "Marie", age: 30, ageSigma: -0.643 },
    { name: "Kiara", age: 31, ageSigma: -0.572 },
    { name: "Isobel", age: 31, ageSigma: -0.572 },
    { name: "Genevieve", age: 32, ageSigma: -0.5 },
    { name: "Jane", age: 32, ageSigma: -0.5 },
    { name: "Chloe", age: 33, ageSigma: -0.429 },
    { name: "Philip", age: 33, ageSigma: -0.429 },
    { name: "Morgan", age: 33, ageSigma: -0.429 },
    { name: "Jeremy", age: 34, ageSigma: -0.357 },
    { name: "Claudia", age: 35, ageSigma: -0.286 },
    { name: "Sonny", age: 57, ageSigma: 1.287 },
    { name: "Frazer", age: 64, ageSigma: 1.787 },
    { name: "Sarah", age: 64, ageSigma: 1.787 },
    { name: "Frankie", age: 65, ageSigma: 1.859 },
  ]);

  await sdb.done();
});

Deno.test("should add a column with the zScore rounded to 3 decimals and with a category", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.loadArray([
    { name: "Chloe", age: 33, gender: "Woman" },
    { name: "Philip", age: 33, gender: "Man" },
    { name: "Sonny", age: 57, gender: "Man" },
    { name: "Frazer", age: 64, gender: "Man" },
    { name: "Sarah", age: 64, gender: "Woman" },
    { name: "Frankie", age: 65, gender: "Woman" },
    { name: "Morgan", age: 33, gender: "Woman" },
    { name: "Jeremy", age: 34, gender: "Man" },
    { name: "Claudia", age: 35, gender: "Woman" },
    { name: "Evangeline", age: 21, gender: "Woman" },
    { name: "Amelia", age: 29, gender: "Woman" },
    { name: "Marie", age: 30, gender: "Woman" },
    { name: "Kiara", age: 31, gender: "Woman" },
    { name: "Isobel", age: 31, gender: "Woman" },
    { name: "Genevieve", age: 32, gender: "Woman" },
    { name: "Jane", age: 32, gender: "Woman" },
  ]);
  await table.zScore("age", "ageSigma", {
    categories: "gender",
    decimals: 3,
  });

  await table.sort({
    gender: "asc",
    ageSigma: "asc",
  });
  const data = await table.getData();

  assertEquals(data, [
    { name: "Philip", age: 33, gender: "Man", ageSigma: -1.02 },
    { name: "Jeremy", age: 34, gender: "Man", ageSigma: -0.947 },
    { name: "Sonny", age: 57, gender: "Man", ageSigma: 0.728 },
    { name: "Frazer", age: 64, gender: "Man", ageSigma: 1.238 },
    { name: "Evangeline", age: 21, gender: "Woman", ageSigma: -1.178 },
    { name: "Amelia", age: 29, gender: "Woman", ageSigma: -0.563 },
    { name: "Marie", age: 30, gender: "Woman", ageSigma: -0.486 },
    { name: "Kiara", age: 31, gender: "Woman", ageSigma: -0.41 },
    { name: "Isobel", age: 31, gender: "Woman", ageSigma: -0.41 },
    { name: "Genevieve", age: 32, gender: "Woman", ageSigma: -0.333 },
    { name: "Jane", age: 32, gender: "Woman", ageSigma: -0.333 },
    { name: "Chloe", age: 33, gender: "Woman", ageSigma: -0.256 },
    { name: "Morgan", age: 33, gender: "Woman", ageSigma: -0.256 },
    { name: "Claudia", age: 35, gender: "Woman", ageSigma: -0.102 },
    { name: "Sarah", age: 64, gender: "Woman", ageSigma: 2.125 },
    { name: "Frankie", age: 65, gender: "Woman", ageSigma: 2.202 },
  ]);

  await sdb.done();
});
