import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { existsSync, rmSync } from "node:fs";

const aiKey = Deno.env.get("AI_KEY") ?? Deno.env.get("AI_PROJECT");
if (typeof aiKey === "string" && aiKey !== "") {
  if (existsSync("./.journalism-cache")) {
    rmSync("./.journalism-cache", { recursive: true });
  }
  if (existsSync("./.sda-cache")) {
    rmSync("./.sda-cache", { recursive: true });
  }

  Deno.test(
    "should perform hybrid search and return a table",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeDuplicates({ on: "Dish" });
      await table.removeMissing({ columns: "Recipe" });

      const originalNbRows = await table.getNbRows();

      const results = await table.hybridSearch(
        "buttery pastry for breakfast",
        "Dish",
        "Recipe",
        10,
        {
          embeddingsConcurrent: 100,
          cache: true,
          verbose: true,
        },
      );

      // Should return the same table instance when no outputTable is specified
      assertEquals(results, table);

      // Table should be modified to contain only the search results
      const nbRows = await table.getNbRows();
      assertEquals(nbRows <= 10, true);
      assertEquals(nbRows < originalNbRows, true);

      // Verify it has the expected columns
      const columns = await table.getColumns();
      assertEquals(columns.includes("Dish"), true);
      assertEquals(columns.includes("Recipe"), true);

      await sdb.done();
    },
  );

  Deno.test(
    "should perform hybrid search with cached embeddings",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeDuplicates({ on: "Dish" });
      await table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch(
        "spicy vegan lunch",
        "Dish",
        "Recipe",
        5,
        {
          embeddingsConcurrent: 100,
          cache: true,
        },
      );

      const nbRows = await results.getNbRows();
      assertEquals(nbRows <= 5, true);

      await sdb.done();
    },
  );

  Deno.test(
    "should perform hybrid search with custom output table",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeDuplicates({ on: "Dish" });
      await table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch(
        "italian cuisine",
        "Dish",
        "Recipe",
        5,
        {
          embeddingsConcurrent: 100,
          cache: true,
          outputTable: "italian_search_results",
        },
      );

      // Verify the output table name
      assertEquals(results.name, "italian_search_results");

      // Verify original table is unchanged
      const originalNbRows = await table.getNbRows();
      assertEquals(originalNbRows > 5, true);

      await sdb.done();
    },
  );

  Deno.test(
    "should perform hybrid search with custom BM25 parameters",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeDuplicates({ on: "Dish" });
      await table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch(
        "french cuisine",
        "Dish",
        "Recipe",
        5,
        {
          embeddingsConcurrent: 100,
          cache: true,
          stemmer: "french",
          k: 1.5,
          b: 0.8,
        },
      );

      const nbRows = await results.getNbRows();
      assertEquals(nbRows <= 5, true);

      await sdb.done();
    },
  );

  Deno.test(
    "should perform hybrid search with index creation",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeDuplicates({ on: "Dish" });
      await table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch(
        "dessert",
        "Dish",
        "Recipe",
        3,
        {
          cache: true,
          createIndex: true,
          verbose: true,
        },
      );

      const nbRows = await results.getNbRows();
      assertEquals(nbRows <= 3, true);

      await sdb.done();
    },
  );
}
const ollama = Deno.env.get("OLLAMA");
if (typeof ollama === "string" && ollama !== "") {
  if (existsSync("./.journalism-cache")) {
    rmSync("./.journalism-cache", { recursive: true });
  }
  if (existsSync("./.sda-cache")) {
    rmSync("./.sda-cache", { recursive: true });
  }

  Deno.test(
    "should perform hybrid search and return a table",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeDuplicates({ on: "Dish" });
      await table.removeMissing({ columns: "Recipe" });

      const originalNbRows = await table.getNbRows();

      const results = await table.hybridSearch(
        "buttery pastry for breakfast",
        "Dish",
        "Recipe",
        10,
        {
          cache: true,
          ollamaEmbeddings: true,
          verbose: true,
        },
      );

      await results.logTable();

      // Should return the same table instance when no outputTable is specified
      assertEquals(results, table);

      // Table should be modified to contain only the search results
      const nbRows = await table.getNbRows();
      assertEquals(nbRows <= 10, true);
      assertEquals(nbRows < originalNbRows, true);

      // Verify it has the expected columns
      const columns = await table.getColumns();
      assertEquals(columns.includes("Dish"), true);
      assertEquals(columns.includes("Recipe"), true);

      await sdb.done();
    },
  );

  Deno.test(
    "should perform hybrid search with cached embeddings",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeDuplicates({ on: "Dish" });
      await table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch(
        "spicy vegan lunch",
        "Dish",
        "Recipe",
        5,
        {
          cache: true,
          ollamaEmbeddings: true,
        },
      );

      await results.logTable();

      const nbRows = await results.getNbRows();
      assertEquals(nbRows <= 5, true);

      await sdb.done();
    },
  );

  Deno.test(
    "should perform hybrid search with custom output table",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeDuplicates({ on: "Dish" });
      await table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch(
        "italian cuisine",
        "Dish",
        "Recipe",
        5,
        {
          cache: true,
          ollamaEmbeddings: true,
          outputTable: "italian_search_results",
        },
      );

      await results.logTable();

      // Verify the output table name
      assertEquals(results.name, "italian_search_results");

      // Verify original table is unchanged
      const originalNbRows = await table.getNbRows();
      assertEquals(originalNbRows > 5, true);

      await sdb.done();
    },
  );

  Deno.test(
    "should perform hybrid search with custom BM25 parameters",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeDuplicates({ on: "Dish" });
      await table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch(
        "french cuisine",
        "Dish",
        "Recipe",
        5,
        {
          cache: true,
          ollamaEmbeddings: true,
          stemmer: "french",
          k: 1.5,
          b: 0.8,
        },
      );

      await results.logTable();

      const nbRows = await results.getNbRows();
      assertEquals(nbRows <= 5, true);

      await sdb.done();
    },
  );

  Deno.test(
    "should perform hybrid search with index creation",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeDuplicates({ on: "Dish" });
      await table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch(
        "dessert",
        "Dish",
        "Recipe",
        3,
        {
          cache: true,
          ollamaEmbeddings: true,
          createIndex: true,
          verbose: true,
        },
      );

      await results.logTable();

      const nbRows = await results.getNbRows();
      assertEquals(nbRows <= 3, true);

      await sdb.done();
    },
  );

  Deno.test(
    "should perform hybrid search with only BM25",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeDuplicates({ on: "Dish" });
      await table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch(
        "dessert",
        "Dish",
        "Recipe",
        5,
        {
          cache: true,
          ollamaEmbeddings: true,
          vectorSearch: false, // Disable vector search
          bm25: true, // Enable only BM25
          verbose: true,
        },
      );

      await results.logTable();

      const nbRows = await results.getNbRows();
      assertEquals(nbRows <= 5, true);

      await sdb.done();
    },
  );

  Deno.test(
    "should perform hybrid search with only vector search",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeDuplicates({ on: "Dish" });
      await table.removeMissing({ columns: "Recipe" });

      const results = await table.hybridSearch(
        "healthy breakfast",
        "Dish",
        "Recipe",
        5,
        {
          cache: true,
          ollamaEmbeddings: true,
          vectorSearch: true, // Enable only vector search
          bm25: false, // Disable BM25
          verbose: true,
        },
      );

      await results.logTable();

      const nbRows = await results.getNbRows();
      assertEquals(nbRows <= 5, true);

      await sdb.done();
    },
  );

  Deno.test(
    "should throw error when both search methods are disabled",
    { sanitizeResources: false },
    async () => {
      const sdb = new SimpleDB();
      const table = sdb.newTable("data");
      await table.loadData("test/data/files/recipes.parquet");
      await table.removeDuplicates({ on: "Dish" });
      await table.removeMissing({ columns: "Recipe" });

      let errorThrown = false;
      try {
        await table.hybridSearch(
          "test",
          "Dish",
          "Recipe",
          5,
          {
            cache: true,
            ollamaEmbeddings: true,
            vectorSearch: false,
            bm25: false,
          },
        );
      } catch (error) {
        errorThrown = true;
        assertEquals(
          (error as Error).message.includes(
            "At least one search method must be enabled",
          ),
          true,
        );
      }

      assertEquals(errorThrown, true);

      await sdb.done();
    },
  );
}
