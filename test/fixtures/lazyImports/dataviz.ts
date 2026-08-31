import { calls, loaded } from "./state.ts";
loaded.push("dataviz");

export function saveChart(data: unknown, _chart: unknown, path: string) {
  calls.push({ method: "saveChart", value: data, path });
  return Promise.resolve();
}

export function getDataDW() {
  return Promise.resolve([{ value: 1 }]);
}

export function updateDataDW(_id: string, data: unknown) {
  calls.push({ method: "updateDataDW", value: data });
  return Promise.resolve();
}

export function updateNotesDW() {}
export function publishChartDW() {}
export function logBarChart() {}
export function logDotChart() {}
export function logLineChart() {}
