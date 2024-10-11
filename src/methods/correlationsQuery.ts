import stringToArray from "../helpers/stringToArray.ts";

export default function correlationsQuery(
  table: string,
  outputTable: string,
  combinations: [string, string][],
  options: {
    categories?: string | string[];
    decimals?: number;
  },
) {
  const categories = options.categories
    ? stringToArray(options.categories)
    : [];

  const groupBy = categories.length === 0
    ? ""
    : ` GROUP BY ${categories.map((d) => `${d}`).join(",")}`;

  let query = `CREATE OR REPLACE TABLE ${outputTable} AS`;

  let firstValue = true;
  for (const comb of combinations) {
    if (firstValue) {
      firstValue = false;
    } else {
      query += "\nUNION";
    }
    const tempQuery = typeof options.decimals === "number"
      ? `ROUND(corr(${comb[0]}, ${comb[1]}), ${options.decimals})`
      : `corr(${comb[0]}, ${comb[1]})`;
    query += `\nSELECT ${
      categories.length > 0
        ? `${categories.map((d) => `${d}`).join(",")}, `
        : ""
    }'${comb[0]}' AS x, '${
      comb[1]
    }' AS y, ${tempQuery}  as corr FROM ${table}${groupBy}`;
  }

  return query;
}
