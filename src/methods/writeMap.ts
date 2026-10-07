import type SimpleTable from "../class/SimpleTable.ts";
import type { Data } from "@observablehq/plot";
import { createDirectory } from "@nshiab/simple-data-analysis-core/helpers";

export default async function writeMap(
  table: SimpleTable,
  map: Parameters<SimpleTable["writeMap"]>[0],
  path: Parameters<SimpleTable["writeMap"]>[1],
  options: Parameters<SimpleTable["writeMap"]>[2] = {},
): Promise<void> {
  createDirectory(path);
  options.rewind = options.rewind ?? true;
  const geoData = await table.getGeoData({
    column: options.column,
    rewind: options.rewind,
  });
  const { saveChart } = await import("@nshiab/journalism-dataviz");
  await saveChart(
    geoData as unknown as Data,
    map as unknown as (
      data: Data,
    ) => SVGSVGElement | HTMLElement | Promise<SVGSVGElement | HTMLElement>,
    path,
    options,
  );
}
