import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should normalize strings in-place with mostCommon keep strategy", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.insertRows([
    { city: "New York" },
    { city: "New York" },
    { city: "New York" },
    { city: "New Yorkk" },
    { city: "Paris" },
    { city: "Paris" },
    { city: "Pariss" },
  ]);

  await table.fuzzyClean("city", "city");

  const data = await table.getData();

  assertEquals(data, [
    { city: "New York" },
    { city: "New York" },
    { city: "New York" },
    { city: "New York" },
    { city: "Paris" },
    { city: "Paris" },
    { city: "Paris" },
  ]);

  await sdb.done();
});

Deno.test("should keep the longest string in each cluster when keep is 'longestString'", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.insertRows([
    { city: "New York" },
    { city: "New Yorkk" },
    { city: "Paris" },
    { city: "Pariss" },
  ]);

  await table.fuzzyClean("city", "city", { keep: "longestString" });

  const data = await table.getData();

  assertEquals(data, [
    { city: "New Yorkk" },
    { city: "New Yorkk" },
    { city: "Pariss" },
    { city: "Pariss" },
  ]);

  await sdb.done();
});

Deno.test("should keep the shortest string in each cluster when keep is 'shortestString'", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.insertRows([
    { city: "New York" },
    { city: "New Yorkk" },
    { city: "Paris" },
    { city: "Pariss" },
  ]);

  await table.fuzzyClean("city", "city", { keep: "shortestString" });

  const data = await table.getData();

  assertEquals(data, [
    { city: "New York" },
    { city: "New York" },
    { city: "Paris" },
    { city: "Paris" },
  ]);

  await sdb.done();
});

Deno.test("should keep the most central string when keep is 'mostCentral'", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  // "Alice" has the highest *total* similarity to all other cluster members.
  await table.insertRows([
    { name: "Alice" },
    { name: "Alicee" },
    { name: "Alce" },
  ]);

  await table.fuzzyClean("name", "name", {
    keep: "mostCentral",
    threshold: 70,
  });

  const data = await table.getData();

  // "Alice" has the highest combined similarity to "Alicee" and "Alce"
  assertEquals(data, [
    { name: "Alice" },
    { name: "Alice" },
    { name: "Alice" },
  ]);

  await sdb.done();
});

Deno.test("should keep the string with the highest single pairwise score when keep is 'maxScore'", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  // "Alice" pairs with both "Alicee" (~91) and "Alce" (~89).
  // "Alicee" and "Alce" also pair with each other (~80).
  // max: Alice=91, Alicee=91, Alce=89 — Alice and Alicee tie.
  // sum tie-break: Alice=91+89=180 > Alicee=91+80=171 — Alice wins.
  await table.insertRows([
    { name: "Alice" },
    { name: "Alicee" },
    { name: "Alce" },
  ]);

  await table.fuzzyClean("name", "name", {
    keep: "maxScore",
    threshold: 70,
  });

  const data = await table.getData();

  assertEquals(data, [
    { name: "Alice" },
    { name: "Alice" },
    { name: "Alice" },
  ]);

  await sdb.done();
});

Deno.test("should write normalized values to a new column when newColumn is provided", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.insertRows([
    { city: "New York" },
    { city: "New York" },
    { city: "New Yorkk" },
    { city: "Paris" },
  ]);

  await table.fuzzyClean("city", "cityClean");

  const data = await table.getData();

  assertEquals(data, [
    { city: "New York", cityClean: "New York" },
    { city: "New York", cityClean: "New York" },
    { city: "New Yorkk", cityClean: "New York" },
    { city: "Paris", cityClean: "Paris" },
  ]);

  await sdb.done();
});

Deno.test("should not change any values when all strings are already unique and below threshold", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.insertRows([
    { country: "Canada" },
    { country: "Germany" },
    { country: "Japan" },
  ]);

  await table.fuzzyClean("country", "country", { threshold: 90 });

  const data = await table.getData();

  assertEquals(data, [
    { country: "Canada" },
    { country: "Germany" },
    { country: "Japan" },
  ]);

  await sdb.done();
});

