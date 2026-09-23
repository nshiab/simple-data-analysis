import type SimpleTable from "../class/SimpleTable.ts";
import type { Data } from "@observablehq/plot";
import { createDirectory } from "@nshiab/simple-data-analysis-core/helpers";

export default async function writeChart(
  table: SimpleTable,
  chart: Parameters<SimpleTable["writeChart"]>[0],
  path: Parameters<SimpleTable["writeChart"]>[1],
  options: Parameters<SimpleTable["writeChart"]>[2] = {},
): Promise<void> {
  createDirectory(path);
  const data = await table.getData();
  const { saveChart } = await import("@nshiab/journalism-dataviz");
  await saveChart(
    data,
    chart as (data: Data) => SVGSVGElement | HTMLElement,
    path,
    options,
  );
}
