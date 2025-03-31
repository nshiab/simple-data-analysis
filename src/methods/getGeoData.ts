import { rewind } from "@nshiab/journalism/web";
import type SimpleTable from "../class/SimpleTable.ts";
import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import shouldFlipBeforeExport from "../helpers/shouldFlipBeforeExport.ts";
// @deno-types="npm:@types/d3-geo@3"
import type { GeoPermissibleObjects } from "npm:d3-geo@3";

export default async function getGeoData(
  SimpleTable: SimpleTable,
  column: string,
  options: { rewind?: boolean } = {},
) {
  let query = "";
  if (shouldFlipBeforeExport(SimpleTable.projections[column])) {
    query =
      `SELECT * EXCLUDE ${column}, ST_AsGeoJSON(ST_FlipCoordinates(${column})) as geoJsonFragment from ${SimpleTable.name};`;
  } else {
    query =
      `SELECT * EXCLUDE ${column}, ST_AsGeoJSON(${column}) as geoJsonFragment from ${SimpleTable.name};`;
  }
  const queryResult = await queryDB(
    SimpleTable,
    query,
    mergeOptions(SimpleTable, {
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
    const geometry = JSON.parse(geoJsonFragment as string) as {
      "type": string;
      "coordinates": unknown[];
    };

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
      features: {
        type: string;
        geometry: {
          type: string;
          coordinates: unknown[];
        };
        properties: {
          [key: string]: string | number | boolean | Date | null;
        };
      }[];
    }
    : geoJSON;
}
