type PublishDatawrapperOptions = {
  apiKeyEnvVar?: string;
  note?: string;
  republish?: boolean;
};

export default async function publishDatawrapper(
  chartId: string,
  data: string,
  options: PublishDatawrapperOptions = {},
): Promise<void> {
  const { updateDataDW, updateNotesDW, publishChartDW } = await import(
    "@nshiab/journalism-dataviz"
  );
  const apiKey = { apiKey: options.apiKeyEnvVar };
  await updateDataDW(chartId, data, apiKey);
  if (typeof options.note === "string") {
    await updateNotesDW(chartId, options.note, apiKey);
  }
  if (options.republish === true) {
    await publishChartDW(chartId, apiKey);
  }
}
