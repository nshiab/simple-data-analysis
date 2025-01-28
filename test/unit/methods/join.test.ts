import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should put the result of an inner join into a new table", async () => {
  const sdb = new SimpleDB();
  const dishes = sdb.newTable("dishes");
  await dishes.loadData("test/data/joins/dishes.csv");
  const categories = sdb.newTable("categories");
  await categories.loadData("test/data/joins/categories.csv");

  const joined = await dishes.join(categories, {
    commonColumn: "dishId",
    type: "inner",
    outputTable: true,
  });

  const data = await joined.getData();

  assertEquals(data, [
    {
      dishId: 1,
      name: "Crème brûlée",
      country: "France",
      category: "Dessert",
    },
    { dishId: 2, name: "Pizza", country: "Italy", category: "Main" },
    {
      dishId: 3,
      name: "Churros",
      country: "Mexico",
      category: "Dessert",
    },
  ]);

  await sdb.done();
});

Deno.test("should put the result of a left join into a new table", async () => {
  const sdb = new SimpleDB();
  const dishes = sdb.newTable("dishes");
  await dishes.loadData("test/data/joins/dishes.csv");
  const categories = sdb.newTable("categories");
  await categories.loadData("test/data/joins/categories.csv");

  const joined = await dishes.join(categories, {
    commonColumn: "dishId",
    type: "left",
    outputTable: true,
  });

  const data = await joined.getData();

  assertEquals(data, [
    {
      dishId: 1,
      name: "Crème brûlée",
      country: "France",
      category: "Dessert",
    },
    { dishId: 2, name: "Pizza", country: "Italy", category: "Main" },
    {
      dishId: 3,
      name: "Churros",
      country: "Mexico",
      category: "Dessert",
    },
    {
      dishId: 4,
      name: "Couscous",
      country: "Morrocco",
      category: null,
    },
    { dishId: 5, name: "Mochi", country: "Japan", category: null },
  ]);

  await sdb.done();
});

Deno.test("should put the result of a right join into a new table", async () => {
  const sdb = new SimpleDB();
  const dishes = sdb.newTable("dishes");
  await dishes.loadData("test/data/joins/dishes.csv");
  const categories = sdb.newTable("categories");
  await categories.loadData("test/data/joins/categories.csv");

  const joined = await dishes.join(categories, {
    commonColumn: "dishId",
    type: "right",
    outputTable: true,
  });

  const data = await joined.getData();

  assertEquals(data, [
    {
      dishId: 1,
      name: "Crème brûlée",
      country: "France",
      category: "Dessert",
    },
    { dishId: 2, name: "Pizza", country: "Italy", category: "Main" },
    {
      dishId: 3,
      name: "Churros",
      country: "Mexico",
      category: "Dessert",
    },
    { dishId: null, name: null, country: null, category: "Dessert" },
    { dishId: null, name: null, country: null, category: "Main" },
    { dishId: null, name: null, country: null, category: "Main" },
  ]);

  await sdb.done();
});

Deno.test("should put the result of a full join into a new table", async () => {
  const sdb = new SimpleDB();
  const dishes = sdb.newTable("dishes");
  await dishes.loadData("test/data/joins/dishes.csv");
  const categories = sdb.newTable("categories");
  await categories.loadData("test/data/joins/categories.csv");

  const joined = await dishes.join(categories, {
    commonColumn: "dishId",
    type: "full",
    outputTable: true,
  });

  const data = await joined.getData();

  assertEquals(data, [
    {
      dishId: 1,
      name: "Crème brûlée",
      country: "France",
      category: "Dessert",
    },
    { dishId: 2, name: "Pizza", country: "Italy", category: "Main" },
    {
      dishId: 3,
      name: "Churros",
      country: "Mexico",
      category: "Dessert",
    },
    { dishId: 4, name: "Couscous", country: "Morrocco", category: null },
    { dishId: 5, name: "Mochi", country: "Japan", category: null },
    { dishId: null, name: null, country: null, category: "Dessert" },
    { dishId: null, name: null, country: null, category: "Main" },
    { dishId: null, name: null, country: null, category: "Main" },
  ]);

  await sdb.done();
});

Deno.test("should put the result of a full join into a new table with a specific name in the DB", async () => {
  const sdb = new SimpleDB();
  const dishes = sdb.newTable("dishes");
  await dishes.loadData("test/data/joins/dishes.csv");
  const categories = sdb.newTable("categories");
  await categories.loadData("test/data/joins/categories.csv");

  await dishes.join(categories, {
    commonColumn: "dishId",
    type: "full",
    outputTable: "joined",
  });

  const data = await sdb.customQuery("select * from joined", {
    returnDataFrom: "query",
  });

  assertEquals(data, [
    {
      dishId: "1",
      name: "Crème brûlée",
      country: "France",
      category: "Dessert",
    },
    { dishId: "2", name: "Pizza", country: "Italy", category: "Main" },
    {
      dishId: "3",
      name: "Churros",
      country: "Mexico",
      category: "Dessert",
    },
    { dishId: "4", name: "Couscous", country: "Morrocco", category: null },
    { dishId: "5", name: "Mochi", country: "Japan", category: null },
    { dishId: null, name: null, country: null, category: "Dessert" },
    { dishId: null, name: null, country: null, category: "Main" },
    { dishId: null, name: null, country: null, category: "Main" },
  ]);

  await sdb.done();
});

Deno.test("should automatically find a common column, make left join and put the result into leftTable", async () => {
  const sdb = new SimpleDB();
  const dishes = sdb.newTable("dishes");
  await dishes.loadData("test/data/joins/dishes.csv");
  const categories = sdb.newTable("categories");
  await categories.loadData("test/data/joins/categories.csv");

  await dishes.join(categories);

  const data = await dishes.getData();

  assertEquals(data, [
    {
      dishId: 1,
      name: "Crème brûlée",
      country: "France",
      category: "Dessert",
    },
    { dishId: 2, name: "Pizza", country: "Italy", category: "Main" },
    {
      dishId: 3,
      name: "Churros",
      country: "Mexico",
      category: "Dessert",
    },
    {
      dishId: 4,
      name: "Couscous",
      country: "Morrocco",
      category: null,
    },
    { dishId: 5, name: "Mochi", country: "Japan", category: null },
  ]);

  await sdb.done();
});

Deno.test("should keep all projections", async () => {
  const sdb = new SimpleDB();
  const dishes = sdb.newTable("dishes");
  await dishes.loadData("test/data/joins/dishes.csv");
  const categories = sdb.newTable("categories");
  await categories.loadData("test/data/joins/categories.csv");
  await categories.addColumn("lat", "double", `45.50`);
  await categories.addColumn("lon", "double", `-73.57`);
  await categories.points("lat", "lon", "points");

  await dishes.join(categories);

  assertEquals(dishes.projections, {
    points: "+proj=latlong +datum=WGS84 +no_defs",
  });

  await sdb.done();
});

Deno.test("should join on multiple columns", async () => {
  const sdb = new SimpleDB();
  const dishes = sdb.newTable("normals");
  await dishes.loadData("test/data/joins/normals.csv");
  const categories = sdb.newTable("projections");
  await categories.loadData("test/data/joins/projections.csv");
  await dishes.join(categories, { commonColumn: ["city", "season"] });

  await sdb.done();
});
