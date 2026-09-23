import type SimpleTable from "../class/SimpleTable.ts";

export default async function logBarChart(
  table: SimpleTable,
  labels: Parameters<SimpleTable["logBarChart"]>[0],
  values: Parameters<SimpleTable["logBarChart"]>[1],
  options: Parameters<SimpleTable["logBarChart"]>[2] = {},
): Promise<void> {
  const data = await table.getData({
    columns: Array.from(new Set([labels, values])),
  });
  const { logBarChart } = await import("@nshiab/journalism-dataviz");
  logBarChart(data, labels, values, options);
}
