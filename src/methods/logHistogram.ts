import { logBarChart } from "@nshiab/journalism";
import type SimpleTable from "../class/SimpleTable.ts";

export default async function logHistogram(
  simpleTable: SimpleTable,
  values: string,
  options: {
    bins?: number;
    formatLabels?: (a: number, b: number) => string;
    compact?: boolean;
    width?: number;
  } = {},
) {
  const bins = options.bins ?? 10;
  const formatLabels = options.formatLabels ?? ((a, b) => `[${a} | ${b})`);

  const data = await simpleTable.sdb.customQuery(
    `
WITH params AS (
  SELECT 
    ${bins} AS N_BINS,
    min("${values}") AS min_distance,
    max("${values}") AS max_distance,
    (max("${values}") - min("${values}")) / ${bins} AS bin_size
  FROM "${simpleTable.name}"
),
histogram AS (
  SELECT 
    floor(("${values}" - min_distance) / bin_size) AS bin_number,
    min_distance + floor(("${values}" - min_distance) / bin_size) * bin_size AS bin_start,
    min_distance + (floor(("${values}" - min_distance) / bin_size) + 1) * bin_size AS bin_end,
    CAST(count(*) AS INTEGER) AS frequency
  FROM "${simpleTable.name}", params
  WHERE "${values}" >= min_distance AND "${values}" < max_distance
  GROUP BY 1, 2, 3
)
SELECT 
  bin_start,
  bin_end,
  frequency
FROM histogram
ORDER BY bin_start;`,
    { returnDataFrom: "query" },
  );

  logBarChart(
    (data as { [key: string]: unknown }[]).map((d) => ({
      binRange: formatLabels(
        parseFloat((d.bin_start as number).toFixed(10)),
        parseFloat((d.bin_end as number).toFixed(10)),
      ),
      frequency: d.frequency,
    })),
    "binRange",
    "frequency",
    {
      title: `Distribution of "${values}"`,
      totalLabel: "Number of data points",
      compact: options.compact,
      width: options.width,
    },
  );
}
