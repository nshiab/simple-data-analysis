import publishDatawrapper from "../helpers/publishDatawrapper.ts";
import type SimpleTable from "../class/SimpleTable.ts";

type ToDatawrapperOptions = {
  apiKeyEnvVar?: string;
  note?: string;
  republish?: boolean;
};

export default async function toDatawrapper(
  table: SimpleTable,
  chartId: string,
  options: ToDatawrapperOptions = {},
): Promise<void> {
  const data = await table.getDataAsCSV();
  await publishDatawrapper(chartId, data, options);
}
