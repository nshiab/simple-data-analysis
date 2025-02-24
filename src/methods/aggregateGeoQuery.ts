import stringToArray from "../helpers/stringToArray.ts";

export default function aggregateGeoQuery(
  table: string,
  column: string,
  method: "union" | "intersection",
  options: {
    categories?: string | string[];
    outputTable?: string | boolean;
  } = {},
) {
  const categoriesOptions = options.categories ?? [];
  const categories = stringToArray(categoriesOptions);

  let query = `CREATE OR REPLACE TABLE "${options.outputTable ?? table}" AS
    SELECT${
    categories.length > 0 ? ` ${categories.map((d) => `${d}`).join(", ")},` : ""
  }`;

  if (method === "union") {
    query += ` ST_Union_Agg(${column}) AS ${column}`;
  } else if (method === "intersection") {
    query += ` ST_Intersection_Agg(${column}) AS ${column}`;
  } else {
    throw new Error(`Unkown method ${method}`);
  }

  query += `\nFROM "${table}"`;

  if (categories.length > 0) {
    query += `\nGROUP BY ${categories.map((d) => `${d}`).join(", ")}`;
    query += `\nORDER BY ${categories.map((d) => `${d} ASC`).join(", ")}`;
  }

  return query;
}
