import { queueAsyncBarrier } from "@nshiab/simple-data-analysis-core/helpers";
import type SimpleTable from "../class/SimpleTable.ts";

type LoadSheetOptions = {
  skip?: number;
  apiEmailEnvVar?: string;
  apiKeyEnvVar?: string;
};

export default function loadSheet(
  table: SimpleTable,
  sheetUrl: string,
  options: LoadSheetOptions = {},
): SimpleTable {
  options = { ...options };
  queueAsyncBarrier(table, {
    method: "loadSheet()",
    parameters: { sheetUrl, options },
    execute: async () => {
      const { getSheetData } = await import("@nshiab/journalism-google");
      const { apiEmailEnvVar, apiKeyEnvVar, ...sheetOptions } = options;
      table.loadArray(
        await getSheetData(sheetUrl, {
          ...sheetOptions,
          apiEmail: apiEmailEnvVar,
          apiKey: apiKeyEnvVar,
        }),
      );
    },
  });
  return table;
}
