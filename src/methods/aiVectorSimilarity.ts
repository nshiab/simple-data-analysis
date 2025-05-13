import { getEmbedding } from "@nshiab/journalism";
import type { SimpleTable } from "../index.ts";
import queryDB from "../helpers/queryDB.ts";
import mergeOptions from "../helpers/mergeOptions.ts";

export default async function aiVectorSimilarity(
  simpleTable: SimpleTable,
  text: string,
  column: string,
  nbResults: number,
  options: {
    createIndex?: boolean;
    outputTable?: string;
    cache?: boolean;
    model?: string;
    apiKey?: string;
    vertex?: boolean;
    project?: string;
    location?: string;
    ollama?: boolean;
    verbose?: boolean;
  } = {},
) {
  if (options.createIndex) {
    options.verbose &&
      console.log(
        `\nCreating index on "${column}" column...`,
      );
    if (simpleTable.indexes.includes("my_hnsw_cosine_index")) {
      options.verbose && console.log("Index already exists.");
    } else {
      await simpleTable.sdb.customQuery(
        `INSTALL vss; LOAD vss;
    CREATE INDEX my_hnsw_cosine_index ON "${simpleTable.name}" USING HNSW ("${column}") WITH (metric = 'cosine');`,
      );
      simpleTable.indexes.push("my_hnsw_cosine_index");
    }
  }

  const textEmbedding = await getEmbedding(text, options);

  await queryDB(
    simpleTable,
    `CREATE OR REPLACE TABLE "${
      options.outputTable ?? simpleTable.name
    }" AS SELECT * FROM "${simpleTable.name}" ORDER BY array_cosine_distance("${column}", ${
      JSON.stringify(textEmbedding)
    }::FLOAT[${textEmbedding.length}]) LIMIT ${nbResults};`,
    mergeOptions(simpleTable, {
      table: simpleTable.name,
      method: "aiVectorSimilarity()",
      parameters: {
        text,
        column,
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
