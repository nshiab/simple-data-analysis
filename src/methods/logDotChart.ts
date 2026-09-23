import type SimpleTable from "../class/SimpleTable.ts";

export default async function logDotChart(
  table: SimpleTable,
  x: Parameters<SimpleTable["logDotChart"]>[0],
  y: Parameters<SimpleTable["logDotChart"]>[1],
  options: Parameters<SimpleTable["logDotChart"]>[2] = {},
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
  const { logDotChart } = await import("@nshiab/journalism-dataviz");
  logDotChart(data, x, y, options);
}
