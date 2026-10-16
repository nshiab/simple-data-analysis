import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe } from "vite-plus/test";
import { test, expect } from "vite-plus/test";
import { rm } from "node:fs/promises";
import { writeFile } from "node:fs/promises";
import { assertThrows } from "../../helpers/assertions.ts";
import { SimpleDB } from "../../../src/index.ts";

const bucketProject = process.env["BUCKET_PROJECT"];
const bucketName = process.env["BUCKET_NAME"];
const runLiveBucketTests =
  typeof bucketProject === "string" &&
  bucketProject !== "" &&
  typeof bucketName === "string" &&
  bucketName !== "";

test("loadBucket rejects unsupported sources at call time", async () => {
  const sdb = new SimpleDB();
  try {
    const table = sdb.newTable();
    assertThrows(
      () => table.loadBucket("data.xlsx"),
      Error,
      "Bucket methods do not support the file extension",
    );
  } finally {
    await sdb.close();
  }
});

describe.skipIf(process.env.CI === "true" || !runLiveBucketTests)(
  "live integration: runLiveBucketTests",
  () => {
    test("loadBucket loads live tabular data", async () => {
      const destination = `simple-data-analysis-tests/${crypto.randomUUID()}.json`;
      const expected = [
        { city: "Montreal", temperature: 31 },
        { city: "Toronto", temperature: 33 },
      ];

      await withLiveBucketObject(destination, JSON.stringify(expected), async () => {
        const sdb = new SimpleDB();
        try {
          expect(
            await sdb
              .newTable("liveBucketData")
              .loadBucket(destination)
              .sort({ city: "asc" })
              .getData(),
          ).toEqual(expected);
        } finally {
          await sdb.close();
        }
      });
    });

    test("loadBucket loads live geospatial data", async () => {
      const destination = `simple-data-analysis-tests/${crypto.randomUUID()}.geojson`;
      const expected = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-73.5674, 45.5019] },
            properties: { city: "Montreal" },
          },
        ],
      };

      await withLiveBucketObject(destination, JSON.stringify(expected), async () => {
        const sdb = new SimpleDB();
        try {
          expect(
            await sdb.newTable("liveBucketGeoData").loadBucket(destination).getGeoData(),
          ).toEqual(expected);
        } finally {
          await sdb.close();
        }
      });
    });
  },
);

async function withLiveBucketObject(
  destination: string,
  contents: string,
  operation: () => Promise<void>,
): Promise<void> {
  const { deleteFromBucket, toBucket } = await import("@nshiab/journalism-google");
  const localDirectory = mkdtempSync(join(tmpdir(), "sda-bucket-"));
  const localFile = join(localDirectory, "upload.json");
  let uploaded = false;

  try {
    await writeFile(localFile, contents);
    await toBucket(localFile, destination);
    uploaded = true;
    await operation();
  } finally {
    await rm(localDirectory, { recursive: true, force: true });
    if (uploaded) {
      await deleteFromBucket(destination, { try: true });
    }
  }
}
