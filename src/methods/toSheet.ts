import type SimpleTable from "../class/SimpleTable.ts";

export default async function toSheet(
  table: SimpleTable,
  sheetUrl: Parameters<SimpleTable["toSheet"]>[0],
  options: Parameters<SimpleTable["toSheet"]>[1] = {},
): Promise<void> {
  const data = await table.getData() as Parameters<
    typeof import("@nshiab/journalism-google").pushToSheet
  >[0];
  const { pushToSheet } = await import("@nshiab/journalism-google");
  await pushToSheet(data, sheetUrl, options);
}
