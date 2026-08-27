import { getDataDW } from "@nshiab/journalism-dataviz";
import { queueAsyncBarrier } from "@nshiab/simple-data-analysis-core/helpers";
import type SimpleTable from "../class/SimpleTable.ts";
import loadGeoDataFromScratchFile from "../helpers/loadGeoDataFromScratchFile.ts";

type LoadGeoDWOptions = {
  apiKey?: string;
};

export default function loadGeoDW(
  table: SimpleTable,
  chartId: string,
  options: LoadGeoDWOptions = {},
): SimpleTable {
  options = { ...options };
  queueAsyncBarrier(table, {
    method: "loadGeoDW()",
    parameters: { chartId, options },
    execute: async () => {
      const jsonString = await getDataDW(chartId, {
        apiKey: options.apiKey,
      }) as string;
      await loadGeoDataFromScratchFile(table, jsonString);
    },
  });
  return table;
}
