import { basename, join } from "node:path";
import { queueAsyncBarrier } from "@nshiab/simple-data-analysis-core/helpers";
import classifyBucketFile from "../helpers/classifyBucketFile.ts";
import withTemporaryDirectory from "../helpers/withTemporaryDirectory.ts";
import type SimpleTable from "../class/SimpleTable.ts";

type LoadBucketOptions = {
  project?: string;
  bucket?: string;
};

export default function loadBucket(
  table: SimpleTable,
  source: string,
  options: LoadBucketOptions = {},
): SimpleTable {
  const file = classifyBucketFile(source);
  options = structuredClone(options);

  queueAsyncBarrier(table, {
    method: "loadBucket()",
    parameters: { source, options },
    execute: async () => {
      await withTemporaryDirectory(
        "sda-bucket-download-",
        async (directory) => {
          const localFile = join(directory, basename(source));
          const { downloadFromBucket } = await import(
            "@nshiab/journalism-google"
          );
          await downloadFromBucket(source, localFile, {
            project: options.project,
            bucket: options.bucket,
          });

          if (file.kind === "data") {
            table.loadData(localFile);
          } else {
            table.loadGeoData(localFile);
          }
          await table.run();
        },
      );
    },
  });
  return table;
}
