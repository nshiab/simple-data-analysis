import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import type SimpleDB from "../class/SimpleDB.ts";
import cleanPath from "./cleanPath.ts";

export default async function getProjection(
  simpleDB: SimpleDB,
  file: string,
) {
  // Load spatial may not be necessary if we change how this works
  const queryResult = await queryDB(
    simpleDB,
    `INSTALL spatial;
        LOAD spatial;
        SELECT layers[1].geometry_fields[1].crs.proj4 as proj4 FROM st_read_meta('${
      cleanPath(file)
    }')`,
    mergeOptions(simpleDB, {
      table: null,
      method: "getProjection()",
      parameters: { file },
      returnDataFrom: "query",
    }),
  );

  if (!queryResult) {
    throw new Error("No queryResults");
  }

  const proj4 = queryResult[0].proj4;
  if (typeof proj4 !== "string") {
    throw new Error(
      `Expected proj4 to be a string, got ${typeof proj4}`,
    );
  }

  return proj4;
}
