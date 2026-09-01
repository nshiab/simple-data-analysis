import crypto from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";

const cacheDirectory = ".journalism-cache";

/** Returns the cache file for an SDA-processed AI response. */
export function getAIResponseCacheFile(parameters: unknown): string {
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(parameters))
    .digest("hex");
  return `${cacheDirectory}/sda-askAI-${hash}.json`;
}

/** Reads an SDA-processed AI response when it exists. */
export function readAIResponseCache(cacheFile: string): unknown | undefined {
  return existsSync(cacheFile)
    ? JSON.parse(readFileSync(cacheFile, "utf-8"))
    : undefined;
}

/** Removes an SDA-processed AI response after validation rejects it. */
export function removeAIResponseCache(cacheFile: string): void {
  if (existsSync(cacheFile)) {
    rmSync(cacheFile);
  }
}

/** Caches an AI response after SDA transformation and validation. */
export function writeAIResponseCache(
  cacheFile: string,
  response: unknown,
): void {
  if (!existsSync(cacheDirectory)) {
    mkdirSync(cacheDirectory);
  }
  writeFileSync(cacheFile, JSON.stringify(response));
}
