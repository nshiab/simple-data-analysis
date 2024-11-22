import { rewind } from "@nshiab/journalism/web";
import type SimpleWebTable from "../class/SimpleWebTable.ts";
import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import shouldFlipBeforeExport from "../helpers/shouldFlipBeforeExport.ts";
// @deno-types="npm:@types/d3-geo@3"
import type { GeoPermissibleObjects } from "npm:d3-geo@3";

export default async function getGeoData(
  simpleWebTable: SimpleWebTable,
  column: string,
  options: { rewind?: boolean } = {},
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

  const geoJSON = {
    type: "FeatureCollection",
    features,
  };

  return options.rewind
    ? rewind(geoJSON as GeoPermissibleObjects) as {
      type: string;
      features: unknown[];
    }
    : geoJSON;
}
