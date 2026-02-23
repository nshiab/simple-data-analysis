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
    });
  }

  await queryDB(
    simpleTable,
    `INSTALL vss; LOAD vss;
    CREATE OR REPLACE TABLE "${
      options.outputTable ?? simpleTable.name
    }" AS SELECT * FROM "${simpleTable.name}" ORDER BY array_cosine_distance("${column}"::FLOAT[${textEmbedding.length}], ${
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
