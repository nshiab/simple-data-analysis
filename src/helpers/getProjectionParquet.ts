import type SimpleTable from "../class/SimpleTable.ts";
import cleanPath from "./cleanPath.ts";
import mergeOptions from "./mergeOptions.ts";
import queryDB from "./queryDB.ts";

export default async function getProjectionParquet(
  SimpleTable: SimpleTable,
  file: string,
) {
  const queryResult = await queryDB(
    SimpleTable,
    `SELECT * FROM parquet_kv_metadata('${cleanPath(file)}');`,
    mergeOptions(SimpleTable, {
      table: SimpleTable.name,
      method: "getProjectionParquet()",
      parameters: { file },
      returnDataFrom: "query",
    }),
  );

  if (!queryResult) {
    throw new Error(
      `Could not get metadata from parquet file: ${file}`,
    );
  }

  const projection = queryResult.find((d) => {
    return d.key?.toString() === "projections";
  });

  if (!projection || projection.value === null) {
    console.warn(
      `\nCould not get projection from parquet file: ${file}\n`,
    );
    return {};
  } else {
    return JSON.parse((projection.value as string).replaceAll("\\x22", '"'));
  }
}
