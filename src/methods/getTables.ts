import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleWebDB from "../class/SimpleWebDB.ts";

export default async function getTables(simpleWebDB: SimpleWebDB) {
  const queryResult = await queryDB(
    simpleWebDB,
    `SHOW TABLES`,
    mergeOptions(simpleWebDB, {
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

  simpleWebDB.debug && console.log("tables:", tables);

  return tables;
}
