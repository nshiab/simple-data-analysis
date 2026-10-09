type PublishDatawrapperOptions = {
  apiKeyEnvVar?: string;
  title?: string;
  description?: string;
  note?: string;
  republish?: boolean;
};

export default async function publishDatawrapper(
  chartId: string,
  data: string,
  options: PublishDatawrapperOptions = {},
): Promise<void> {
  const { updateDataDW, updateInfoDW, publishChartDW } = await import(
    "@nshiab/journalism-dataviz"
  );
  const apiKey = { apiKey: options.apiKeyEnvVar };
  await updateDataDW(chartId, data, apiKey);
  if (
    typeof options.title === "string" ||
    typeof options.description === "string" ||
    typeof options.note === "string"
  ) {
    await updateInfoDW(chartId, {
      title: options.title,
      description: options.description,
      note: options.note,
    }, apiKey);
  }
  if (options.republish === true) {
    await publishChartDW(chartId, apiKey);
  }
}
