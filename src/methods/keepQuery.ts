import parseValue from "../helpers/parseValue.ts";

export default function keepQuery(
  table: string,
  columnsAndValues: {
    [key: string]:
      | (number | string | Date | boolean | null)[]
      | (number | string | Date | boolean | null);
  },
) {
  let query =
    `CREATE OR REPLACE TABLE "${table}" AS SELECT * FROM "${table}" WHERE\n`;
  const columns = Object.keys(columnsAndValues);

  const conditions = [];
  for (const column of columns) {
    let values = columnsAndValues[column];
    if (!Array.isArray(values)) {
      values = [values];
    }

    conditions.push(
      `"${column}" IN (${values.map((d) => parseValue(d)).join(", ")})`,
    );
  }

  query += conditions.join("\nAND ");

  return query;
}
