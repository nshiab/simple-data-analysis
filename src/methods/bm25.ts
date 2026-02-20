import { camelCase } from "@nshiab/journalism-format";
import type SimpleTable from "../class/SimpleTable.ts";
import queryDB from "../helpers/queryDB.ts";
import mergeOptions from "../helpers/mergeOptions.ts";

export default async function bm25(
  simpleTable: SimpleTable,
  text: string,
  columnId: string,
  columnText: string,
  nbResults: number,
  options: {
    stemmer?:
      | "arabic"
      | "basque"
      | "catalan"
      | "danish"
      | "dutch"
      | "english"
      | "finnish"
      | "french"
      | "german"
      | "greek"
      | "hindi"
      | "hungarian"
      | "indonesian"
      | "irish"
      | "italian"
      | "lithuanian"
      | "nepali"
      | "norwegian"
      | "porter"
      | "portuguese"
      | "romanian"
      | "russian"
      | "serbian"
      | "spanish"
      | "swedish"
      | "tamil"
      | "turkish"
      | "none";
    k?: number;
    b?: number;
    outputTable?: string;
    verbose?: boolean;
  } = {},
) {
  // This uses the fts extension
  // https://duckdb.org/docs/stable/core_extensions/full_text_search

  options.verbose &&
    console.log(
      `\nCreating FTS index on "${columnText}" column...`,
    );

  if (
    simpleTable.indexes.includes(
      `fts_index${camelCase(simpleTable.name)}`,
    )
  ) {
    options.verbose && console.log("FTS Index already exists.");
  } else {
    await simpleTable.sdb.customQuery(
      `PRAGMA create_fts_index("${simpleTable.name}", "${columnId}", "${columnText}"${
        options.stemmer ? `, stemmer = '${options.stemmer}'` : ""
      });`,
    );
    simpleTable.indexes.push(
      `fts_index${camelCase(simpleTable.name)}`,
    );
  }

  await queryDB(
    simpleTable,
    `CREATE OR REPLACE TABLE "${
      options.outputTable ?? simpleTable.name
    }" AS SELECT * EXCLUDE(score) FROM (SELECT *, fts_main_${
      camelCase(simpleTable.name)
    }.match_bm25(${columnId}, '${text}'${
      typeof options.k === "number" ? `, k := ${options.k}` : ""
    }${
      typeof options.b === "number" ? `, b := ${options.b}` : ""
    }) AS score FROM "${simpleTable.name}") sq WHERE score ORDER BY score DESC LIMIT ${nbResults};`,
    mergeOptions(simpleTable, {
      table: simpleTable.name,
      method: "bm25",
      parameters: {
        text,
        columnId,
        columnText,
        nbResults,
        table: options.outputTable ?? simpleTable.name,
      },
    }),
  );

  if (typeof options.outputTable === "string") {
    return simpleTable.sdb.newTable(
      options.outputTable,
      structuredClone(simpleTable.projections),
    );
  } else {
    return simpleTable;
  }
}
