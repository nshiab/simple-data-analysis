import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleWebTable from "../class/SimpleWebTable.ts";
import extractTypes from "../helpers/extractTypes.ts";

export default async function getTypes(simpleWebTable: SimpleWebTable) {
  const types = await queryDB(
    simpleWebTable,
    `DESCRIBE "${simpleWebTable.name}"`,
    mergeOptions(simpleWebTable, {
      table: simpleWebTable.name,
      returnDataFrom: "query",
      method: "getTypes()",
      parameters: {},
    }),
  );

  const typesObj = extractTypes(types);

  simpleWebTable.debug && console.log("types:", typesObj);

  return typesObj;
}
