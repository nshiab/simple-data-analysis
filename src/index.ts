/**
 * @module
 *
 * The Simple Data Analysis Library
 *
 * To install the library with Deno, use:
 * ```bash
 * deno add jsr:@nshiab/simple-data-analysis
 * ```
 *
 * To install the library with Node.js, use:
 * ```bash
 * npx jsr add @nshiab/simple-data-analysis
 * ```
 *
 * To start, create a SimpleDB instance and then a SimpleTable from this instance:
 * ```ts
 * import { SimpleDB } from "@nshiab/simple-data-analysis";
 *
 * const sdb = new SimpleDB();
 * const table = db.createTable("myTable"); // This returns a SimpleTable instance
 * await table.loadData("path/to/your/data.csv");
 *
 * // You can now perform various data analysis operations on the table.
 *
 * await sdb.done(); // Ensure to call done when you're finished.
 * ```
 */

export { default as SimpleDB } from "./class/SimpleDB.ts";
export { default as SimpleTable } from "./class/SimpleTable.ts";
