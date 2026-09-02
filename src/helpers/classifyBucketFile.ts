export type BucketFileKind = "data" | "geo";

export type BucketFile = {
  kind: BucketFileKind;
  compressed: boolean;
};

const supportedExtensions = [
  ".csv",
  ".csv.gz",
  ".json",
  ".json.gz",
  ".parquet",
  ".geojson",
  ".geoparquet",
  ".shp.zip",
];

/**
 * Classifies a Google Cloud Storage object path using its strict file suffix.
 *
 * @param path - The object path to classify.
 * @returns The file kind and whether it uses GZIP compression.
 * @internal
 */
export default function classifyBucketFile(path: string): BucketFile {
  const lowerPath = path.toLowerCase();

  if (lowerPath.endsWith(".shp.zip")) {
    return { kind: "geo", compressed: false };
  }
  if (
    lowerPath.endsWith(".geojson") || lowerPath.endsWith(".geoparquet")
  ) {
    return { kind: "geo", compressed: false };
  }
  if (lowerPath.endsWith(".csv.gz") || lowerPath.endsWith(".json.gz")) {
    return { kind: "data", compressed: true };
  }
  if (
    lowerPath.endsWith(".csv") || lowerPath.endsWith(".json") ||
    lowerPath.endsWith(".parquet")
  ) {
    return { kind: "data", compressed: false };
  }

  throw new Error(
    `Bucket methods do not support the file extension in ${
      JSON.stringify(path)
    }. Use ${supportedExtensions.join(", ")}.`,
  );
}
