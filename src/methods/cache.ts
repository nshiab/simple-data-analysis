import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type SimpleTable from "../class/SimpleTable.ts";
import crypto from "node:crypto";
import { formatDate, prettyDuration } from "@nshiab/journalism-format";

type cacheSources = {
  [key: string]: {
    file: string | null;
    creation: number;
    duration: number;
    geo: boolean;
  };
};

export default async function cache(
  table: SimpleTable,
  run: () => Promise<void>,
  options: { ttl?: number; verbose?: boolean } = {},
) {
  options.verbose &&
    console.log(`\ncache() for ${table.name}`);

  const cachePath = "./.sda-cache";
  if (!existsSync(cachePath)) {
    mkdirSync(cachePath);
  }
  const cacheSourcesPath = `${cachePath}/sources.json`;
  let cacheSources: cacheSources = {};
  if (existsSync(cacheSourcesPath)) {
    cacheSources = JSON.parse(readFileSync(cacheSourcesPath, "utf-8"));
  }

  const functionBody = run.toString();
  const hash = crypto
    .createHash("sha256")
    .update(table.name + options.toString() + functionBody)
    .digest("hex");
  const id = `${table.name}.${hash}`;

  const cache = cacheSources[id];
  const now = Date.now();

  if (cache === undefined) {
    options.verbose &&
      console.log(`Nothing in cache. Running and storing in cache.`);
    await runAndWrite(
      table,
      run,
      cacheSources,
      cacheSourcesPath,
      cachePath,
      id,
    );
  } else if (
    cache &&
    typeof options.ttl === "number" &&
    now - cache.creation > options.ttl * 1000
  ) {
    options.verbose &&
      console.log(
        `Found in cache.\nttl of ${
          prettyDuration(0, { end: options.ttl * 1000 })
        } has expired.\nThe creation date is ${
          formatDate(
            new Date(cache.creation),
            "Month DD, YYYY, at HH:MM period",
          )
        }.\nIt's is ${
          prettyDuration(cache.creation, { end: now })
        } ago.\nRunning and storing in cache.`,
      );
    await runAndWrite(
      table,
      run,
      cacheSources,
      cacheSourcesPath,
      cachePath,
      id,
    );
  } else {
    options.verbose &&
      console.log(`Found in cache.`);
    if (typeof options.ttl === "number") {
      const ttlLimit = new Date(cache.creation + options.ttl * 1000);
      (options.verbose) &&
        console.log(
          `ttl of ${
            prettyDuration(0, { end: options.ttl * 1000 })
          } has not expired.\nThe creation date is ${
            formatDate(
              new Date(cache.creation),
              "Month DD, YYYY, at HH:MM period",
            )
          }.\nThere are ${prettyDuration(now, { end: ttlLimit })} left.`,
        );
    }
    if (cache.file === null) {
      console.log("No data in cache. Nothing to load.");
    } else if (cache.geo) {
      const start = Date.now();
      await table.loadGeoData(cache.file);
      if (table.sdb.cacheSourcesUsed.indexOf(id) < 0) {
        table.sdb.cacheSourcesUsed.push(id);
      }
      const end = Date.now();
      const duration = end - start;
      if (options.verbose) {
        console.log(
          `Data loaded in ${
            prettyDuration(start, { end })
          }.\nRunning computations previously took ${
            prettyDuration(0, { end: cache.duration })
          }.\nYou saved ${
            prettyDuration(duration, { end: cache.duration })
          }.\n`,
        );
        table.sdb.cacheTimeSaved += cache.duration - duration;
      }
    } else {
      const start = Date.now();
      await table.loadData(cache.file);
      if (table.sdb.cacheSourcesUsed.indexOf(id) < 0) {
        table.sdb.cacheSourcesUsed.push(id);
      }
      const end = Date.now();
      const duration = end - start;
      if (options.verbose) {
        console.log(
          `Data loaded in ${
            prettyDuration(start, { end })
          }.\nRunning computations previously took ${
            prettyDuration(0, { end: cache.duration })
          }.\nYou saved ${
            prettyDuration(duration, { end: cache.duration })
          }.\n`,
        );
        table.sdb.cacheTimeSaved += cache.duration - duration;
      }
    }
  }
}

async function runAndWrite(
  table: SimpleTable,
  run: () => Promise<void>,
  cacheSources: cacheSources,
  cacheSourcesPath: string,
  cachePath: string,
  id: string,
) {
  const start = Date.now();
  await run();
  const end = Date.now();
  const duration = end - start;
  table.sdb.cacheVerbose &&
    console.log(
      `Computations done in ${prettyDuration(start, { end })}.`,
    );
  if (!(await table.sdb.hasTable(table.name))) {
    console.log(`No data in table ${table.name}. Nothing stored in cache.`);
    cacheSources[id] = {
      creation: Date.now(),
      duration,
      file: null,
      geo: false,
    };
  } else {
    const types = await table.getTypes();
    const geometriesColumns = Object.values(types).filter(
      (d) => d === "GEOMETRY",
    ).length;
    if (geometriesColumns > 0) {
      const file = `${cachePath}/${id}.geoparquet`;
      const writeStart = Date.now();
      await table.writeGeoData(file);
      cacheSources[id] = {
        creation: Date.now(),
        duration,
        file,
        geo: true,
      };
      const writeEnd = Date.now();
      table.sdb.cacheVerbose &&
        console.log(
          `Wrote in cache in ${
            prettyDuration(writeStart, { end: writeEnd })
          }.\n`,
        );
      table.sdb.cacheTimeWriting += writeEnd - writeStart;
      if (table.sdb.cacheSourcesUsed.indexOf(id) < 0) {
        table.sdb.cacheSourcesUsed.push(id);
      }
    } else {
      const file = `${cachePath}/${id}.parquet`;
      const writeStart = Date.now();
      await table.writeData(file);
      const writeEnd = Date.now();
      table.sdb.cacheVerbose &&
        console.log(
          `Wrote in cache in ${
            prettyDuration(writeStart, { end: writeEnd })
          }.\n`,
        );
      table.sdb.cacheTimeWriting += writeEnd - writeStart;
      cacheSources[id] = {
        creation: Date.now(),
        duration,
        file,
        geo: false,
      };
      if (table.sdb.cacheSourcesUsed.indexOf(id) < 0) {
        table.sdb.cacheSourcesUsed.push(id);
      }
    }
  }

  writeFileSync(cacheSourcesPath, JSON.stringify(cacheSources));
}
