import { calls, loaded } from "./state.ts";
loaded.push("google");

export function getSheetData(_url: string, options: {
  skip?: number;
  apiEmail?: string;
  apiKey?: string;
}) {
  calls.push({ method: "getSheetData", value: options });
  return Promise.resolve([{ value: 1 }, { value: 2 }].slice(options.skip));
}

export function pushToSheet(data: unknown) {
  calls.push({ method: "pushToSheet", value: data });
  return Promise.resolve();
}
