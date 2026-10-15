import crypto from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const cacheDirectory = ".journalism-cache";

/** Returns the cache file for a model response cached by SDA. */
export function getAIResponseCacheFile(parameters: unknown): string {
  const hash = crypto.createHash("sha256").update(JSON.stringify(parameters)).digest("hex");
  return `${cacheDirectory}/sda-askAI-v2-${hash}.json`;
}

/** Reads a model response cached by SDA when it exists. */
export function readAIResponseCache(cacheFile: string): unknown {
  return existsSync(cacheFile) ? JSON.parse(readFileSync(cacheFile, "utf-8")) : undefined;
}

/** Removes a model response cached by SDA after validation rejects it. */
export function removeAIResponseCache(cacheFile: string): void {
  if (existsSync(cacheFile)) {
    rmSync(cacheFile);
  }
}

/** Stores the original model response only after all processing and validation succeed. */
export function writeAIResponseCache(cacheFile: string, response: unknown): void {
  if (!existsSync(cacheDirectory)) {
    mkdirSync(cacheDirectory);
  }
  writeFileSync(cacheFile, JSON.stringify(response));
}
