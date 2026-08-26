import { getSheetData } from "@nshiab/journalism-google";
import { queueOp } from "@nshiab/simple-data-analysis-core/helpers";
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
  queueOp(table, {
    kind: "asyncBarrier",
    method: "loadSheet()",
    parameters: { sheetUrl, options },
    execute: async () => {
      table.loadArray(await getSheetData(sheetUrl, options));
    },
  });
  return table;
}
