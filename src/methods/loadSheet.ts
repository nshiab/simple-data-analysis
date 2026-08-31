import { queueAsyncBarrier } from "@nshiab/simple-data-analysis-core/helpers";
import type SimpleTable from "../class/SimpleTable.ts";

type LoadSheetOptions = {
  skip?: number;
  apiEmail?: string;
  apiKey?: string;
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
      table.loadArray(await getSheetData(sheetUrl, options));
    },
  });
  return table;
}
