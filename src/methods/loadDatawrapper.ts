import { queueAsyncBarrier } from "@nshiab/simple-data-analysis-core/helpers";
import type SimpleTable from "../class/SimpleTable.ts";

type LoadDatawrapperOptions = {
  apiKeyEnvVar?: string;
};

export default function loadDatawrapper(
  table: SimpleTable,
  chartId: string,
  options: LoadDatawrapperOptions = {},
): SimpleTable {
  options = { ...options };
  queueAsyncBarrier(table, {
    method: "loadDatawrapper()",
    parameters: { chartId, options },
    execute: async () => {
      const { getDataDW } = await import("@nshiab/journalism-dataviz");
      const data = await getDataDW(chartId, {
        parse: true,
        apiKey: options.apiKeyEnvVar,
      });
      table.loadArray(data as Record<string, string>[]);
    },
  });
  return table;
}
