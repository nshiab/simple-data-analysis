import type SimpleWebTable from "../class/SimpleWebTable.ts";
import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import shouldFlipBeforeExport from "../helpers/shouldFlipBeforeExport.ts";

export default async function getGeoData(
  simpleWebTable: SimpleWebTable,
  column: string,
) {
  let query = "";
  if (shouldFlipBeforeExport(simpleWebTable.projections[column])) {
    query =
      `SELECT * EXCLUDE ${column}, ST_AsGeoJSON(ST_FlipCoordinates(${column})) as geoJsonFragment from ${simpleWebTable.name};`;
  } else {
    query =
      `SELECT * EXCLUDE ${column}, ST_AsGeoJSON(${column}) as geoJsonFragment from ${simpleWebTable.name};`;
  }
  const queryResult = await queryDB(
    simpleWebTable,
    query,
    mergeOptions(simpleWebTable, {
      table: null,
      method: "getGeoData()",
      parameters: { column },
      returnDataFrom: "query",
    }),
  );

  if (!queryResult) {
    throw new Error("No queryResults");
  }

  const features = queryResult.map((d) => {
    const { geoJsonFragment, ...properties } = d;
    const geometry = JSON.parse(geoJsonFragment as string);

    const feature = {
      type: "Feature",
      geometry,
      properties,
    };

    return feature;
  });

  return {
    type: "FeatureCollection",
    features,
  };
}
