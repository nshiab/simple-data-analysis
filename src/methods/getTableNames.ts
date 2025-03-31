import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleDB from "../class/SimpleDB.ts";

export default async function getTableNames(simpleDB: SimpleDB) {
  const queryResult = await queryDB(
    simpleDB,
    `SHOW TABLES`,
    mergeOptions(simpleDB, {
      returnDataFrom: "query",
      table: null,
      method: "getTables",
      parameters: {},
    }),
  );

  if (!queryResult) {
    throw new Error("No result");
  }

  const tables = queryResult.map((d) => d.name) as string[];

  return tables;
}
