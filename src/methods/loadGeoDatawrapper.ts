import { queueAsyncBarrier } from "@nshiab/simple-data-analysis-core/helpers";
import type SimpleTable from "../class/SimpleTable.ts";
import loadGeoDataFromScratchFile from "../helpers/loadGeoDataFromScratchFile.ts";

type LoadGeoDatawrapperOptions = {
  apiKeyEnvVar?: string;
};

export default function loadGeoDatawrapper(
  table: SimpleTable,
  chartId: string,
  options: LoadGeoDatawrapperOptions = {},
): SimpleTable {
  options = { ...options };
  queueAsyncBarrier(table, {
    method: "loadGeoDatawrapper()",
    parameters: { chartId, options },
    execute: async () => {
      const { getDataDW } = await import("@nshiab/journalism-dataviz");
      const jsonString = await getDataDW(chartId, {
        apiKey: options.apiKeyEnvVar,
      }) as string;
      await loadGeoDataFromScratchFile(table, jsonString);
    },
  });
  return table;
}
