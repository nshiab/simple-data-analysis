import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type SimpleTable from "../class/SimpleTable.ts";
import crypto from "node:crypto";
import { formatDate, prettyDuration } from "jsr:@nshiab/journalism@1";

type cacheSources = {
  [key: string]: {
    file: string | null;
    creation: number;
    duration: number;
    geo: boolean;
    geoColumnName: null | string;
  };
};

export default async function cache(
  table: SimpleTable,
  run: () => Promise<void>,
  options: { ttl?: number; verbose?: boolean } = {},
) {
  (table.debug || options.verbose) &&
    console.log(`\ncache() for ${table.name}`);

  const cachePath = "./.sda-cache";
  if (!existsSync(cachePath)) {
    table.debug && console.log(`Creating ${cachePath}`);
    mkdirSync(cachePath);
  }
  const cacheSourcesPath = `${cachePath}/sources.json`;
  let cacheSources: cacheSources = {};
  if (existsSync(cacheSourcesPath)) {
    table.debug && console.log(`Found ${cacheSourcesPath}`);
    cacheSources = JSON.parse(readFileSync(cacheSourcesPath, "utf-8"));
  } else {
    table.debug && console.log(`No ${cacheSourcesPath}`);
  }

  const functionBody = run.toString();
  table.debug && console.log("Function body:", functionBody);
  const hash = crypto
    .createHash("sha256")
    .update(table.name + options.toString() + functionBody)
    .digest("hex");
  const id = `${table.name}.${hash}`;

  table.debug && console.log("id:", id);
  const cache = cacheSources[id];
  const now = Date.now();

  if (cache === undefined) {
    (table.debug || options.verbose) &&
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
    (table.debug || options.verbose) &&
      console.log(
        `Found ${cache.file} in cache.\nttl of ${
          prettyDuration(0, { end: options.ttl * 1000 })
        } has expired. The creation date is ${
          formatDate(
            new Date(cache.creation),
            "Month DD, YYYY, at HH:MM period",
          )
        }. It's is ${
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
    (table.debug || options.verbose) &&
      console.log(`Found ${cache.file} in cache.`);
    if (typeof options.ttl === "number") {
      const ttlLimit = new Date(cache.creation + options.ttl * 1000);
      (table.debug || options.verbose) &&
        console.log(
          `ttl of ${
            prettyDuration(0, { end: options.ttl * 1000 })
          } has not expired. The creation date is ${
            formatDate(
              new Date(cache.creation),
              "Month DD, YYYY, at HH:MM period",
            )
          }. There are ${prettyDuration(now, { end: ttlLimit })} left.`,
        );
    }
    if (cache.file === null) {
      console.log("No data in cache. Nothing to load.");
    } else if (cache.geo) {
      table.debug && console.log(`Geospatial data. Using loadGeoData`);
      const start = Date.now();
      await table.loadGeoData(cache.file);
      if (table.sdb.cacheSourcesUsed.indexOf(id) < 0) {
        table.sdb.cacheSourcesUsed.push(id);
      }
      if (typeof cache.geoColumnName === "string") {
        await table.renameColumns({ geom: cache.geoColumnName });
      }
      const end = Date.now();
      const duration = end - start;
      if (table.debug || options.verbose) {
        console.log(
          `Data loaded in ${
            prettyDuration(start, { end })
          }. Running the computations took ${
            prettyDuration(0, { end: cache.duration })
          } last time. You saved ${
            prettyDuration(duration, { end: cache.duration })
          }.\n`,
        );
        table.sdb.cacheTimeSaved += cache.duration - duration;
      }
    } else {
      table.debug && console.log(`Tabular data. Using loadData`);
      const start = Date.now();
      await table.loadData(cache.file);
      if (table.sdb.cacheSourcesUsed.indexOf(id) < 0) {
        table.sdb.cacheSourcesUsed.push(id);
      }
      const end = Date.now();
      const duration = end - start;
      if (table.debug || options.verbose) {
        console.log(
          `Data loaded in ${
            prettyDuration(start, { end })
          }. Running the computations took ${
            prettyDuration(0, { end: cache.duration })
          } last time. You saved ${
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
  table.debug && console.log("\ncache() after run()");
  if (!(await table.sdb.hasTable(table.name))) {
    console.log(`No data in table ${table.name}. Nothing stored in cache.`);
    cacheSources[id] = {
      creation: Date.now(),
      duration,
      file: null,
      geo: false,
      geoColumnName: null,
    };
  } else {
    const types = await table.getTypes();
    const geometriesColumns = Object.values(types).filter(
      (d) => d === "GEOMETRY",
    ).length;
    if (geometriesColumns > 1) {
      throw new Error(
        "Tables with geometries are stored as geojson files in cache, which can only have one geometry columns. Multiple geometry columns will be supported in the future.",
      );
    } else if (geometriesColumns === 1) {
      table.debug &&
        console.log(`\nThe table has geometries. Using writeGeoData.`);
      const file = `${cachePath}/${id}.geojson`;
      await table.writeGeoData(file);
      cacheSources[id] = {
        creation: Date.now(),
        duration,
        file,
        geo: true,
        geoColumnName: Object.entries(types).find(
          ([, value]) => value === "GEOMETRY",
        )?.[0] ?? null,
      };
      if (table.sdb.cacheSourcesUsed.indexOf(id) < 0) {
        table.sdb.cacheSourcesUsed.push(id);
      }
      table.sdb.cacheVerbose &&
        console.log(
          `Duration: ${prettyDuration(start, { end })}. Wrote ${file}.\n`,
        );
    } else {
      table.debug &&
        console.log(`\nNo geometries in the table. Using writeData.`);
      const file = `${cachePath}/${id}.parquet`;
      await table.writeData(file);
      cacheSources[id] = {
        creation: Date.now(),
        duration,
        file,
        geo: false,
        geoColumnName: null,
      };
      if (table.sdb.cacheSourcesUsed.indexOf(id) < 0) {
        table.sdb.cacheSourcesUsed.push(id);
      }
      table.sdb.cacheVerbose &&
        console.log(
          `Duration: ${prettyDuration(start, { end })}. Wrote ${file}.\n`,
        );
    }
  }

  writeFileSync(cacheSourcesPath, JSON.stringify(cacheSources));
}
