import { getEmbedding } from "@nshiab/journalism-ai";
import type { SimpleTable } from "../index.ts";
import queryDB from "../helpers/queryDB.ts";
import mergeOptions from "../helpers/mergeOptions.ts";
import createVssIndex from "./createVssIndex.ts";

export default async function aiVectorSimilarity(
  simpleTable: SimpleTable,
  text: string,
  column: string,
  nbResults: number,
  options: {
    cache?: boolean;
    createIndex?: boolean;
    overwriteIndex?: boolean;
    outputTable?: string;
    verbose?: boolean;
    efConstruction?: number;
    efSearch?: number;
    M?: number;
    minSimilarity?: number;
    similarityColumn?: string;
  } = {},
) {
  const textEmbedding = await getEmbedding(text, options);

  const types = await simpleTable.getTypes();
  if (types[column] !== `FLOAT[${textEmbedding.length}]`) {
    await simpleTable.sdb.customQuery(
      `ALTER TABLE "${simpleTable.name}" ADD COLUMN "${column}_fixed_floatType" FLOAT[${textEmbedding.length}];
      UPDATE "${simpleTable.name}" SET "${column}_fixed_floatType" = "${column}"::FLOAT[${textEmbedding.length}];
      ALTER TABLE "${simpleTable.name}" DROP COLUMN "${column}";
      ALTER TABLE "${simpleTable.name}" RENAME COLUMN "${column}_fixed_floatType" TO "${column}";`,
    );
  }

  if (options.createIndex) {
    await createVssIndex(simpleTable, column, {
      overwrite: options.overwriteIndex,
      verbose: options.verbose,
      efConstruction: options.efConstruction,
      efSearch: options.efSearch,
      M: options.M,
    });
  }

  const targetVector = `${
    JSON.stringify(textEmbedding)
  }::FLOAT[${textEmbedding.length}]`;
  const columnVector = `"${column}"::FLOAT[${textEmbedding.length}]`;
  const distanceFunction =
    `array_cosine_distance(${columnVector}, ${targetVector})`;

  const thresholdClause = options.minSimilarity !== undefined
    ? `WHERE ${distanceFunction} <= ${1 - options.minSimilarity}`
    : "";

  // Conditionally build the SELECT statement to include the similarity math
  const selectClause = options.similarityColumn
    ? `*, (1 - ${distanceFunction}) AS "${options.similarityColumn}"`
    : `*`;

  await queryDB(
    simpleTable,
    `INSTALL vss; LOAD vss;
    CREATE OR REPLACE TABLE "${options.outputTable ?? simpleTable.name}" AS 
    SELECT ${selectClause} FROM "${simpleTable.name}" 
    ${thresholdClause}
    ORDER BY ${distanceFunction} ASC
    LIMIT ${nbResults};`,
    mergeOptions(simpleTable, {
      table: simpleTable.name,
      method: "aiVectorSimilarity()",
      parameters: {
        text,
        column,
        nbResults,
        minSimilarity: options.minSimilarity,
        similarityColumn: options.similarityColumn, // Include in merged options log
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
