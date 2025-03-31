import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import stringToArray from "../helpers/stringToArray.ts";
import summarizeQuery from "./summarizeQuery.ts";
import type SimpleTable from "../class/SimpleTable.ts";

export default async function summarize(
  SimpleTable: SimpleTable,
  options: {
    outputTable?: string | boolean;
    values?: string | string[];
    categories?: string | string[];
    summaries?:
      | (
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
      )
      | (
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
      )[]
      | {
        [key: string]:
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
          | "var";
      };
    decimals?: number;
    toMs?: boolean;
    noColumnValue?: boolean;
  } = {},
) {
  const outputTable = typeof options.outputTable === "string"
    ? options.outputTable
    : SimpleTable.name;

  options.values = options.values ? stringToArray(options.values) : [];
  if (options.values.length === 0) {
    await SimpleTable.addRowNumber("rowNumberToSummarizeQuerySDA");
    options.values = ["rowNumberToSummarizeQuerySDA"];
  }
  options.categories = options.categories
    ? stringToArray(options.categories)
    : [];
  let columns: string[] | undefined;
  if (options.summaries === undefined) {
    if (
      options.values.length === 1 &&
      options.values[0] === "rowNumberToSummarizeQuerySDA"
    ) {
      options.summaries = ["count"];
    } else {
      options.summaries = [];
    }
  } else if (typeof options.summaries === "string") {
    options.summaries = [options.summaries];
  } else if (
    !Array.isArray(options.summaries) && typeof options.summaries === "object"
  ) {
    const entries = Object.entries(options.summaries);
    columns = entries.map((d) => d[0]);
    options.summaries = entries.map((d) => d[1]);
  }

  const types = await SimpleTable.getTypes();
  if (options.toMs) {
    const toMsObj: {
      [key: string]: "bigint";
    } = {};
    for (const key of Object.keys(types)) {
      if (types[key].includes("TIME") || types[key].includes("DATE")) {
        toMsObj[key] = "bigint";
        types[key] = "bigint";
      }
    }
    await SimpleTable.convert(toMsObj);
  }

  options.values = options.values.filter(
    (d) => !options.categories?.includes(d),
  );

  await queryDB(
    SimpleTable,
    summarizeQuery(
      SimpleTable.name,
      types,
      outputTable,
      options.values,
      options.categories,
      options.summaries,
      options,
      columns,
    ),
    mergeOptions(SimpleTable, {
      table: outputTable,
      method: "summarize()",
      parameters: {
        options,
      },
    }),
  );

  if (options.values.includes("rowNumberToSummarizeQuerySDA")) {
    if (await SimpleTable.hasColumn("rowNumberToSummarizeQuerySDA")) {
      await SimpleTable.removeColumns("rowNumberToSummarizeQuerySDA");
    }
    SimpleTable.sdb.customQuery(`UPDATE ${outputTable} SET "value" = 
                CASE
                    WHEN "value" = 'rowNumberToSummarizeQuerySDA' THEN 'rows'
                    ELSE "value"
                END;`);
  }
}
