import publishDatawrapper from "../helpers/publishDatawrapper.ts";
import type SimpleTable from "../class/SimpleTable.ts";

type ToGeoDatawrapperOptions = {
  apiKeyEnvVar?: string;
  column?: string;
  note?: string;
  republish?: boolean;
};

export default async function toGeoDatawrapper(
  table: SimpleTable,
  chartId: string,
  options: ToGeoDatawrapperOptions = {},
): Promise<void> {
  const geoData = await table.getGeoData(options.column);
  await publishDatawrapper(chartId, JSON.stringify(geoData), options);
}
