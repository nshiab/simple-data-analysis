import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { bucketObjects, calls, loaded } from "./state.ts";
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

export function toBucket(
  file: string,
  destination: string,
  options: unknown,
) {
  bucketObjects.set(destination, readFileSync(file));
  calls.push({
    method: "toBucket",
    value: { destination, options, fileExists: existsSync(file) },
    path: file,
  });
  const bucket = (options as { bucket?: string }).bucket ?? "fixture-bucket";
  return Promise.resolve(`gs://${bucket}/${destination}`);
}

export function downloadFromBucket(
  source: string,
  destination: string,
  options: unknown,
) {
  const data = bucketObjects.get(source);
  if (data === undefined) {
    throw new Error(`Missing fixture bucket object ${source}`);
  }
  writeFileSync(destination, data);
  calls.push({
    method: "downloadFromBucket",
    value: { source, options, fileExists: existsSync(destination) },
    path: destination,
  });
  return Promise.resolve();
}
