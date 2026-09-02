import { assertEquals, assertThrows } from "@std/assert";
import { SimpleDB } from "../../../src/index.ts";

const bucketProject = Deno.env.get("BUCKET_PROJECT");
const bucketName = Deno.env.get("BUCKET_NAME");
const runLiveBucketTests = typeof bucketProject === "string" &&
  bucketProject !== "" &&
  typeof bucketName === "string" && bucketName !== "";

Deno.test("loadBucket rejects unsupported sources at call time", async () => {
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

if (runLiveBucketTests) {
  Deno.test("loadBucket loads live tabular data", {
    sanitizeResources: false,
  }, async () => {
    const destination =
      `simple-data-analysis-tests/${crypto.randomUUID()}.json`;
    const expected = [
      { city: "Montreal", temperature: 31 },
      { city: "Toronto", temperature: 33 },
    ];

    await withLiveBucketObject(
      destination,
      JSON.stringify(expected),
      async () => {
        const sdb = new SimpleDB();
        try {
          assertEquals(
            await sdb
              .newTable("liveBucketData")
              .loadBucket(destination)
              .sort({ city: "asc" })
              .getData(),
            expected,
          );
        } finally {
          await sdb.close();
        }
      },
    );
  });

  Deno.test("loadBucket loads live geospatial data", {
    sanitizeResources: false,
  }, async () => {
    const destination =
      `simple-data-analysis-tests/${crypto.randomUUID()}.geojson`;
    const expected = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: { type: "Point", coordinates: [-73.5674, 45.5019] },
        properties: { city: "Montreal" },
      }],
    };

    await withLiveBucketObject(
      destination,
      JSON.stringify(expected),
      async () => {
        const sdb = new SimpleDB();
        try {
          assertEquals(
            await sdb
              .newTable("liveBucketGeoData")
              .loadBucket(destination)
              .getGeoData(),
            expected,
          );
        } finally {
          await sdb.close();
        }
      },
    );
  });
} else {
  console.log(
    "No BUCKET_PROJECT or BUCKET_NAME in process.env, skipping live loadBucket tests",
  );
}

async function withLiveBucketObject(
  destination: string,
  contents: string,
  operation: () => Promise<void>,
): Promise<void> {
  const { deleteFromBucket, toBucket } = await import(
    "@nshiab/journalism-google"
  );
  const localFile = await Deno.makeTempFile();
  let uploaded = false;

  try {
    await Deno.writeTextFile(localFile, contents);
    await toBucket(localFile, destination);
    uploaded = true;
    await operation();
  } finally {
    await Deno.remove(localFile);
    if (uploaded) {
      await deleteFromBucket(destination, { try: true });
    }
  }
}
