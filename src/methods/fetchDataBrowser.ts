import type {
  AsyncDuckDB,
  AsyncDuckDBConnection,
} from "npm:@duckdb/duckdb-wasm@1";
import getExtension from "../helpers/getExtension.ts";
import mergeOptions from "../helpers/mergeOptions.ts";
import type SimpleWebTable from "../class/SimpleWebTable.ts";
import { prettyDuration } from "jsr:@nshiab/journalism@1/web";

export default async function fetchDataBrowser(
  simpleWebTable: SimpleWebTable,
  table: string,
  url: string,
  options: {
    fileType?: "csv" | "dsv" | "json" | "parquet";
    autoDetect?: boolean;
    // csv options
    header?: boolean;
    delim?: string;
    skip?: number;
  } = {},
) {
  let start;

  if (simpleWebTable.db === undefined) {
    await simpleWebTable.sdb.start();
    simpleWebTable.db = simpleWebTable.sdb.db;
    simpleWebTable.connection = simpleWebTable.sdb.connection;
  }

  if (await simpleWebTable.sdb.hasTable(table)) {
    await simpleWebTable.sdb.customQuery(`DROP TABLE "${table}";`);
  }

  const fileExtension = getExtension(url);
  const filename = url.split("/")[url.split("/").length - 1];

  if (
    options.fileType === "csv" ||
    fileExtension === "csv" ||
    options.fileType === "dsv" ||
    typeof options.delim === "string"
  ) {
    // await import to make duckdb-wasm optional
    const { DuckDBDataProtocol } = await import("npm:@duckdb/duckdb-wasm@1");
    await (simpleWebTable.db as AsyncDuckDB).registerFileURL(
      filename,
      url,
      DuckDBDataProtocol.HTTP,
      false,
    );

    await (
      simpleWebTable.connection as AsyncDuckDBConnection
    ).insertCSVFromPath(filename, {
      name: table,
      detect: options.autoDetect ?? true,
      header: options.header ?? true,
      delimiter: options.delim ?? ",",
      skip: options.skip,
    });
  } else if (options.fileType === "json" || fileExtension === "json") {
    const res = await fetch(url);
    await (simpleWebTable.db as AsyncDuckDB).registerFileText(
      filename,
      await res.text(),
    );
    await (
      simpleWebTable.connection as AsyncDuckDBConnection
    ).insertJSONFromPath(filename, {
      name: table,
    });
  } else if (options.fileType === "parquet" || fileExtension === "parquet") {
    // await import to make duckdb-wasm optional
    const { DuckDBDataProtocol } = await import("npm:@duckdb/duckdb-wasm@1");
    await (simpleWebTable.db as AsyncDuckDB).registerFileURL(
      filename,
      url,
      DuckDBDataProtocol.HTTP,
      false,
    );
    await simpleWebTable.runQuery(
      `CREATE OR REPLACE TABLE "${table}" AS SELECT * FROM parquet_scan('${filename}')`,
      simpleWebTable.connection,
      false,
      mergeOptions(simpleWebTable, {
        table: null,
        method: null,
        parameters: null,
      }),
    );
  } else {
    throw new Error(
      `Unknown options.fileType ${options.fileType} or fileExtension ${fileExtension}`,
    );
  }

  if (start) {
    console.log(`Done in ${prettyDuration(start)}`);
  }
}
