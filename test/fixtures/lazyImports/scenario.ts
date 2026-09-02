import { assertArrayIncludes, assertEquals, assertRejects } from "@std/assert";
import { existsSync } from "node:fs";
import { bucketObjects, calls, loaded } from "./state.ts";
import { SimpleDB } from "../../../src/index.ts";

assertEquals(loaded, [], "Importing SDA must not evaluate integrations");
const sdb = new SimpleDB();
try {
  const table = sdb.newTable("data");
  switch (Deno.args[0]) {
    case "core": {
      const result = await table.loadArray([{ value: 1 }, { value: 2 }])
        .filter("value > 1").getData();
      assertEquals(result, [{ value: 2 }]);
      assertEquals(loaded, []);
      break;
    }
    case "queued": {
      const options = {
        skip: 0,
        apiEmailEnvVar: "GOOGLE_EMAIL_ENV",
        apiKeyEnvVar: "GOOGLE_KEY_ENV",
      };
      assertEquals(table.loadSheet("fixture", options), table);
      options.skip = 1;
      table.filter("value > 1");
      assertEquals(loaded, [], "Queueing a method must not load integrations");
      assertEquals(await table.getData(), [{ value: 2 }]);
      assertEquals(loaded, ["google"]);
      assertEquals(calls, [{
        method: "getSheetData",
        value: {
          skip: 0,
          apiEmail: "GOOGLE_EMAIL_ENV",
          apiKey: "GOOGLE_KEY_ENV",
        },
      }]);
      await table.loadSheet("fixture", { skip: 1 }).run();
      assertEquals(loaded, ["google"], "Repeated calls reuse the module");
      break;
    }
    case "ai": {
      await table.loadArray([{ value: 1 }]).run();
      const result = table.aiQuery("Return 42", {
        outputTable: "answer",
        generation: { provider: "gemini", model: "fixture", cache: false },
      });
      assertEquals(result.name, "answer");
      assertEquals(loaded, []);
      assertEquals(await result.filter("answer > 0").getData(), [{
        answer: 42,
      }]);
      assertEquals(loaded.includes("ai"), true);
      assertEquals(loaded.includes("google"), false);
      assertEquals(loaded.includes("dataviz"), false);
      break;
    }
    case "datawrapper": {
      const chart = sdb.newTable("chart");
      assertEquals(
        chart.loadDatawrapper("chart-id", {
          apiKeyEnvVar: "CUSTOM_DATAWRAPPER_KEY",
        }),
        chart,
      );
      assertEquals(loaded, []);
      assertEquals(await chart.getData(), [{ value: 1 }]);
      assertEquals(calls.at(-1), {
        method: "getDataDW",
        value: {
          chartId: "chart-id",
          options: { parse: true, apiKey: "CUSTOM_DATAWRAPPER_KEY" },
        },
      });

      const map = sdb.newTable("map");
      assertEquals(
        map.loadGeoDatawrapper("map-id", {
          apiKeyEnvVar: "CUSTOM_DATAWRAPPER_KEY",
        }),
        map,
      );
      assertEquals((await map.getGeoData()).features.length, 1);
      assertEquals(calls.at(-1), {
        method: "getDataDW",
        value: {
          chartId: "map-id",
          options: { apiKey: "CUSTOM_DATAWRAPPER_KEY" },
        },
      });

      await chart.toDatawrapper("chart-id", {
        apiKeyEnvVar: "CUSTOM_DATAWRAPPER_KEY",
        note: "Updated chart",
        republish: true,
      });
      const chartCalls = calls.slice(-3);
      assertEquals(chartCalls.map(({ method }) => method), [
        "updateDataDW",
        "updateNotesDW",
        "publishChartDW",
      ]);
      assertEquals(
        (chartCalls[0].value as { options: { apiKey?: string } }).options
          .apiKey,
        "CUSTOM_DATAWRAPPER_KEY",
      );
      assertEquals(chartCalls[1].value, {
        chartId: "chart-id",
        note: "Updated chart",
        options: { apiKey: "CUSTOM_DATAWRAPPER_KEY" },
      });
      assertEquals(chartCalls[2].value, {
        chartId: "chart-id",
        options: { apiKey: "CUSTOM_DATAWRAPPER_KEY" },
      });

      await map.toGeoDatawrapper("map-id", {
        apiKeyEnvVar: "CUSTOM_DATAWRAPPER_KEY",
        note: "Updated map",
        republish: true,
      });
      const mapCalls = calls.slice(-3);
      assertEquals(mapCalls.map(({ method }) => method), [
        "updateDataDW",
        "updateNotesDW",
        "publishChartDW",
      ]);
      assertEquals(
        (mapCalls[0].value as { options: { apiKey?: string } }).options.apiKey,
        "CUSTOM_DATAWRAPPER_KEY",
      );
      assertEquals(mapCalls[1].value, {
        chartId: "map-id",
        note: "Updated map",
        options: { apiKey: "CUSTOM_DATAWRAPPER_KEY" },
      });
      assertEquals(mapCalls[2].value, {
        chartId: "map-id",
        options: { apiKey: "CUSTOM_DATAWRAPPER_KEY" },
      });
      break;
    }
    case "bucket": {
      const source = sdb.newTable("bucketSource").loadArray([
        { value: 1, label: "one" },
        { value: 2, label: "two" },
      ]);
      assertEquals(loaded, []);

      for (
        const destination of [
          "data/results.csv",
          "data/results.csv.gz",
          "data/results.json",
          "data/results.json.gz",
          "data/results.parquet",
        ]
      ) {
        const uri = await source.toBucket(destination, {
          project: "fixture-project",
          bucket: "fixture-bucket",
          overwrite: true,
          metadata: { contentType: "application/octet-stream" },
        });
        assertEquals(uri, `gs://fixture-bucket/${destination}`);
        const upload = calls.at(-1)!;
        assertEquals(upload.method, "toBucket");
        assertEquals(
          (upload.value as { fileExists: boolean }).fileExists,
          true,
        );
        assertEquals(
          (upload.value as { options: { metadata: unknown } }).options.metadata,
          { contentType: "application/octet-stream" },
        );
        assertEquals(existsSync(upload.path!), false);

        const loadedTable = sdb.newTable().loadBucket(destination, {
          project: "fixture-project",
          bucket: "fixture-bucket",
        });
        assertEquals(await loadedTable.filter("value > 1").getData(), [
          { value: 2, label: "two" },
        ]);
        const download = calls.at(-1)!;
        assertEquals(download.method, "downloadFromBucket");
        assertEquals(
          (download.value as { fileExists: boolean }).fileExists,
          true,
        );
        assertEquals(existsSync(download.path!), false);
      }

      const geoSource = sdb.newTable("geoSource").loadGeoData(
        "test/geodata/files/CanadianProvincesAndTerritories.json",
      );
      for (
        const destination of [
          "geo/provinces.geojson",
          "geo/provinces.geoparquet",
          "geo/provinces.shp.zip",
        ]
      ) {
        await geoSource.toBucket(destination, {
          project: "fixture-project",
          bucket: "fixture-bucket",
        });
        const loadedGeoTable = sdb.newTable().loadBucket(destination, {
          project: "fixture-project",
          bucket: "fixture-bucket",
        });
        assertEquals(await loadedGeoTable.getRowCount(), 13);
      }
      assertEquals(loaded, ["google"]);
      break;
    }
    case "bucket-queued": {
      bucketObjects.set(
        "data/queued.csv",
        new TextEncoder().encode("value\n1\n2\n"),
      );
      const options = {
        project: "fixture-project",
        bucket: "fixture-bucket",
      };
      assertEquals(table.loadBucket("data/queued.csv", options), table);
      options.project = "changed-after-queueing";
      table.filter("value > 1");
      assertEquals(loaded, [], "Queueing must not load the Google module");
      assertEquals(await table.getData(), [{ value: 2 }]);
      assertEquals(loaded, ["google"]);
      assertEquals(calls.at(-1)?.method, "downloadFromBucket");
      assertEquals(
        (calls.at(-1)?.value as { options: unknown }).options,
        { project: "fixture-project", bucket: "fixture-bucket" },
      );
      break;
    }
    case "observers":
    case "observers-reversed": {
      const reverse = Deno.args[0] === "observers-reversed";
      const firstRead = Promise.withResolvers<void>();
      let value = 1;
      let requests = 0;
      table.getData = () => {
        requests++;
        const data = [{ value }];
        return reverse && requests === 1
          ? firstRead.promise.then(() => data)
          : Promise.resolve(data);
      };
      const first = table.writeChart(
        () => ({} as HTMLElement),
        `${Deno.args[1]}/first.png`,
      );
      assertEquals(
        requests,
        1,
        "writeChart must request data before awaiting its import",
      );
      value = 2;
      const second = table.writeChart(
        () => ({} as HTMLElement),
        `${Deno.args[1]}/second.png`,
      );
      assertEquals(requests, 2);
      if (reverse) {
        await second;
        firstRead.resolve();
      }
      await Promise.all([first, second]);
      assertEquals(loaded, ["dataviz"]);
      // Concurrent exports may finish in either order, but each destination
      // must receive the data requested when its observer was called.
      assertEquals(calls.length, 2);
      assertArrayIncludes(calls, [
        {
          method: "saveChart",
          value: [{ value: 1 }],
          path: `${Deno.args[1]}/first.png`,
        },
        {
          method: "saveChart",
          value: [{ value: 2 }],
          path: `${Deno.args[1]}/second.png`,
        },
      ]);
      const sheet = table.toSheet("fixture");
      assertEquals(
        requests,
        3,
        "toSheet must request data before awaiting its import",
      );
      await sheet;
      assertEquals(loaded, ["dataviz", "google"]);
      assertEquals(calls.at(-1), {
        method: "pushToSheet",
        value: [{ value: 2 }],
      });
      break;
    }
    case "failure": {
      table.loadSheet("fixture");
      assertEquals(loaded, []);
      await assertRejects(
        () => table.run(),
        Error,
        "Google module could not load",
      );
      break;
    }
    default:
      throw new Error(`Unknown scenario ${Deno.args[0]}`);
  }
} finally {
  await sdb.close();
}
