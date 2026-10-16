import { test, expect } from "vite-plus/test";
import { assertThrows } from "../../helpers/assertions.ts";
import classifyBucketFile from "../../../src/helpers/classifyBucketFile.ts";

test("classifyBucketFile recognizes strict tabular suffixes", () => {
  for (const path of ["data.csv", "folder/data.json", "data.parquet"]) {
    expect(classifyBucketFile(path)).toEqual({
      kind: "data",
      compressed: false,
    });
  }
  for (const path of ["data.csv.gz", "folder/data.JSON.GZ"]) {
    expect(classifyBucketFile(path)).toEqual({
      kind: "data",
      compressed: true,
    });
  }
});

test("classifyBucketFile recognizes strict geospatial suffixes", () => {
  for (const path of ["map.geojson", "folder/map.GEOPARQUET", "map.shp.zip"]) {
    expect(classifyBucketFile(path)).toEqual({
      kind: "geo",
      compressed: false,
    });
  }
});

test("classifyBucketFile rejects unsupported suffixes", () => {
  for (const path of ["map.shp", "map.geojson.gz", "data.xlsx", "data.sqlite", "no-extension"]) {
    assertThrows(
      () => classifyBucketFile(path),
      Error,
      "Bucket methods do not support the file extension",
    );
  }
});
