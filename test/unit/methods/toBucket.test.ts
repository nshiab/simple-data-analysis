import { describe } from "vite-plus/test";
import { test, expect, vi } from "vite-plus/test";
import { assertRejects } from "../../helpers/assertions.ts";
import { SimpleDB } from "../../../src/index.ts";

const bucketProject = process.env["BUCKET_PROJECT"];
const bucketName = process.env["BUCKET_NAME"];
const runLiveBucketTests =
  typeof bucketProject === "string" &&
  bucketProject !== "" &&
  typeof bucketName === "string" &&
  bucketName !== "";

test("toBucket rejects unsupported destinations", async () => {
  const sdb = new SimpleDB();
  try {
    const table = sdb.newTable().loadArray([{ value: 1 }]);
    await assertRejects(
      () => table.toBucket("data.xlsx"),
      Error,
      "Bucket methods do not support the file extension",
    );
  } finally {
    await sdb.close();
  }
});

test("toBucket rejects conflicting existing-object behavior", async () => {
  const sdb = new SimpleDB();
  try {
    const table = sdb.newTable().loadArray([{ value: 1 }]);
    await assertRejects(
      () =>
        table.toBucket("data.csv", {
          overwrite: true,
          skip: true,
        }),
      Error,
      "Cannot use both skip and overwrite",
    );
  } finally {
    await sdb.close();
  }
});

test("toBucket rejects non-object metadata before exporting data", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable().loadArray([{ value: 1 }]);
  const write = vi.spyOn(table, "writeData").mockImplementation(() => {
    throw new Error("Invalid metadata must not export a file");
  });
  try {
    for (const metadata of [null, [], "metadata", 42, false]) {
      await expect(table.toBucket("data.csv", { metadata })).rejects.toThrow(
        "Bucket metadata must be an object.",
      );
    }
    expect(write).not.toHaveBeenCalled();
  } finally {
    write.mockRestore();
    await sdb.close();
  }
});

test("toBucket relies on core geometry validation", async () => {
  const sdb = new SimpleDB();
  try {
    const table = sdb.newTable().loadArray([{ value: 1 }]);
    await assertRejects(
      () => table.toBucket("data.geojson"),
      Error,
      "Table contains no geometry columns. Use writeData() instead.",
    );
  } finally {
    await sdb.close();
  }
});

describe.skipIf(process.env.CI === "true" || !runLiveBucketTests)(
  "live integration: runLiveBucketTests",
  () => {
    test("bucket methods round-trip live tabular data", async () => {
      const destination = `simple-data-analysis-tests/${crypto.randomUUID()}.parquet`;
      const expected = [
        { city: "Montreal", temperature: 31 },
        { city: "Toronto", temperature: 33 },
      ];
      const sdb = new SimpleDB();
      let uploaded = false;

      try {
        const uri = await sdb.newTable("bucketUpload").loadArray(expected).toBucket(destination);
        uploaded = true;
        expect(uri).toEqual(`gs://${bucketName}/${destination}`);

        expect(
          await sdb
            .newTable("bucketDownload")
            .loadBucket(destination)
            .sort({ city: "asc" })
            .getData(),
        ).toEqual(expected);
      } finally {
        await sdb.close();
        if (uploaded) {
          const { deleteFromBucket } = await import("@nshiab/journalism-google");
          await deleteFromBucket(destination, { try: true });
        }
      }
    });

    test("bucket methods round-trip live geospatial data", async () => {
      const destination = `simple-data-analysis-tests/${crypto.randomUUID()}.geoparquet`;
      const sdb = new SimpleDB();
      let uploaded = false;

      try {
        const uri = await sdb
          .newTable("bucketGeoUpload")
          .loadGeoData("test/geodata/files/CanadianProvincesAndTerritories.json")
          .toBucket(destination);
        uploaded = true;
        expect(uri).toEqual(`gs://${bucketName}/${destination}`);

        const geoData = await sdb
          .newTable("bucketGeoDownload")
          .loadBucket(destination)
          .getGeoData();
        expect(geoData.type).toEqual("FeatureCollection");
        expect(geoData.features.length).toEqual(13);
      } finally {
        await sdb.close();
        if (uploaded) {
          const { deleteFromBucket } = await import("@nshiab/journalism-google");
          await deleteFromBucket(destination, { try: true });
        }
      }
    });
  },
);
