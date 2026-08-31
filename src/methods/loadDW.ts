import { queueAsyncBarrier } from "@nshiab/simple-data-analysis-core/helpers";
import type SimpleTable from "../class/SimpleTable.ts";

type LoadDWOptions = {
  apiKey?: string;
};

export default function loadDW(
  table: SimpleTable,
  chartId: string,
  options: LoadDWOptions = {},
): SimpleTable {
  options = { ...options };
  queueAsyncBarrier(table, {
    method: "loadDW()",
    parameters: { chartId, options },
    execute: async () => {
      const { getDataDW } = await import("@nshiab/journalism-dataviz");
      const data = await getDataDW(chartId, {
        parse: true,
        apiKey: options.apiKey,
      });
      table.loadArray(data as Record<string, string>[]);
    },
  });
  return table;
}
