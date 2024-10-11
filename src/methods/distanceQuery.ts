export default function distanceQuery(
  table: string,
  column1: string,
  column2: string,
  newColumn: string,
  options: {
    unit?: "m" | "km";
    method?: "srs" | "spheroid" | "haversine";
    decimals?: number;
  } = {},
) {
  options.method = options.method ?? "srs";

  if (options.method === "srs" && typeof options.unit === "string") {
    throw new Error(
      "Using the SRS unit. You can't specify options.unit unless you set options.method to 'spheroid' or 'haversine'.",
    );
  } else if (["spheroid", "haversine"].includes(options.method)) {
    options.unit = options.unit ?? "m";
    if (!["m", "km"].includes(options.unit)) {
      throw new Error(
        `Unknown unit ${options.unit}. Choose between 'm' and 'km'.`,
      );
    }
  }

  let query =
    `ALTER TABLE ${table} ADD ${newColumn} DOUBLE; UPDATE ${table} SET ${newColumn} = `;

  if (options.method === "srs") {
    if (typeof options.decimals === "number") {
      query +=
        `ROUND(ST_Distance(${column1}, ${column2}), ${options.decimals})`;
    } else {
      query += `ST_Distance(${column1}, ${column2})`;
    }
  } else if (options.method === "haversine") {
    if (typeof options.decimals === "number") {
      query += `ROUND(ST_Distance_Sphere(${column1}, ${column2}) ${
        options.unit === "km" ? "/ 1000" : ""
      }, ${options.decimals});`;
    } else {
      query += `ST_Distance_Sphere(${column1}, ${column2}) ${
        options.unit === "km" ? "/ 1000" : ""
      };`;
    }
  } else if (options.method === "spheroid") {
    if (typeof options.decimals === "number") {
      query += `ROUND(ST_Distance_Spheroid(${column1}, ${column2}) ${
        options.unit === "km" ? "/ 1000" : ""
      }, ${options.decimals});`;
    } else {
      query += `ST_Distance_Spheroid(${column1}, ${column2}) ${
        options.unit === "km" ? "/ 1000" : ""
      };`;
    }
  } else {
    throw new Error(
      `Uknown method ${options.method}. Choose between 'srs', 'haversine' and 'spheroid'.`,
    );
  }

  return query;
}
