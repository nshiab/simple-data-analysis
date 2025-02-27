import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import type SimpleDB from "../class/SimpleDB.ts";

export default function cleanCache(sdb: SimpleDB) {
  if (sdb.cacheSourcesUsed.length > 0) {
    const cacheSources = JSON.parse(
      readFileSync(".sda-cache/sources.json", "utf-8"),
    );
    for (const cacheId of Object.keys(cacheSources)) {
      if (!sdb.cacheSourcesUsed.includes(cacheId)) {
        if (cacheSources[cacheId].file !== null) {
          sdb.debug &&
            console.log(
              `Removing unused file from cache: ${cacheSources[cacheId].file}`,
            );
          unlinkSync(cacheSources[cacheId].file);
        }
        delete cacheSources[cacheId];
      }
    }
    writeFileSync(".sda-cache/sources.json", JSON.stringify(cacheSources));
  }
}
