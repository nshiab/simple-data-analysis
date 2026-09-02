import { assertEquals, assertRejects } from "@std/assert";
import { SimpleDB } from "../../../src/index.ts";

const bucketProject = Deno.env.get("BUCKET_PROJECT");
const bucketName = Deno.env.get("BUCKET_NAME");
const runLiveBucketTests = typeof bucketProject === "string" &&
  bucketProject !== "" &&
  typeof bucketName === "string" && bucketName !== "";

Deno.test("toBucket rejects unsupported destinations", async () => {
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

Deno.test("toBucket rejects conflicting existing-object behavior", async () => {
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

Deno.test("toBucket relies on core geometry validation", async () => {
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

if (runLiveBucketTests) {
  Deno.test("bucket methods round-trip live tabular data", {
    sanitizeResources: false,
  }, async () => {
    const destination =
      `simple-data-analysis-tests/${crypto.randomUUID()}.parquet`;
    const expected = [
      { city: "Montreal", temperature: 31 },
      { city: "Toronto", temperature: 33 },
    ];
    const sdb = new SimpleDB();
    let uploaded = false;

    try {
      const uri = await sdb
        .newTable("bucketUpload")
        .loadArray(expected)
        .toBucket(destination);
      uploaded = true;
      assertEquals(uri, `gs://${bucketName}/${destination}`);

      assertEquals(
        await sdb
          .newTable("bucketDownload")
          .loadBucket(destination)
          .sort({ city: "asc" })
          .getData(),
        expected,
      );
    } finally {
      await sdb.close();
      if (uploaded) {
        const { deleteFromBucket } = await import(
          "@nshiab/journalism-google"
        );
        await deleteFromBucket(destination, { try: true });
      }
    }
  });

  Deno.test("bucket methods round-trip live geospatial data", {
    sanitizeResources: false,
  }, async () => {
    const destination =
      `simple-data-analysis-tests/${crypto.randomUUID()}.geoparquet`;
    const sdb = new SimpleDB();
    let uploaded = false;

    try {
      const uri = await sdb
        .newTable("bucketGeoUpload")
        .loadGeoData(
          "test/geodata/files/CanadianProvincesAndTerritories.json",
        )
        .toBucket(destination);
      uploaded = true;
      assertEquals(uri, `gs://${bucketName}/${destination}`);

      const geoData = await sdb
        .newTable("bucketGeoDownload")
        .loadBucket(destination)
        .getGeoData();
      assertEquals(geoData.type, "FeatureCollection");
      assertEquals(geoData.features.length, 13);
    } finally {
      await sdb.close();
      if (uploaded) {
        const { deleteFromBucket } = await import(
          "@nshiab/journalism-google"
        );
        await deleteFromBucket(destination, { try: true });
      }
    }
  });
} else {
  console.log(
    "No BUCKET_PROJECT or BUCKET_NAME in process.env, skipping live bucket tests",
  );
}
