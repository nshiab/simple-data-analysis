import stringToArray from "../helpers/stringToArray.ts";

export default function linearRegressionQuery(
  table: string,
  outputTable: string,
  permutations: [string, string][],
  options: {
    categories?: string | string[];
    decimals?: number;
  },
) {
  let query = `CREATE OR REPLACE TABLE ${outputTable} AS`;

  const categories = options.categories
    ? stringToArray(options.categories)
    : [];

  const groupBy = categories.length === 0
    ? ""
    : ` GROUP BY ${categories.map((d) => `${d}`).join(",")}`;

  let firstValue = true;
  for (const perm of permutations) {
    if (firstValue) {
      firstValue = false;
    } else {
      query += "\nUNION";
    }

    let tempSlop;
    let tempIntercept;
    let tempR2;
    if (typeof options.decimals === "number") {
      tempSlop = `ROUND(REGR_SLOPE(${perm[1]}, ${
        perm[0]
      }), ${options.decimals})`;
      tempIntercept = `ROUND(REGR_INTERCEPT(${perm[1]}, ${
        perm[0]
      }), ${options.decimals})`;
      tempR2 = `ROUND(REGR_R2(${perm[1]}, ${perm[0]}), ${options.decimals})`;
    } else {
      tempSlop = `REGR_SLOPE(${perm[1]}, ${perm[0]})`;
      tempIntercept = `REGR_INTERCEPT(${perm[1]}, ${perm[0]})`;
      tempR2 = `REGR_R2(${perm[1]}, ${perm[0]})`;
    }

    query += `\nSELECT ${
      categories.length > 0
        ? `${categories.map((d) => `${d}`).join(",")}, `
        : ""
    }'${perm[0]}' AS x, '${
      perm[1]
    }' AS y, ${tempSlop} AS slope, ${tempIntercept} AS yIntercept, ${tempR2} as r2
        FROM "${table}"${groupBy}`;
  }

  return query;
}
