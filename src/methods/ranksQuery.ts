import stringToArray from "../helpers/stringToArray.ts";

export default function rankQuery(
  table: string,
  values: string,
  newColumn: string,
  options: {
    order?: "asc" | "desc";
    categories?: string | string[];
    noGaps?: boolean;
  } = {},
) {
  const categories = options.categories
    ? stringToArray(options.categories)
    : [];

  const partition = categories.length === 0
    ? ""
    : `PARTITION BY ${categories.map((d) => `${d}`).join(",")} `;

  const query = `CREATE OR REPLACE TABLE "${table}" AS SELECT *, ${
    options.noGaps ? "dense_rank()" : "rank()"
  } OVER (${partition}ORDER BY ${values} ${
    typeof options.order === "string" ? options.order.toUpperCase() : ""
  }) AS ${newColumn},
    FROM "${table}"`;

  return query;
}
