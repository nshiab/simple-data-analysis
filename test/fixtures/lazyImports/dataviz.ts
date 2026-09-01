import { calls, loaded } from "./state.ts";
loaded.push("dataviz");

export function saveChart(data: unknown, _chart: unknown, path: string) {
  calls.push({ method: "saveChart", value: data, path });
  return Promise.resolve();
}

export function getDataDW(
  chartId: string,
  options: { parse?: boolean; apiKey?: string } = {},
) {
  calls.push({
    method: "getDataDW",
    value: { chartId, options },
  });
  return Promise.resolve(
    options.parse ? [{ value: 1 }] : JSON.stringify({
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: { value: 1 },
        geometry: { type: "Point", coordinates: [-73, 45] },
      }],
    }),
  );
}

export function updateDataDW(
  chartId: string,
  data: unknown,
  options: { apiKey?: string } = {},
) {
  calls.push({ method: "updateDataDW", value: { chartId, data, options } });
  return Promise.resolve();
}

export function updateNotesDW(
  chartId: string,
  note: string,
  options: { apiKey?: string } = {},
) {
  calls.push({ method: "updateNotesDW", value: { chartId, note, options } });
  return Promise.resolve();
}

export function publishChartDW(
  chartId: string,
  options: { apiKey?: string } = {},
) {
  calls.push({ method: "publishChartDW", value: { chartId, options } });
  return Promise.resolve();
}
export function logBarChart() {}
export function logDotChart() {}
export function logLineChart() {}
