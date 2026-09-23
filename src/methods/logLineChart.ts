import type SimpleTable from "../class/SimpleTable.ts";

export default async function logLineChart(
  table: SimpleTable,
  x: Parameters<SimpleTable["logLineChart"]>[0],
  y: Parameters<SimpleTable["logLineChart"]>[1],
  options: Parameters<SimpleTable["logLineChart"]>[2] = {},
): Promise<void> {
  const data = await table.getData({
    columns: Array.from(
      new Set([
        x,
        y,
        ...(typeof options.smallMultiples === "string"
          ? [options.smallMultiples]
          : []),
      ]),
    ),
  });
  const { logLineChart } = await import("@nshiab/journalism-dataviz");
  logLineChart(data, x, y, options);
}
