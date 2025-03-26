export default function summarizeQuery(
  table: string,
  types: {
    [key: string]: string;
  },
  outputTable: string,
  values: string[],
  categories: string[],
  summaries: (
    | "count"
    | "countUnique"
    | "countNull"
    | "min"
    | "max"
    | "mean"
    | "median"
    | "sum"
    | "skew"
    | "stdDev"
    | "var"
  )[],
  options: { decimals?: number; noColumnValue?: boolean } = {},
  columns: string[] | undefined,
) {
  if (values.length > 1 && options.noColumnValue) {
    throw new Error(
      "The options `noColumnValue` works only when you aggregate the values from one column. Remove the option `noColumnValue` or specify just one column in the option `values`.",
    );
  }

  const typesOfValues = values.map((d) => types[d]);

  const doubleAndDate = Object.values(typesOfValues).includes("DOUBLE") &&
    Object.values(typesOfValues).filter((d) =>
        [
          "DATE",
          "TIME",
          "TIMESTAMP",
          "TIMESTAMP_MS",
          "TIMESTAMP WITH TIME ZONE",
        ].includes(d)
      ).length >= 1;

  if (doubleAndDate) {
    throw new Error(
      "You are trying to summarize numbers and timestamps/dates/times. You can specify values in the options (just numbers or just timestamps/dates/times) or convert your timestamps/dates/times to the number of ms since 1970-01-01 00:00:00 by passing the option { toMs: true }.",
    );
  }

  const aggregates: { [key: string]: string } = {
    count: "count", // specific implementation
    countUnique: "COUNT(DISTINCT ",
    countNull: "countNull", // Specific implementation
    min: "MIN(",
    max: "MAX(",
    mean: "AVG(",
    median: "MEDIAN(",
    sum: "SUM(",
    skew: "SKEWNESS(",
    stdDev: "STDDEV(",
    var: "VARIANCE(",
  };

  if (summaries.length === 0) {
    summaries = Object.keys(aggregates) as (
      | "count"
      | "countUnique"
      | "countNull"
      | "min"
      | "max"
      | "mean"
      | "median"
      | "sum"
      | "skew"
      | "stdDev"
      | "var"
    )[];
  }

  let query = `CREATE OR REPLACE TABLE ${outputTable} AS`;

  let firstValue = true;
  for (const value of values) {
    if (firstValue) {
      firstValue = false;
    } else {
      query += "\nUNION";
    }
    query += `\nSELECT ${options.noColumnValue ? "" : `'${value}' AS 'value'`}${
      categories.length > 0
        ? `, ${categories.map((d) => `"${d}"`).join(", ")}`
        : ""
    }${options.noColumnValue ? "" : ","}${
      summaries.map((summary, i) => {
        if (
          value === "rowNumberToSummarizeQuerySDA" &&
          aggregates[summary] !== "count"
        ) {
          return `\nNULL as '${columns ? columns[i] : summary}'`;
        } else if (types[value] === "GEOMETRY") {
          return `\nNULL AS '${columns ? columns[i] : summary}'`;
        } else if (
          types[value] === "VARCHAR" &&
          [
            "MIN(",
            "MAX(",
            "AVG(",
            "MEDIAN(",
            "SUM(",
            "SKEWNESS(",
            "STDDEV(",
            "VARIANCE(",
          ].includes(aggregates[summary])
        ) {
          return `\nNULL AS '${columns ? columns[i] : summary}'`;
        } else if (
          [
            "DATE",
            "TIME",
            "TIMESTAMP",
            "TIMESTAMP_MS",
            "TIMESTAMP WITH TIME ZONE",
          ].includes(types[value]) &&
          ["AVG(", "SUM(", "SKEWNESS(", "STDDEV(", "VARIANCE("].includes(
            aggregates[summary],
          )
        ) {
          return `\nNULL AS '${columns ? columns[i] : summary}'`;
        } else if (summary === "count") {
          return `\nCAST(COUNT(*) AS INTEGER) AS '${
            columns ? columns[i] : "count"
          }'`;
        } else if (summary === "countNull") {
          return `\nCAST(COUNT(CASE WHEN "${value}" IS NULL THEN 1 END) AS INTEGER) as '${
            columns ? columns[i] : "countNull"
          }'`;
        } else {
          return typeof options.decimals === "number" &&
              ![
                "VARCHAR",
                "DATE",
                "TIME",
                "TIMESTAMP",
                "TIMESTAMP WITH TIME ZONE",
              ].includes(types[value])
            ? `\nROUND(${
              aggregates[summary]
            }"${value}"), ${options.decimals}) AS '${
              columns ? columns[i] : summary
            }'`
            : `\n${aggregates[summary]}"${value}") AS '${
              columns ? columns[i] : summary
            }'`;
        }
      })
    }\nFROM "${table}"`;
    if (categories.length > 0) {
      query += `\nGROUP BY ${categories.map((d) => `"${d}"`).join(", ")}`;
    }
  }

  if (options.noColumnValue) {
    if (categories.length > 0) {
      query += `\nORDER BY ${categories.map((d) => `"${d}" ASC`).join(", ")}`;
    }
  } else {
    query += `\nORDER BY ${
      ["value", ...categories]
        .map((d) => `"${d}" ASC`)
        .join(", ")
    }`;
  }

  return query;
}
