export default function joinGeoQuery(
  leftTable: string,
  leftTableColumn: string,
  method: "intersect" | "inside" | "within",
  rightTable: string,
  rightTableColumn: string,
  join: "inner" | "left" | "right" | "full",
  outputTable: string,
  distance: number | undefined,
  distanceMethod: "srs" | "haversine" | "spheroid" | undefined,
) {
  let query = `CREATE OR REPLACE TABLE ${outputTable} AS SELECT *`;
  if (join === "inner") {
    query += ` FROM ${leftTable} JOIN ${rightTable}`;
  } else if (join === "left") {
    query += ` FROM ${leftTable} LEFT JOIN ${rightTable}`;
  } else if (join === "right") {
    query += ` FROM ${leftTable} RIGHT JOIN ${rightTable}`;
  } else if (join === "full") {
    query += ` FROM ${leftTable} FULL JOIN ${rightTable}`;
  } else {
    throw new Error(`Unknown ${join} join.`);
  }

  if (method === "intersect") {
    query +=
      ` ON ST_Intersects(${leftTable}.${leftTableColumn}, ${rightTable}.${rightTableColumn});`;
  } else if (method === "inside") {
    // Order is important
    query +=
      ` ON ST_Covers(${rightTable}.${rightTableColumn}, ${leftTable}.${leftTableColumn});`;
  } else if (method === "within") {
    if (typeof distance === "number") {
      if (distanceMethod === undefined || distanceMethod === "srs") {
        query +=
          ` ON ST_DWithin(${leftTable}."${leftTableColumn}", ${rightTable}."${rightTableColumn}", ${distance})`;
      } else if (distanceMethod === "haversine") {
        // Maybe ST_DWithin_Sphere will be available soon?
        query +=
          ` ON ST_Distance_Sphere(${leftTable}."${leftTableColumn}", ${rightTable}."${rightTableColumn}") < ${distance}`;
      } else if (distanceMethod === "spheroid") {
        // Should be using ST_DWithin_Spheroid but doesn't work?
        query +=
          ` ON ST_Distance_Spheroid(${leftTable}."${leftTableColumn}", ${rightTable}."${rightTableColumn}") < ${distance}`;
      } else {
        throw new Error(`Unknown ${distanceMethod}`);
      }
    } else {
      throw new Error("options.distance must be a number");
    }
  } else {
    throw new Error(`Unknown ${method} method`);
  }

  return query;
}
