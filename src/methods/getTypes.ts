import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleTable from "../class/SimpleTable.ts";
import extractTypes from "../helpers/extractTypes.ts";

export default async function getTypes(simpleTable: SimpleTable) {
  const types = await queryDB(
    simpleTable,
    `DESCRIBE "${simpleTable.name}"`,
    mergeOptions(simpleTable, {
      table: simpleTable.name,
      returnDataFrom: "query",
      method: "getTypes()",
      parameters: {},
    }),
  );

  const typesObj = extractTypes(types);

  return typesObj;
}
