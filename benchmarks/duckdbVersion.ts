import { DuckDBInstance } from "@duckdb/node-api";

const instance = await DuckDBInstance.create(":memory:");
const connection = await instance.connect();
try {
  const rows = await (await connection.run("SELECT version()")).getRows();
  console.log(rows[0][0]);
} finally {
  connection.closeSync();
  instance.closeSync();
}