Deno.test("should ignore NULL values and leave them unchanged", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.insertRows([
    { city: "New York" },
    { city: "New Yorkk" },
    { city: null },
  ]);

  await table.fuzzyClean("city", "city");

  const data = await table.getData();

  // Both counts are equal — alphabetical tie-break picks "New York" over "New Yorkk"
  assertEquals(data, [
    { city: "New York" },
    { city: "New York" },
    { city: null },
  ]);

  await sdb.done();
});

Deno.test("should normalize multiple clusters across a larger dataset", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  await table.insertRows([
    { brand: "Apple" },
    { brand: "Apple" },
    { brand: "Applee" },
    { brand: "Aple" },
    { brand: "Samsung" },
    { brand: "Samsung" },
    { brand: "Samsungg" },
    { brand: "Samsng" },
    { brand: "Google" },
    { brand: "Google" },
    { brand: "Gogle" },
    { brand: "Gooogle" },
    { brand: "Microsoft" },
    { brand: "Microsoft" },
    { brand: "Microsft" },
    { brand: "Sony" },
    { brand: "Sony" },
    { brand: "Sonny" },
    { brand: "Soni" },
  ]);

  await table.fuzzyClean("brand", "brand", { threshold: 80 });

  const data = await table.getData();

  // "Apple" (count=2) wins over "Applee" and "Aple"
  // "Samsung" (count=2) wins over "Samsungg" and "Samsng"
  // "Google" (count=2) wins over "Gogle" and "Gooogle"
  // "Microsoft" (count=2) wins over "Microsft"
  // "Sony" (count=2) wins over "Sonny"
  // "Soni" scores ~75% vs "Sony" — below threshold, stays unchanged
  assertEquals(data, [
    { brand: "Apple" },
    { brand: "Apple" },
    { brand: "Apple" },
    { brand: "Apple" },
    { brand: "Samsung" },
    { brand: "Samsung" },
    { brand: "Samsung" },
    { brand: "Samsung" },
    { brand: "Google" },
    { brand: "Google" },
    { brand: "Google" },
    { brand: "Google" },
    { brand: "Microsoft" },
    { brand: "Microsoft" },
    { brand: "Microsoft" },
    { brand: "Sony" },
    { brand: "Sony" },
    { brand: "Sony" },
    { brand: "Soni" },
  ]);

  await sdb.done();
});

Deno.test("should break ties by score when keep is 'mostCommon' and counts are equal", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  // All count=1 (primary tie). "mouse" scores highest (pairs with both others at threshold);
  // "moose" and "mause" only pair with "mouse", not with each other.
  // Alphabetically "mause" < "moose" < "mouse", so score must win over alphabetical.
  await table.insertRows([
    { word: "mouse" },
    { word: "moose" },
    { word: "mause" },
  ]);

  await table.fuzzyClean("word", "word", { threshold: 60 });

  const data = await table.getData();

  assertEquals(data, [
    { word: "mouse" },
    { word: "mouse" },
    { word: "mouse" },
  ]);

  await sdb.done();
});

Deno.test("should break ties by score when keep is 'longestString' and lengths are equal", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  // All length=5 (primary tie). "mouse" scores highest; alphabetically it comes last,
  // so score must be checked before alphabetical.
  await table.insertRows([
    { word: "mouse" },
    { word: "moose" },
    { word: "mause" },
  ]);

  await table.fuzzyClean("word", "word", {
    keep: "longestString",
    threshold: 60,
  });

  const data = await table.getData();

  assertEquals(data, [
    { word: "mouse" },
    { word: "mouse" },
    { word: "mouse" },
  ]);

  await sdb.done();
});

Deno.test("should break ties by score when keep is 'shortestString' and lengths are equal", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  // All length=5 (primary tie). "mouse" scores highest; alphabetically it comes last,
  // so score must be checked before alphabetical.
  await table.insertRows([
    { word: "mouse" },
    { word: "moose" },
    { word: "mause" },
  ]);

  await table.fuzzyClean("word", "word", {
    keep: "shortestString",
    threshold: 60,
  });

  const data = await table.getData();

  assertEquals(data, [
    { word: "mouse" },
    { word: "mouse" },
    { word: "mouse" },
  ]);

  await sdb.done();
});

