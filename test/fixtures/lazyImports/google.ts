import { calls, loaded } from "./state.ts";
loaded.push("google");

export function getSheetData(_url: string, options: { skip?: number }) {
  calls.push({ method: "getSheetData", value: options.skip });
  return Promise.resolve([{ value: 1 }, { value: 2 }].slice(options.skip));
}

export function pushToSheet(data: unknown) {
  calls.push({ method: "pushToSheet", value: data });
  return Promise.resolve();
}
