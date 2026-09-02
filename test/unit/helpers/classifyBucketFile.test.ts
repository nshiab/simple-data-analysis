import { assertEquals, assertThrows } from "@std/assert";
import classifyBucketFile from "../../../src/helpers/classifyBucketFile.ts";

Deno.test("classifyBucketFile recognizes strict tabular suffixes", () => {
  for (
    const path of [
      "data.csv",
      "folder/data.json",
      "data.parquet",
    ]
  ) {
    assertEquals(classifyBucketFile(path), {
      kind: "data",
      compressed: false,
    });
  }
  for (const path of ["data.csv.gz", "folder/data.JSON.GZ"]) {
    assertEquals(classifyBucketFile(path), {
      kind: "data",
      compressed: true,
    });
  }
});

Deno.test("classifyBucketFile recognizes strict geospatial suffixes", () => {
  for (
    const path of [
      "map.geojson",
      "folder/map.GEOPARQUET",
      "map.shp.zip",
    ]
  ) {
    assertEquals(classifyBucketFile(path), {
      kind: "geo",
      compressed: false,
    });
  }
});

Deno.test("classifyBucketFile rejects unsupported suffixes", () => {
  for (
    const path of [
      "map.shp",
      "map.geojson.gz",
      "data.xlsx",
      "data.sqlite",
      "no-extension",
    ]
  ) {
    assertThrows(
      () => classifyBucketFile(path),
      Error,
      "Bucket methods do not support the file extension",
    );
  }
});
