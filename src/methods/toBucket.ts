import { basename, join } from "node:path";
import classifyBucketFile from "../helpers/classifyBucketFile.ts";
import withTemporaryDirectory from "../helpers/withTemporaryDirectory.ts";
import type SimpleTable from "../class/SimpleTable.ts";

type ToBucketOptions = {
  project?: string;
  bucket?: string;
  overwrite?: boolean;
  skip?: boolean;
  metadata?: unknown;
};

export default async function toBucket(
  table: SimpleTable,
  destination: string,
  options: ToBucketOptions = {},
): Promise<string> {
  options = structuredClone(options);
  const file = classifyBucketFile(destination);
  assertOptions(options);

  return await withTemporaryDirectory(
    "sda-bucket-upload-",
    async (directory) => {
      let localFile = join(directory, basename(destination));

      if (file.kind === "data") {
        if (file.compressed) {
          localFile = localFile.slice(0, -".gz".length);
          await table.writeData(localFile, { compression: true });
          localFile += ".gz";
        } else {
          await table.writeData(localFile);
        }
      } else {
        await table.writeGeoData(localFile);
      }

      const { toBucket: uploadToBucket } = await import(
        "@nshiab/journalism-google"
      );
      return await uploadToBucket(localFile, destination, {
        project: options.project,
        bucket: options.bucket,
        overwrite: options.overwrite,
        skip: options.skip,
        metadata: options.metadata,
      });
    },
  );
}

function assertOptions(options: ToBucketOptions): void {
  if (options.skip === true && options.overwrite === true) {
    throw new Error(
      "Cannot use both skip and overwrite. Choose one existing-object behavior.",
    );
  }
}