Deno.test("should break ties alphabetically when keep is 'mostCommon' and counts are equal", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  // "color" and "colur" each appear once — equal counts, alphabetical picks "color"
  await table.insertRows([
    { word: "color" },
    { word: "colur" },
  ]);

  await table.fuzzyClean("word", "word", { threshold: 80 });

  const data = await table.getData();

  assertEquals(data, [
    { word: "color" },
    { word: "color" },
  ]);

  await sdb.done();
});

Deno.test("should break ties alphabetically when keep is 'longestString' and lengths are equal", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  // "color" and "colur" are both 5 chars — equal lengths, alphabetical picks "color"
  await table.insertRows([
    { word: "color" },
    { word: "colur" },
  ]);

  await table.fuzzyClean("word", "word", {
    keep: "longestString",
    threshold: 80,
  });

  const data = await table.getData();

  assertEquals(data, [
    { word: "color" },
    { word: "color" },
  ]);

  await sdb.done();
});

Deno.test("should break ties alphabetically when keep is 'shortestString' and lengths are equal", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  // "color" and "colur" are both 5 chars — equal lengths, alphabetical picks "color"
  await table.insertRows([
    { word: "color" },
    { word: "colur" },
  ]);

  await table.fuzzyClean("word", "word", {
    keep: "shortestString",
    threshold: 80,
  });

  const data = await table.getData();

  assertEquals(data, [
    { word: "color" },
    { word: "color" },
  ]);

  await sdb.done();
});

Deno.test("should break ties alphabetically when keep is 'mostCentral' and scores are equal", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  // In a 2-element cluster both members have the same total score (each scores against the other once).
  // Alphabetical tie-break picks "color" over "colur".
  await table.insertRows([
    { word: "color" },
    { word: "colur" },
  ]);

  await table.fuzzyClean("word", "word", {
    keep: "mostCentral",
    threshold: 80,
  });

  const data = await table.getData();

  assertEquals(data, [
    { word: "color" },
    { word: "color" },
  ]);

  await sdb.done();
});

Deno.test("should break ties by sum when keep is 'maxScore' and max scores are equal", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  // "mouse" pairs with both "moose" and "mause"; the other two do not pair with each other.
  // All three have the same max score (mouse-moose and mouse-mause are both the unique pair for moose/mause,
  // and the higher of the two for mouse — but moose's max equals mouse-moose and mause's max equals mouse-mause).
  // Sum tie-break: mouse has the highest total (two scores vs. one each) — mouse wins.
  // Alphabetically "mause" < "moose" < "mouse", so sum must be checked before alphabetical.
  await table.insertRows([
    { word: "mouse" },
    { word: "moose" },
    { word: "mause" },
  ]);

  await table.fuzzyClean("word", "word", { keep: "maxScore", threshold: 60 });

  const data = await table.getData();

  assertEquals(data, [
    { word: "mouse" },
    { word: "mouse" },
    { word: "mouse" },
  ]);

  await sdb.done();
});

Deno.test("should break ties alphabetically when keep is 'maxScore' and max and sum scores are equal", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  // In a 2-element cluster both members have the same max score AND the same sum score.
  // Alphabetical tie-break picks "color" over "colur".
  await table.insertRows([
    { word: "color" },
    { word: "colur" },
  ]);

  await table.fuzzyClean("word", "word", {
    keep: "maxScore",
    threshold: 80,
  });

  const data = await table.getData();

  assertEquals(data, [
    { word: "color" },
    { word: "color" },
  ]);

  await sdb.done();
});

Deno.test("should respect a custom threshold and only normalize strings above it", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable();
  // "New York" (count=2) vs "New Yorkk" (count=1) ratio ~94 — should be normalized at threshold 90
  // "Paris" vs "Bonjour" ratio is low — should NOT be normalized
  await table.insertRows([
    { text: "New York" },
    { text: "New York" },
    { text: "New Yorkk" },
    { text: "Paris" },
    { text: "Bonjour" },
  ]);

  await table.fuzzyClean("text", "text", { threshold: 90 });

  const data = await table.getData();

  // "New York" (count=2) wins over "New Yorkk" (count=1)
  // "Paris" and "Bonjour" are unrelated — unchanged

  assertEquals(data, [
    { text: "New York" },
    { text: "New York" },
    { text: "New York" },
    { text: "Paris" },
    { text: "Bonjour" },
  ]);

  await sdb.done();
});
