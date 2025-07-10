import getDescription from "../methods/getDescription.ts";
import renameColumnQuery from "../methods/renameColumnQuery.ts";
import replaceQuery from "../methods/replaceQuery.ts";
import convertQuery from "../methods/convertQuery.ts";
import roundQuery from "../methods/roundQuery.ts";
import insertRowsQuery from "../methods/insertRowsQuery.ts";
import sortQuery from "../methods/sortQuery.ts";
import outliersIQRQuery from "../methods/outliersIQRQuery.ts";
import zScoreQuery from "../methods/zScoreQuery.ts";
import parseType from "../helpers/parseTypes.ts";
import concatenateQuery from "../methods/concatenateQuery.ts";
import removeMissing from "../methods/removeMissing.ts";
import getColumns from "../methods/getColumns.ts";
import getNbRows from "../methods/getNbRows.ts";
import getTypes from "../methods/getTypes.ts";
import getValues from "../methods/getValues.ts";
import getUniques from "../methods/getUniques.ts";
import getFirstRow from "../methods/getFirstRow.ts";
import getLastRow from "../methods/getLastRow.ts";
import getTop from "../methods/getTop.ts";
import getBottom from "../methods/getBottom.ts";
import getMin from "../methods/getMin.ts";
import getMax from "../methods/getMax.ts";
import getMean from "../methods/getMean.ts";
import getMedian from "../methods/getMedian.ts";
import getSum from "../methods/getSum.ts";
import getSkew from "../methods/getSkew.ts";
import getStdDev from "../methods/getStdDev.ts";
import getVar from "../methods/getVar.ts";
import getQuantile from "../methods/getQuantile.ts";
import ranksQuery from "../methods/ranksQuery.ts";
import quantilesQuery from "../methods/quantilesQuery.ts";
import binsQuery from "../methods/binsQuery.ts";
import proportionsHorizontalQuery from "../methods/proportionsHorizontalQuery.ts";
import proportionsVerticalQuery from "../methods/proportionsVerticalQuery.ts";
import trimQuery from "../methods/trimQuery.ts";
import removeDuplicatesQuery from "../methods/removeDuplicatesQuery.ts";
import replaceNullsQuery from "../methods/replaceNullsQuery.ts";
import lowerQuery from "../methods/lowerQuery.ts";
import upperQuery from "../methods/upperQuery.ts";
import cloneColumnQuery from "../methods/cloneColumn.ts";
import keepQuery from "../methods/keepQuery.ts";
import removeQuery from "../methods/removeQuery.ts";
import normalizeQuery from "../methods/normalizeQuery.ts";
import rollingQuery from "../methods/rollingQuery.ts";
import distanceQuery from "../methods/distanceQuery.ts";
import getGeoData from "../methods/getGeoData.ts";
import { readdirSync } from "node:fs";
import stringToArray from "../helpers/stringToArray.ts";
import loadDataQuery from "../methods/loadDataQuery.ts";
import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import writeDataQuery from "../methods/writeDataQuery.ts";
import writeGeoDataQuery from "../methods/writeGeoDataQuery.ts";
import type SimpleDB from "./SimpleDB.ts";
import runQuery from "../helpers/runQuery.ts";
import aggregateGeoQuery from "../methods/aggregateGeoQuery.ts";
import summarize from "../methods/summarize.ts";
import correlations from "../methods/correlations.ts";
import linearRegressions from "../methods/linearRegressions.ts";
import joinGeo from "../methods/joinGeo.ts";
import shouldFlipBeforeExport from "../helpers/shouldFlipBeforeExport.ts";
import getProjection from "../helpers/getProjection.ts";
import cache from "../methods/cache.ts";
import {
  camelCase,
  createDirectory,
  formatNumber,
  logBarChart,
  logDotChart,
  logLineChart,
  overwriteSheetData,
  rewind,
  saveChart,
} from "jsr:@nshiab/journalism@1";
import writeDataAsArrays from "../helpers/writeDataAsArrays.ts";
import logHistogram from "../methods/logHistogram.ts";
import logData from "../helpers/logData.ts";
import { readFileSync, writeFileSync } from "node:fs";
import type { Data } from "npm:@observablehq/plot@0";
import loadArray from "../methods/loadArray.ts";
import cleanPath from "../helpers/cleanPath.ts";
import Simple from "./Simple.ts";
import selectRowsQuery from "../methods/selectRowsQuery.ts";
import crossJoinQuery from "../methods/crossJoinQuery.ts";
import join from "../methods/join.ts";
import cloneQuery from "../methods/cloneQuery.ts";
import findGeoColumn from "../helpers/findGeoColumn.ts";
import getExtension from "../helpers/getExtension.ts";
import getIdenticalColumns from "../helpers/getIdenticalColumns.ts";
import capitalizeQuery from "../methods/capitalizeQuery.ts";
import getProjectionParquet from "../helpers/getProjectionParquet.ts";
import unifyColumns from "../helpers/unifyColumns.ts";
import accumulateQuery from "../helpers/accumulateQuery.ts";
import stringifyDates from "../helpers/stringifyDates.ts";
import stringifyDatesInvert from "../helpers/stringifyDatesInvert.ts";
import aiRowByRow from "../methods/aiRowByRow.ts";
import aiQuery from "../methods/aiQuery.ts";
import aiEmbeddings from "../methods/aiEmbeddings.ts";
import aiVectorSimilarity from "../methods/aiVectorSimilarity.ts";

/**
 * Represents a table within a SimpleDB database, capable of handling tabular, geospatial, and vector data.
 * SimpleTable instances are typically created via a SimpleDB instance.
 *
 * @category Main
 * @example
 * ```ts
 * // Create a SimpleDB instance (in-memory by default)
 * const sdb = new SimpleDB();
 *
 * // Create a new table named "employees" within the database
 * const employees = sdb.newTable("employees");
 *
 * // Load data from a CSV file into the "employees" table
 * await employees.loadData("./employees.csv");
 *
 * // Log the first few rows of the "employees" table to the console
 * await employees.logTable();
 *
 * // Close the database connection and free up resources
 * await sdb.done();
 * ```
 *
 * @example
 * ```ts
 * // Handling geospatial data
 * // Create a SimpleDB instance
 * const sdb = new SimpleDB();
 *
 * // Create a new table for geospatial data
 * const boundaries = sdb.newTable("boundaries");
 *
 * // Load geospatial data from a GeoJSON file
 * await boundaries.loadGeoData("./boundaries.geojson");
 *
 * // Close the database connection
 * await sdb.done();
 * ```
 */

export default class SimpleTable extends Simple {
  /**
   * Name of the table in the database.
   *
   * @category Properties
   */
  name: string;
  /**
   * The projections of the geospatial data, if any.
   *
   * @defaultValue `{}`
   * @category Properties
   */
  projections: { [key: string]: string };
  /**
   * The indexes of the table.
   *
   * @defaultValue `[]`
   * @category Properties
   */
  indexes: string[];
  /**
   * The SimpleDB instance that created this table.
   *
   * @category Properties
   */
  declare sdb: SimpleDB;

  /**
   * Creates an instance of SimpleTable.
   *
   * @param name - The name of the table.
   * @param projections - An object mapping column names to their geospatial projections.
   * @param simpleDB - The SimpleDB instance that this table belongs to.
   * @param options - An optional object with configuration options:
   * @param options.debug - A boolean indicating whether to enable debug mode.
   * @param options.nbRowsToLog - The number of rows to log when displaying table data.
   * @param options.nbCharactersToLog - The maximum number of characters to log for strings. Useful to avoid logging large text content.
   * @param options.types - A boolean indicating whether to include data types when logging a table.
   * @category Constructor
   */
  constructor(
    name: string,
    projections: { [key: string]: string },
    simpleDB: SimpleDB,
    options: {
      debug?: boolean;
      nbRowsToLog?: number;
      nbCharactersToLog?: number;
      types?: boolean;
    } = {},
  ) {
    super(options);
    this.name = name;
    this.projections = projections;
    this.sdb = simpleDB;
    this.runQuery = runQuery;
    this.indexes = [];
  }

  /**
   * Renames the current table.
   *
   * @param name - The new name for the table.
   * @returns A promise that resolves when the table has been renamed.
   * @category Table Management
   *
   * @example
   * ```ts
   * // Rename the table to "new_employees"
   * await table.renameTable("new_employees");
   * ```
   */
  async renameTable(name: string): Promise<void> {
    await queryDB(
      this,
      `ALTER TABLE "${this.name}" RENAME TO "${name}";`,
      mergeOptions(this, {
        table: this.name,
        method: "renameTable()",
        parameters: { name },
      }),
    );

    this.name = name;
  }

  /**
   * Sets the data types for columns in a new table. If the table already exists, it will be replaced.
   * To convert the types of an existing table, use the `.convert()` method instead.
   *
   * @param types - An object specifying the column names and their target data types (JavaScript or SQL types).
   * @returns A promise that resolves when the types have been set.
   * @category Table Management
   *
   * @example
   * ```ts
   * // Set types for a new table
   * await table.setTypes({
   *   name: "string",
   *   salary: "integer",
   *   raise: "float",
   * });
   * ```
   */
  async setTypes(types: {
    [key: string]:
      | "integer"
      | "float"
      | "number"
      | "string"
      | "date"
      | "time"
      | "datetime"
      | "datetimeTz"
      | "bigint"
      | "double"
      | "varchar"
      | "timestamp"
      | "timestamp with time zone"
      | "boolean"
      | "geometry";
  }): Promise<void> {
    let spatial = "";
    if (
      Object.values(types)
        .map((d) => d.toLowerCase())
        .includes("geometry")
    ) {
      spatial = "INSTALL spatial; LOAD spatial;\n";
    }
    await queryDB(
      this,
      `${spatial}CREATE OR REPLACE TABLE "${this.name}" (${
        Object.keys(
          types,
        )
          .map((d) => `${d} ${parseType(types[d])}`)
          .join(", ")
      });`,
      mergeOptions(this, {
        table: this.name,
        method: "setTypes()",
        parameters: { types },
      }),
    );
  }

  /**
   * Loads an array of JavaScript objects into the table.
   *
   * @param arrayOfObjects - An array of objects, where each object represents a row and its properties represent columns.
   * @returns A promise that resolves to the SimpleTable instance after the data has been loaded.
   * @category Importing Data
   *
   * @example
   * ```ts
   * // Load data from an array of objects
   * const data = [
   *   { letter: "a", number: 1 },
   *   { letter: "b", number: 2 }
   * ];
   * await table.loadArray(data);
   * ```
   */
  async loadArray(
    arrayOfObjects: { [key: string]: unknown }[],
  ): Promise<SimpleTable> {
    await loadArray(this, arrayOfObjects);

    return this;
  }

  /**
   * Loads data from one or more local or remote files into the table.
   * Supported file formats include CSV, JSON, Parquet, and Excel.
   *
   * @param files - The path(s) or URL(s) of the file(s) containing the data to be loaded.
   * @param options - An optional object with configuration options:
   * @param options.fileType - The type of file to load ("csv", "dsv", "json", "parquet", "excel"). Defaults to being inferred from the file extension.
   * @param options.autoDetect - A boolean indicating whether to automatically detect the data format. Defaults to `true`.
   * @param options.limit - A number indicating the maximum number of rows to load. Defaults to all rows.
   * @param options.fileName - A boolean indicating whether to include the file name as a new column in the loaded data. Defaults to `false`.
   * @param options.unifyColumns - A boolean indicating whether to unify columns across multiple files when their structures differ. Missing columns will be filled with `NULL` values. Defaults to `false`.
   * @param options.columnTypes - An object mapping column names to their expected data types. By default, types are inferred.
   * @param options.header - A boolean indicating whether the file has a header row. Applicable to CSV files. Defaults to `true`.
   * @param options.allText - A boolean indicating whether all columns should be treated as text. Applicable to CSV files. Defaults to `false`.
   * @param options.delim - The delimiter used in the file. Applicable to CSV and DSV files. By default, the delimiter is inferred.
   * @param options.skip - The number of lines to skip at the beginning of the file. Applicable to CSV files. Defaults to `0`.
   * @param options.nullPadding - If `true`, when a row has fewer columns than expected, the remaining columns on the right will be padded with `NULL` values. Defaults to `false`.
   * @param options.ignoreErrors - If `true`, parsing errors encountered will be ignored, and rows with errors will be skipped. Defaults to `false`.
   * @param options.compression - The compression type of the file. Applicable to CSV files. Defaults to `none`.
   * @param options.strict - If `true`, an error will be thrown when encountering any issues. If `false`, structurally incorrect files will be parsed tentatively. Defaults to `true`.
   * @param options.encoding - The encoding of the file. Applicable to CSV files. Defaults to `utf-8`.
   * @param options.jsonFormat - The format of JSON files ("unstructured", "newlineDelimited", "array"). By default, the format is inferred.
   * @param options.records - A boolean indicating whether each line in a newline-delimited JSON file represents a record. Applicable to JSON files. By default, it's inferred.
   * @param options.sheet - A string indicating a specific sheet to import from an Excel file. By default, the first sheet is imported.
   * @returns A promise that resolves to the SimpleTable instance after the data has been loaded.
   * @category Importing Data
   *
   * @example
   * ```ts
   * // Load data from a single local CSV file
   * await table.loadData("./some-data.csv");
   * ```
   *
   * @example
   * ```ts
   * // Load data from a remote Parquet file
   * await table.loadData("https://some-website.com/some-data.parquet");
   * ```
   *
   * @example
   * ```ts
   * // Load data from multiple local JSON files
   * await table.loadData([
   *   "./some-data1.json",
   *   "./some-data2.json",
   *   "./some-data3.json"
   * ]);
   * ```
   *
   * @example
   * ```ts
   * // Load data from multiple remote Parquet files with column unification
   * await table.loadData([
   *   "https://some-website.com/some-data1.parquet",
   *   "https://some-website.com/some-data2.parquet",
   *   "https://some-website.com/some-data3.parquet"
   * ], { unifyColumns: true });
   * ```
   */
  async loadData(
    files: string | string[],
    options: {
      fileType?: "csv" | "dsv" | "json" | "parquet" | "excel";
      autoDetect?: boolean;
      limit?: number;
      fileName?: boolean;
      unifyColumns?: boolean;
      columnTypes?: { [key: string]: string };
      // csv options
      header?: boolean;
      allText?: boolean;
      delim?: string;
      skip?: number;
      nullPadding?: boolean;
      ignoreErrors?: boolean;
      compression?: "none" | "gzip" | "zstd";
      encoding?: string;
      strict?: boolean;
      // json options
      jsonFormat?: "unstructured" | "newlineDelimited" | "array";
      records?: boolean;
      // excel options
      sheet?: string;
    } = {},
  ): Promise<SimpleTable> {
    await queryDB(
      this,
      loadDataQuery(this.name, stringToArray(files), options),
      mergeOptions(this, {
        table: this.name,
        method: "loadData()",
        parameters: { files, options },
      }),
    );

    return this;
  }

  /**
   * Loads data from all supported files (CSV, JSON, Parquet, Excel) within a local directory into the table.
   *
   * @param directory - The absolute path to the directory containing the data files.
   * @param options - An optional object with configuration options:
   * @param options.fileType - The type of file to load ("csv", "dsv", "json", "parquet", "excel"). Defaults to being inferred from the file extension.
   * @param options.autoDetect - A boolean indicating whether to automatically detect the data format. Defaults to `true`.
   * @param options.limit - A number indicating the maximum number of rows to load. Defaults to all rows.
   * @param options.fileName - A boolean indicating whether to include the file name as a new column in the loaded data. Defaults to `false`.
   * @param options.unifyColumns - A boolean indicating whether to unify columns across multiple files when their structures differ. Missing columns will be filled with `NULL` values. Defaults to `false`.
   * @param options.columnTypes - An object mapping column names to their expected data types. By default, types are inferred.
   * @param options.header - A boolean indicating whether the file has a header row. Applicable to CSV files. Defaults to `true`.
   * @param options.allText - A boolean indicating whether all columns should be treated as text. Applicable to CSV files. Defaults to `false`.
   * @param options.delim - The delimiter used in the file. Applicable to CSV and DSV files. By default, the delimiter is inferred.
   * @param options.skip - The number of lines to skip at the beginning of the file. Applicable to CSV files. Defaults to `0`.
   * @param options.nullPadding - If `true`, when a row has fewer columns than expected, the remaining columns on the right will be padded with `NULL` values. Defaults to `false`.
   * @param options.ignoreErrors - If `true`, parsing errors encountered will be ignored, and rows with errors will be skipped. Defaults to `false`.
   * @param options.compression - The compression type of the file. Applicable to CSV files. Defaults to `none`.
   * @param options.strict - If `true`, an error will be thrown when encountering any issues. If `false`, structurally incorrect files will be parsed tentatively. Defaults to `true`.
   * @param options.encoding - The encoding of the files. Applicable to CSV files. Defaults to `utf-8`.
   * @param options.jsonFormat - The format of JSON files ("unstructured", "newlineDelimited", "array"). By default, the format is inferred.
   * @param options.records - A boolean indicating whether each line in a newline-delimited JSON file represents a record. Applicable to JSON files. By default, it's inferred.
   * @param options.sheet - A string indicating a specific sheet to import from an Excel file. By default, the first sheet is imported.
   * @returns A promise that resolves to the SimpleTable instance after the data has been loaded.
   * @category Importing Data
   *
   * @example
   * ```ts
   * // Load all supported data files from the "./data/" directory
   * await table.loadDataFromDirectory("./data/");
   * ```
   */
  async loadDataFromDirectory(
    directory: string,
    options: {
      fileType?: "csv" | "dsv" | "json" | "parquet" | "excel";
      autoDetect?: boolean;
      limit?: number;
      fileName?: boolean;
      unifyColumns?: boolean;
      columnTypes?: { [key: string]: string };
      // csv options
      header?: boolean;
      allText?: boolean;
      delim?: string;
      skip?: number;
      nullPadding?: boolean;
      ignoreErrors?: boolean;
      compression?: "none" | "gzip" | "zstd";
      encoding?: "utf-8" | "utf-16" | "latin-1";
      strict?: boolean;
      // json options
      jsonFormat?: "unstructured" | "newlineDelimited" | "array";
      records?: boolean;
      // excel options
      sheet?: string;
    } = {},
  ): Promise<SimpleTable> {
    const files = readdirSync(directory).map(
      (file) =>
        `${directory.slice(-1) === "/" ? directory : directory + "/"}${file}`,
    );
    await queryDB(
      this,
      loadDataQuery(this.name, files, options),
      mergeOptions(this, {
        table: this.name,
        method: "loadDataFromDirectory",
        parameters: { directory, options },
      }),
    );

    return this;
  }

  /**
   * Loads geospatial data from an external file or URL into the table.
   * The coordinates of files or URLs ending with `.json` or `.geojson` are automatically flipped to `[latitude, longitude]` axis order.
   *
   * @param file - The URL or absolute path to the external file containing the geospatial data.
   * @param options - An optional object with configuration options:
   * @param options.toWGS84 - If `true`, the method will attempt to reproject the data to WGS84 with `[latitude, longitude]` axis order. If the file is `.json` or `.geojson`, coordinates are automatically flipped, and this option has no additional effect. Defaults to `false`.
   * @param options.from - An optional string specifying the original projection of the data, if the method is unable to detect it automatically.
   * @returns A promise that resolves to the SimpleTable instance after the geospatial data has been loaded.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Load geospatial data from a URL
   * await table.loadGeoData("https://some-website.com/some-data.geojson");
   * ```
   *
   * @example
   * ```ts
   * // Load geospatial data from a local file
   * await table.loadGeoData("./some-data.geojson");
   * ```
   *
   * @example
   * ```ts
   * // Load geospatial data from a shapefile and reproject to WGS84
   * await table.loadGeoData("./some-data.shp.zip", { toWGS84: true });
   * ```
   */
  async loadGeoData(
    file: string,
    options: { toWGS84?: boolean; from?: string } = {},
  ): Promise<SimpleTable> {
    const fileExtension = getExtension(file);

    if (fileExtension === "geoparquet" || fileExtension === "parquet") {
      await queryDB(
        this,
        `INSTALL spatial; LOAD spatial;${
          file.toLowerCase().includes("http")
            ? " INSTALL https; LOAD https;"
            : ""
        }
              CREATE OR REPLACE TABLE "${this.name}" AS SELECT * FROM read_parquet('${
          cleanPath(file)
        }');`,
        mergeOptions(this, {
          table: this.name,
          method: "loadGeoData()",
          parameters: { file, options },
        }),
      );

      this.projections = await getProjectionParquet(this, file);

      if (options.toWGS84) {
        console.log(
          "\nThis file is a parquet. Option toWGS84 has no effect. Use the .reproject() method instead.\n",
        );
      }
    } else {
      await queryDB(
        this,
        `INSTALL spatial; LOAD spatial;${
          file.toLowerCase().includes("http")
            ? " INSTALL https; LOAD https;"
            : ""
        }
              CREATE OR REPLACE TABLE "${this.name}" AS SELECT * FROM ST_Read('${file}');`,
        mergeOptions(this, {
          table: this.name,
          method: "loadGeoData()",
          parameters: { file, options },
        }),
      );
      // column storing geometries is geom by default
      this.projections["geom"] = await getProjection(this.sdb, file);

      const extension = getExtension(file);
      if (extension === "json" || extension === "geojson") {
        await this.flipCoordinates("geom"); // column storing geometries
        this.projections["geom"] = "+proj=latlong +datum=WGS84 +no_defs";
        if (options.toWGS84) {
          console.log(
            "This file is a json or geojson. Option toWGS84 has no effect.",
          );
        }
      } else if (options.toWGS84) {
        await this.reproject("WGS84", { ...options, column: "geom" }); // column storing geometries is geom by default
      }
    }

    return this;
  }

  /**
   * Applies a prompt to the value of each row in a specified column, storing the AI's response in a new column.
   * This method automatically appends instructions to your prompt; set `verbose` to `true` to see the full prompt.
   *
   * This method supports Google Gemini, Vertex AI, and local models running with Ollama. Credentials and model selection are determined by environment variables (`AI_KEY`, `AI_PROJECT`, `AI_LOCATION`, `AI_MODEL`) or directly via `options`, with `options` taking precedence.
   *
   * For Ollama, set the `OLLAMA` environment variable to `true`, ensure Ollama is running, and set `AI_MODEL` to your desired model name.
   *
   * To manage rate limits, use `batchSize` to process multiple rows per request and `rateLimitPerMinute` to introduce delays between requests. For higher rate limits (business/professional accounts), `concurrent` allows parallel requests.
   *
   * The `cache` option enables local caching of results in `.journalism-cache` (from the `askAI` function in the [journalism library](https://github.com/nshiab/journalism)). Remember to add `.journalism-cache` to your `.gitignore`.
   *
   * If the AI returns fewer items than expected in a batch, or if a custom `test` function fails, the `retry` option (a number greater than 0) will reattempt the request.
   *
   * Temperature is set to 0 for reproducibility, though consistency cannot be guaranteed.
   *
   * This method does not support tables containing geometries.
   *
   * @param column - The name of the column to be used as input for the AI prompt.
   * @param newColumn - The name of the new column where the AI's response will be stored.
   * @param prompt - The input string to guide the AI's response.
   * @param options - Configuration options for the AI request.
   * @param options.batchSize - The number of rows to process in each batch. Defaults to `1`.
   * @param options.concurrent - The number of concurrent requests to send. Defaults to `1`.
   * @param options.cache - If `true`, the results will be cached locally. Defaults to `false`.
   * @param options.test - A function to validate the returned data point. If it throws an error, the request will be retried (if `retry` is set). Defaults to `undefined`.
   * @param options.retry - The number of times to retry the request in case of failure. Defaults to `0`.
   * @param options.rateLimitPerMinute - The rate limit for AI requests in requests per minute. The method will wait between requests if necessary. Defaults to `undefined` (no limit).
   * @param options.model - The AI model to use. Defaults to the `AI_MODEL` environment variable.
   * @param options.apiKey - The API key for the AI service. Defaults to the `AI_KEY` environment variable.
   * @param options.vertex - If `true`, uses Vertex AI. Automatically set to `true` if `AI_PROJECT` and `AI_LOCATION` are set in the environment. Defaults to `false`.
   * @param options.project - The Google Cloud project ID for Vertex AI. Defaults to the `AI_PROJECT` environment variable.
   * @param options.location - The Google Cloud location for Vertex AI. Defaults to the `AI_LOCATION` environment variable.
   * @param options.ollama - If `true`, uses Ollama. Defaults to the `OLLAMA` environment variable.
   * @param options.verbose - If `true`, logs additional debugging information, including the full prompt sent to the AI. Defaults to `false`.
   * @param options.clean - A function to clean the AI's response before testing, caching, and storing. Defaults to `undefined`.
   * @returns A promise that resolves when the AI processing is complete.
   * @category AI
   *
   * @example
   * ```ts
   * // New table with a "name" column.
   * await table.loadArray([
   *   { name: "Marie" },
   *   { name: "John" },
   *   { name: "Alex" },
   * ]);
   *
   * // Ask the AI to categorize names into a new "gender" column.
   * await table.aiRowByRow(
   *   "name",
   *   "gender",
   *   `Guess whether it's a "Man" or a "Woman". If it could be both, return "Neutral".`,
   *   {
   *     cache: true, // Cache results locally
   *     batchSize: 10, // Process 10 rows at once
   *     test: (dataPoint: unknown) => { // Validate AI's response
   *       if (
   *         typeof dataPoint !== "string" ||
   *         !["Man", "Woman", "Neutral"].includes(dataPoint)
   *       ) {
   *         throw new Error(`Invalid response: ${dataPoint}`);
   *       }
   *     },
   *     retry: 3, // Retry up to 3 times on failure
   *     rateLimitPerMinute: 15, // Limit requests to 15 per minute
   *     verbose: true, // Log detailed information
   *   },
   * );
   *
   * // Example results:
   * // [
   * //   { name: "Marie", gender: "Woman" },
   * //   { name: "John", gender: "Man" },
   * //   { name: "Alex", gender: "Neutral" },
   * // ]
   * ```
   */
  async aiRowByRow(
    column: string,
    newColumn: string,
    prompt: string,
    options: {
      batchSize?: number;
      concurrent?: number;
      cache?: boolean;
      test?: (dataPoint: unknown) => void;
      retry?: number;
      model?: string;
      apiKey?: string;
      vertex?: boolean;
      project?: string;
      location?: string;
      ollama?: boolean;
      verbose?: boolean;
      rateLimitPerMinute?: number;
      clean?: (
        response: unknown,
      ) => unknown;
    } = {},
  ): Promise<void> {
    await aiRowByRow(this, column, newColumn, prompt, options);
  }

  /**
   * Generates embeddings for a specified text column and stores the results in a new column.
   *
   * This method supports Google Gemini, Vertex AI, and local models running with Ollama. Credentials and model selection are determined by environment variables (`AI_KEY`, `AI_PROJECT`, `AI_LOCATION`, `AI_EMBEDDINGS_MODEL`) or directly via `options`, with `options` taking precedence.
   *
   * For Ollama, set the `OLLAMA` environment variable to `true`, ensure Ollama is running, and set `AI_EMBEDDINGS_MODEL` to your desired model name.
   *
   * To manage rate limits, use `rateLimitPerMinute` to introduce delays between requests. For higher rate limits (business/professional accounts), `concurrent` allows parallel requests.
   *
   * The `cache` option enables local caching of results in `.journalism-cache` (from the `getEmbedding` function in the [journalism library](https://github.com/nshiab/journalism)). Remember to add `.journalism-cache` to your `.gitignore`.
   *
   * If `createIndex` is `true`, an index will be created on the new column using the [duckdb-vss extension](https://github.com/duckdb/duckdb-vss). This is useful for speeding up the `aiVectorSimilarity` method.
   *
   * This method does not support tables containing geometries.
   *
   * @param column - The name of the column to be used as input for generating embeddings.
   * @param newColumn - The name of the new column where the generated embeddings will be stored.
   * @param options - Configuration options for the AI request.
   * @param options.createIndex - If `true`, an index will be created on the new column. Useful for speeding up the `aiVectorSimilarity` method. Defaults to `false`.
   * @param options.concurrent - The number of concurrent requests to send. Defaults to `1`.
   * @param options.cache - If `true`, the results will be cached locally. Defaults to `false`.
   * @param options.rateLimitPerMinute - The rate limit for AI requests in requests per minute. The method will wait between requests if necessary. Defaults to `undefined` (no limit).
   * @param options.model - The AI model to use. Defaults to the `AI_EMBEDDINGS_MODEL` environment variable.
   * @param options.apiKey - The API key for the AI service. Defaults to the `AI_KEY` environment variable.
   * @param options.vertex - If `true`, uses Vertex AI. Automatically set to `true` if `AI_PROJECT` and `AI_LOCATION` are set in the environment. Defaults to `false`.
   * @param options.project - The Google Cloud project ID for Vertex AI. Defaults to the `AI_PROJECT` environment variable.
   * @param options.location - The Google Cloud location for Vertex AI. Defaults to the `AI_LOCATION` environment variable.
   * @param options.ollama - If `true`, uses Ollama. Defaults to the `OLLAMA` environment variable.
   * @param options.verbose - If `true`, logs additional debugging information. Defaults to `false`.
   * @returns A promise that resolves when the embeddings have been generated and stored.
   * @category AI
   *
   * @example
   * ```ts
   * // New table with a "food" column.
   * await table.loadArray([
   *   { food: "pizza" },
   *   { food: "sushi" },
   *   { food: "burger" },
   *   { food: "pasta" },
   *   { food: "salad" },
   *   { food: "tacos" }
   * ]);
   *
   * // Generate embeddings for the "food" column and store them in a new "embeddings" column.
   * await table.aiEmbeddings("food", "embeddings", {
   *   cache: true, // Cache results locally
   *   rateLimitPerMinute: 15, // Limit requests to 15 per minute
   *   createIndex: true, // Create an index on the new column for faster similarity searches
   *   verbose: true, // Log detailed information
   * });
   * ```
   */
  async aiEmbeddings(column: string, newColumn: string, options: {
    createIndex?: boolean;
    concurrent?: number;
    cache?: boolean;
    model?: string;
    apiKey?: string;
    vertex?: boolean;
    project?: string;
    location?: string;
    ollama?: boolean;
    verbose?: boolean;
    rateLimitPerMinute?: number;
  } = {}): Promise<void> {
    await aiEmbeddings(this, column, newColumn, options);
  }

  /**
   * Creates an embedding from a specified text and returns the most similar text content based on their embeddings.
   * This method is useful for semantic search and text similarity tasks, computing cosine distance and sorting results by similarity.
   *
   * To create the embedding, this method supports Google Gemini, Vertex AI, and local models running with Ollama. Credentials and model selection are determined by environment variables (`AI_KEY`, `AI_PROJECT`, `AI_LOCATION`, `AI_EMBEDDINGS_MODEL`) or directly via `options`, with `options` taking precedence.
   *
   * For Ollama, set the `OLLAMA` environment variable to `true`, ensure Ollama is running, and set `AI_EMBEDDINGS_MODEL` to your desired model name.
   *
   * The `cache` option enables local caching of the specified text's embedding in `.journalism-cache` (from the `getEmbedding` function in the [journalism library](https://github.com/nshiab/journalism)). Remember to add `.journalism-cache` to your `.gitignore`.
   *
   * If `createIndex` is `true`, an index will be created on the embeddings column using the [duckdb-vss extension](https://github.com/duckdb/duckdb-vss) to speed up processing. If the index already exists, it will not be recreated.
   *
   * @param text - The text for which to generate an embedding and find similar content.
   * @param column - The name of the column containing the embeddings to be used for the similarity search.
   * @param nbResults - The number of most similar results to return.
   * @param options - An optional object with configuration options:
   * @param options.createIndex - If `true`, an index will be created on the embeddings column. Defaults to `false`.
   * @param options.outputTable - The name of the output table where the results will be stored. If not provided, the current table will be modified. Defaults to `undefined`.
   * @param options.cache - If `true`, the embedding of the input `text` will be cached locally. Defaults to `false`.
   * @param options.model - The AI model to use for generating the embedding. Defaults to the `AI_EMBEDDINGS_MODEL` environment variable.
   * @param options.apiKey - The API key for the AI service. Defaults to the `AI_KEY` environment variable.
   * @param options.vertex - If `true`, uses Vertex AI. Automatically set to `true` if `AI_PROJECT` and `AI_LOCATION` are set in the environment. Defaults to `false`.
   * @param options.project - The Google Cloud project ID for Vertex AI. Defaults to the `AI_PROJECT` environment variable.
   * @param options.location - The Google Cloud location for Vertex AI. Defaults to the `AI_LOCATION` environment variable.
   * @param options.ollama - If `true`, uses Ollama. Defaults to the `OLLAMA` environment variable.
   * @param options.verbose - If `true`, logs additional debugging information. Defaults to `false`.
   * @returns A promise that resolves to the SimpleTable instance containing the similarity search results.
   * @category AI
   *
   * @example
   * ```ts
   * // New table with a "food" column.
   * await table.loadArray([
   *   { food: "pizza" },
   *   { food: "sushi" },
   *   { food: "burger" },
   *   { food: "pasta" },
   *   { food: "salad" },
   *   { food: "tacos" }
   * ]);
   *
   * // Generate embeddings for the "food" column.
   * await table.aiEmbeddings("food", "embeddings", { cache: true });
   *
   * // Find the 3 most similar foods to "italian food" based on embeddings.
   * const similarFoods = await table.aiVectorSimilarity(
   *   "italian food",
   *   "embeddings",
   *   3,
   *   {
   *     createIndex: true, // Create an index on the embeddings column for faster searches
   *     cache: true, // Cache the embedding of "italian food"
   *   }
   * );
   *
   * // Log the results
   * await similarFoods.logTable();
   * ```
   */
  async aiVectorSimilarity(
    text: string,
    column: string,
    nbResults: number,
    options: {
      createIndex?: boolean;
      outputTable?: string;
      cache?: boolean;
      model?: string;
      apiKey?: string;
      vertex?: boolean;
      project?: string;
      location?: string;
      ollama?: boolean;
      verbose?: boolean;
    } = {},
  ): Promise<SimpleTable> {
    return await aiVectorSimilarity(this, text, column, nbResults, options);
  }

  /**
   * Generates and executes a SQL query based on a prompt.
   * Additional instructions, such as column types, are automatically added to your prompt. Set `verbose` to `true` to see the full prompt.
   *
   * This method supports Google Gemini, Vertex AI, and local models running with Ollama. Credentials and model selection are determined by environment variables (`AI_KEY`, `AI_PROJECT`, `AI_LOCATION`, `AI_MODEL`) or directly via `options`, with `options` taking precedence.
   *
   * For Ollama, set the `OLLAMA` environment variable to `true`, ensure Ollama is running, and set `AI_MODEL` to your desired model name.
   *
   * Temperature is set to 0 to aim for reproducible results. For future consistency, it's recommended to copy the generated query and execute it manually using `await sdb.customQuery(query)` or to cache the query using the `cache` option.
   *
   * When `cache` is `true`, the generated query will be cached locally in `.journalism-cache` (from the `askAI` function in the [journalism library](https://github.com/nshiab/journalism)), saving resources and time. Remember to add `.journalism-cache` to your `.gitignore`.
   *
   * @param prompt - The input string to guide the AI in generating the SQL query.
   * @param options - Configuration options for the AI request.
   * @param options.cache - If `true`, the generated query will be cached locally. Defaults to `false`.
   * @param options.model - The AI model to use. Defaults to the `AI_MODEL` environment variable.
   * @param options.apiKey - The API key for the AI service. Defaults to the `AI_KEY` environment variable.
   * @param options.vertex - If `true`, uses Vertex AI. Automatically set to `true` if `AI_PROJECT` and `AI_LOCATION` are set in the environment. Defaults to `false`.
   * @param options.project - The Google Cloud project ID for Vertex AI. Defaults to the `AI_PROJECT` environment variable.
   * @param options.location - The Google Cloud location for Vertex AI. Defaults to the `AI_LOCATION` environment variable.
   * @param options.verbose - If `true`, logs additional debugging information, including the full prompt sent to the AI. Defaults to `false`.
   * @returns A promise that resolves when the AI query has been executed.
   * @category AI
   *
   * @example
   * ```ts
   * // The AI will generate a query that will be executed, and
   * // the result will replace the existing table.
   * // If run again, it will use the previous query from the cache.
   * // Don't forget to add .journalism-cache to your .gitignore file!
   * await table.aiQuery(
   *    "Give me the average salary by department",
   *     { cache: true, verbose: true }
   * );
   * ```
   */
  async aiQuery(prompt: string, options: {
    cache?: boolean;
    model?: string;
    apiKey?: string;
    vertex?: boolean;
    project?: string;
    location?: string;
    verbose?: boolean;
  } = {}): Promise<void> {
    await aiQuery(this, prompt, options);
  }

  /**
   * Inserts rows, provided as an array of JavaScript objects, into the table.
   *
   * @param rows - An array of objects, where each object represents a row to be inserted and its properties correspond to column names.
   * @returns A promise that resolves when the rows have been inserted.
   * @category Importing Data
   *
   * @example
   * ```ts
   * // Insert new rows into the table
   * const newRows = [
   *   { letter: "c", number: 3 },
   *   { letter: "d", number: 4 }
   * ];
   * await table.insertRows(newRows);
   * ```
   */
  async insertRows(rows: { [key: string]: unknown }[]): Promise<void> {
    await queryDB(
      this,
      insertRowsQuery(this.name, rows),
      mergeOptions(this, {
        table: this.name,
        method: "insertRows()",
        parameters: { rows },
      }),
    );
  }

  /**
   * Inserts all rows from one or more other tables into this table.
   *
   * @param tablesToInsert - The name(s) of the table(s) or SimpleTable instance(s) from which rows will be inserted.
   * @param options - An optional object with configuration options:
   * @param options.unifyColumns - A boolean indicating whether to unify the columns of the tables. If `true`, missing columns in a table will be filled with `NULL` values. Defaults to `false`.
   * @returns A promise that resolves when the rows have been inserted.
   * @category Importing Data
   *
   * @example
   * ```ts
   * // Insert all rows from 'tableB' into 'tableA'.
   * await tableA.insertTables("tableB");
   * ```
   *
   * @example
   * ```ts
   * // Insert all rows from 'tableB' and 'tableC' into 'tableA'.
   * await tableA.insertTables(["tableB", "tableC"]);
   * ```
   *
   * @example
   * ```ts
   * // Insert rows from multiple tables, unifying columns. Missing columns will be filled with NULL.
   * await tableA.insertTables(["tableB", "tableC"], { unifyColumns: true });
   * ```
   */
  async insertTables(
    tablesToInsert: SimpleTable | SimpleTable[],
    options: { unifyColumns?: boolean } = {},
  ): Promise<void> {
    const array = Array.isArray(tablesToInsert)
      ? tablesToInsert
      : [tablesToInsert];

    if (!await this.sdb.hasTable(this.name)) {
      await this.setTypes(
        (await array[0].getTypes()) as {
          [key: string]:
            | "integer"
            | "float"
            | "number"
            | "string"
            | "date"
            | "time"
            | "datetime"
            | "datetimeTz"
            | "bigint"
            | "double"
            | "varchar"
            | "timestamp"
            | "timestamp with time zone"
            | "boolean"
            | "geometry";
        },
      );
      this.projections = structuredClone(array[0].projections);
    }

    // For scoping
    let columnsAdded: {
      [key: string]: string[];
    } = {};
    if (options.unifyColumns) {
      const allTables = [this, ...array];
      columnsAdded = await unifyColumns(allTables);
    }

    await queryDB(
      this,
      array
        .map(
          (tableToInsert) =>
            `INSERT INTO "${this.name}" BY NAME SELECT * FROM "${tableToInsert.name}";`,
        )
        .join("\n"),
      mergeOptions(this, {
        table: this.name,
        method: "insertTables()",
        parameters: { tablesToInsert },
      }),
    );

    if (options.unifyColumns) {
      for (const table of array) {
        const cols = columnsAdded[table.name];
        if (cols) {
          await table.removeColumns(cols);
        }
      }
    }
  }

  /**
   * Returns a new table with the same structure and data as this table. The data can be optionally filtered.
   * Note that cloning large tables can be a slow operation.
   *
   * @param options - An optional object with configuration options:
   * @param options.outputTable - The name of the new table to be created in the database. If not provided, a default name (e.g., "table1", "table2") will be generated.
   * @param options.conditions - A SQL `WHERE` clause condition to filter the data during cloning. Defaults to no condition (clones all rows).
   * @returns A promise that resolves to the new SimpleTable instance containing the cloned data.
   * @category Table Management
   *
   * @example
   * ```ts
   * // Clone tableA to a new table with a default generated name (e.g., "table1")
   * const tableB = await tableA.cloneTable();
   * ```
   *
   * @example
   * ```ts
   * // Clone tableA to a new table named "my_cloned_table"
   * const tableB = await tableA.cloneTable({ outputTable: "my_cloned_table" });
   * ```
   *
   * @example
   * ```ts
   * // Clone tableA, including only rows where 'column1' is greater than 10
   * const tableB = await tableA.cloneTable({ conditions: `column1 > 10` });
   * ```
   */
  async cloneTable(
    options: {
      outputTable?: string;
      conditions?: string;
    } = {},
  ): Promise<SimpleTable> {
    // Should match newTable from SimpleDB
    let clonedTable;
    if (typeof options.outputTable === "string") {
      clonedTable = new SimpleTable(
        options.outputTable,
        structuredClone(this.projections),
        this.sdb,
        {
          debug: this.debug,
          nbRowsToLog: this.nbRowsToLog,
          nbCharactersToLog: this.nbCharactersToLog,
          types: this.types,
        },
      );
      clonedTable.defaultTableName = false;
    } else {
      clonedTable = new SimpleTable(
        `table${this.sdb.tableIncrement}`,
        structuredClone(this.projections),
        this.sdb,
        {
          debug: this.debug,
          nbRowsToLog: this.nbRowsToLog,
          nbCharactersToLog: this.nbCharactersToLog,
          types: this.types,
        },
      );
      clonedTable.defaultTableName = true;
      this.sdb.tableIncrement += 1;
    }

    await queryDB(
      this,
      cloneQuery(this.name, clonedTable.name, options),
      mergeOptions(this, {
        table: clonedTable.name,
        method: "cloneTable()",
        parameters: { options },
      }),
    );

    clonedTable.connection = clonedTable.sdb.connection;
    this.sdb.pushTable(clonedTable);

    return clonedTable;
  }

  /**
   * Clones an existing column in this table, creating a new column with identical values.
   *
   * @param originalColumn - The name of the original column to clone.
   * @param newColumn - The name of the new column to be created.
   * @returns A promise that resolves when the column has been cloned.
   * @category Column Operations
   *
   * @example
   * ```ts
   * // Clone 'firstName' column as 'contactName'
   * await table.cloneColumn("firstName", "contactName");
   * ```
   */
  async cloneColumn(originalColumn: string, newColumn: string): Promise<void> {
    const types = await this.getTypes();

    await queryDB(
      this,
      cloneColumnQuery(this.name, originalColumn, newColumn, types),
      mergeOptions(this, {
        table: this.name,
        method: "cloneColumn()",
        parameters: { originalColumn, newColumn },
      }),
    );

    if (typeof this.projections[originalColumn] === "string") {
      this.projections[newColumn] = this.projections[originalColumn];
    }
  }

  /**
   * Clones a column in the table and offsets its values by a specified number of rows.
   * This is useful for time-series analysis or comparing values across different time points.
   *
   * @param originalColumn - The name of the original column.
   * @param newColumn - The name of the new column to be created with offset values.
   * @param options - An optional object with configuration options:
   * @param options.offset - The number of rows to offset the values. A positive number shifts values downwards (later rows), a negative number shifts values upwards (earlier rows). Defaults to `1`.
   * @param options.categories - A string or an array of strings representing columns to partition the data by. The offset will be applied independently within each category.
   * @returns A promise that resolves when the column has been cloned with offset values.
   * @category Column Operations
   *
   * @example
   * ```ts
   * // Clone 'value' as 'previous_value', offsetting by 1 row (value of row N-1 goes to row N)
   * await table.cloneColumnWithOffset("value", "previous_value");
   * ```
   *
   * @example
   * ```ts
   * // Clone 'sales' as 'sales_2_days_ago', offsetting by 2 rows
   * await table.cloneColumnWithOffset("sales", "sales_2_days_ago", { offset: 2 });
   * ```
   *
   * @example
   * ```ts
   * // Clone 'temperature' as 'prev_temp_by_city', offsetting by 1 row within each 'city' category
   * await table.cloneColumnWithOffset("temperature", "prev_temp_by_city", {
   *   offset: 1,
   *   categories: "city",
   * });
   * ```
   *
   * @example
   * ```ts
   * // Clone 'stock_price' as 'prev_price_by_stock_and_exchange', offsetting by 1 row within each 'stock_symbol' and 'exchange' category
   * await table.cloneColumnWithOffset("stock_price", "prev_price_by_stock_and_exchange", {
   *   offset: 1,
   *   categories: ["stock_symbol", "exchange"],
   * });
   * ```
   */
  async cloneColumnWithOffset(
    originalColumn: string,
    newColumn: string,
    options: {
      offset?: number;
      categories?: string | string[];
    } = {},
  ): Promise<void> {
    const offset = options.offset ?? 1;
    const categories = options.categories
      ? stringToArray(options.categories)
      : [];
    const partition = categories.length > 0
      ? `PARTITION BY ${categories.map((d) => `"${d}"`).join(", ")}`
      : "";

    await queryDB(
      this,
      `CREATE OR REPLACE TABLE "${this.name}" AS SELECT *, LEAD("${originalColumn}", ${offset}) OVER(${partition}) AS "${newColumn}" FROM "${this.name}"${
        categories.length > 0
          ? ` ORDER BY ${categories.map((d) => `"${d}"`).join(", ")}`
          : ""
      };`,
      mergeOptions(this, {
        table: this.name,
        method: "cloneColumnWithOffset()",
        parameters: { originalColumn, newColumn },
      }),
    );

    if (typeof this.projections[originalColumn] === "string") {
      this.projections[newColumn] = this.projections[originalColumn];
    }
  }

  /**
   * Fills `NULL` values in specified columns with the last non-`NULL` value from the preceding row.
   *
   * @param columns - The column(s) for which to fill `NULL` values.
   * @returns A promise that resolves when the `NULL` values have been filled.
   * @category Updating Data
   *
   * @example
   * ```ts
   * // Fill NULL values in 'column1' with the previous non-NULL value
   * await table.fill("column1");
   * ```
   *
   * @example
   * ```ts
   * // Fill NULL values in multiple columns
   * await table.fill(["columnA", "columnB"]);
   * ```
   */
  async fill(columns: string | string[]): Promise<void> {
    await queryDB(
      this,
      stringToArray(columns)
        .map(
          (col) =>
            `CREATE OR REPLACE TABLE "${this.name}" AS SELECT * EXCLUDE(${col}), COALESCE(${col}, LAG(${col} IGNORE NULLS) OVER()) as ${col} FROM "${this.name}";`,
        )
        .join("\n"),
      mergeOptions(this, {
        table: this.name,
        method: "fill()",
        parameters: { columns },
      }),
    );
  }

  /**
   * Sorts the rows of the table based on specified column(s) and order(s).
   * If no columns are specified, all columns are sorted from left to right in ascending order.
   *
   * @param order - An object mapping column names to their sorting order: `"asc"` for ascending or `"desc"` for descending. If `null`, all columns are sorted ascendingly.
   * @param options - An optional object with configuration options:
   * @param options.lang - An object mapping column names to language codes for collation (e.g., `{ column1: "fr" }`). See DuckDB Collations documentation for more details: https://duckdb.org/docs/sql/expressions/collations.
   * @returns A promise that resolves when the table has been sorted.
   * @category Restructuring Data
   *
   * @example
   * ```ts
   * // Sort all columns from left to right in ascending order
   * await table.sort();
   * ```
   *
   * @example
   * ```ts
   * // Sort 'column1' in ascending order
   * await table.sort({ column1: "asc" });
   * ```
   *
   * @example
   * ```ts
   * // Sort 'column1' ascendingly, then 'column2' descendingly
   * await table.sort({ column1: "asc", column2: "desc" });
   * ```
   *
   * @example
   * ```ts
   * // Sort 'column1' considering French accents
   * await table.sort({ column1: "asc" }, { lang: { column1: "fr" } });
   * ```
   */
  async sort(
    order: { [key: string]: "asc" | "desc" } | null = null,
    options: {
      lang?: { [key: string]: string };
    } = {},
  ): Promise<void> {
    await queryDB(
      this,
      sortQuery(this.name, order, options),
      mergeOptions(this, {
        table: this.name,
        method: "sort()",
        parameters: { order, options },
      }),
    );
  }

  /**
   * Selects specific columns in the table, removing all others.
   *
   * @param columns - The name or an array of names of the columns to be selected.
   * @returns A promise that resolves when the columns have been selected.
   * @category Selecting or Filtering Data
   *
   * @example
   * ```ts
   * // Select only the 'firstName' and 'lastName' columns, removing all other columns.
   * await table.selectColumns(["firstName", "lastName"]);
   * ```
   *
   * @example
   * ```ts
   * // Select only the 'productName' column.
   * await table.selectColumns("productName");
   * ```
   */
  async selectColumns(columns: string | string[]): Promise<void> {
    await queryDB(
      this,
      `CREATE OR REPLACE TABLE "${this.name}" AS SELECT ${
        stringToArray(
          columns,
        )
          .map((d) => `"${d}"`)
          .join(", ")
      } FROM "${this.name}"`,
      mergeOptions(this, {
        table: this.name,
        method: "selectColumns()",
        parameters: { columns },
      }),
    );
  }

  /**
   * Skips the first `n` rows of the table, effectively removing them.
   *
   * @param nbRowsToSkip - The number of rows to skip from the beginning of the table.
   * @returns A promise that resolves when the rows have been skipped.
   * @category Selecting or Filtering Data
   *
   * @example
   * ```ts
   * // Skip the first 10 rows of the table
   * await table.skip(10);
   * ```
   */
  async skip(nbRowsToSkip: number): Promise<void> {
    await queryDB(
      this,
      `CREATE OR REPLACE TABLE "${this.name}" AS SELECT * FROM "${this.name}" OFFSET ${nbRowsToSkip} ROWS;`,
      mergeOptions(this, {
        table: this.name,
        method: "skip()",
        parameters: { nbRowsToSkip },
      }),
    );
  }

  /**
   * Checks if a column with the specified name exists in the table.
   *
   * @param column - The name of the column to check.
   * @returns A promise that resolves to `true` if the column exists, `false` otherwise.
   * @category Column Operations
   *
   * @example
   * ```ts
   * // Check if the table has a column named "age"
   * const hasAgeColumn = await table.hasColumn("age");
   * console.log(hasAgeColumn); // Output: true or false
   * ```
   */
  async hasColumn(column: string): Promise<boolean> {
    const columns = await this.getColumns();
    return columns.includes(column);
  }

  /**
   * Selects random rows from the table, removing all others. You can optionally specify a seed to ensure repeatable sampling.
   *
   * @param quantity - The number of rows to select (e.g., `100`) or a percentage string (e.g., `"10%"`) specifying the sampling size.
   * @param options - An optional object with configuration options:
   * @param options.seed - A number specifying the seed for repeatable sampling. Using the same seed will always yield the same random rows. Defaults to a random seed.
   * @returns A promise that resolves when the sampling is complete.
   * @category Selecting or Filtering Data
   *
   * @example
   * ```ts
   * // Select 100 random rows from the table
   * await table.sample(100);
   * ```
   *
   * @example
   * ```ts
   * // Select 10% of the rows randomly
   * await table.sample("10%");
   * ```
   *
   * @example
   * ```ts
   * // Select random rows with a specific seed for repeatable results
   * await table.sample("10%", { seed: 123 });
   * ```
   */
  async sample(
    quantity: number | string,
    options: {
      seed?: number;
    } = {},
  ): Promise<void> {
    await queryDB(
      this,
      `CREATE OR REPLACE TABLE "${this.name}" AS SELECT * FROM "${this.name}" USING SAMPLE RESERVOIR(${
        typeof quantity === "number" ? `${quantity} ROWS` : quantity
      })${
        typeof options.seed === "number" ? ` REPEATABLE(${options.seed})` : ""
      }`,
      mergeOptions(this, {
        table: this.name,
        method: "sample()",
        parameters: { quantity, options },
      }),
    );
  }

  /**
   * Selects a specified number of rows from this table. An offset can be applied to skip initial rows, and the results can be output to a new table.
   *
   * @param count - The number of rows to select.
   * @param options - An optional object with configuration options:
   * @param options.offset - The number of rows to skip from the beginning of the table before selecting. Defaults to `0`.
   * @param options.outputTable - If `true`, the selected rows will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be modified. Defaults to `false`.
   * @returns A promise that resolves to the SimpleTable instance containing the selected rows (either the modified current table or a new table).
   * @category Selecting or Filtering Data
   *
   * @example
   * ```ts
   * // Select the first 100 rows of the current table
   * await table.selectRows(100);
   * ```
   *
   * @example
   * ```ts
   * // Select 100 rows after skipping the first 50 rows
   * await table.selectRows(100, { offset: 50 });
   * ```
   *
   * @example
   * ```ts
   * // Select 50 rows and store them in a new table with a generated name
   * const newTable = await table.selectRows(50, { outputTable: true });
   * ```
   *
   * @example
   * ```ts
   * // Select 75 rows and store them in a new table named "top_customers"
   * const topCustomersTable = await table.selectRows(75, { outputTable: "top_customers" });
   * ```
   */
  async selectRows(
    count: number | string,
    options: { offset?: number; outputTable?: string | boolean } = {},
  ): Promise<SimpleTable> {
    if (options.outputTable === true) {
      options.outputTable = `table${this.sdb.tableIncrement}`;
      this.sdb.tableIncrement += 1;
    }
    await queryDB(
      this,
      selectRowsQuery(this.name, count, options),
      mergeOptions(this, {
        table: typeof options.outputTable === "string"
          ? options.outputTable
          : this.name,
        method: "selectRows",
        parameters: { count, options },
      }),
    );

    if (typeof options.outputTable === "string") {
      return this.sdb.newTable(options.outputTable, this.projections);
    } else {
      return this;
    }
  }

  /**
   * Removes duplicate rows from this table, keeping only unique rows.
   * Note that the resulting data order might differ from the original.
   *
   * @param options - An optional object with configuration options:
   * @param options.on - A column name or an array of column names to consider when identifying duplicates. If specified, duplicates are determined based only on the values in these columns. If omitted, all columns are considered.
   * @returns A promise that resolves when the duplicate rows have been removed.
   * @category Selecting or Filtering Data
   *
   * @example
   * ```ts
   * // Remove duplicate rows based on all columns
   * await table.removeDuplicates();
   * ```
   *
   * @example
   * ```ts
   * // Remove duplicate rows based only on the 'email' column
   * await table.removeDuplicates({ on: "email" });
   * ```
   *
   * @example
   * ```ts
   * // Remove duplicate rows based on 'firstName' and 'lastName' columns
   * await table.removeDuplicates({ on: ["firstName", "lastName"] });
   * ```
   */
  async removeDuplicates(
    options: {
      on?: string | string[];
    } = {},
  ): Promise<void> {
    await queryDB(
      this,
      removeDuplicatesQuery(this.name, options),
      mergeOptions(this, {
        table: this.name,
        method: "removeDuplicates()",
        parameters: { options },
      }),
    );
  }

  /**
   * Removes rows with missing values from this table.
   * By default, missing values include SQL `NULL`, as well as string representations like `"NULL"`, `"null"`, `"NaN"`, `"undefined"`, and empty strings `""`.
   *
   * @param options - An optional object with configuration options:
   * @param options.columns - A string or an array of strings specifying the columns to consider for missing values. If omitted, all columns are considered.
   * @param options.missingValues - An array of values to be treated as missing values instead of the default ones. Defaults to `["undefined", "NaN", "null", "NULL", ""]`.
   * @param options.invert - A boolean indicating whether to invert the condition. If `true`, only rows containing missing values will be kept. Defaults to `false`.
   * @returns A promise that resolves when the rows with missing values have been removed.
   * @category Selecting or Filtering Data
   *
   * @example
   * ```ts
   * // Remove rows with missing values in any column
   * await table.removeMissing();
   * ```
   *
   * @example
   * ```ts
   * // Remove rows with missing values only in 'firstName' or 'lastName' columns
   * await table.removeMissing({ columns: ["firstName", "lastName"] });
   * ```
   *
   * @example
   * ```ts
   * // Keep only rows with missing values in any column
   * await table.removeMissing({ invert: true });
   * ```
   *
   * @example
   * ```ts
   * // Remove rows where 'age' is missing or is equal to -1
   * await table.removeMissing({ columns: "age", missingValues: [-1] });
   * ```
   */
  async removeMissing(
    options: {
      columns?: string | string[];
      missingValues?: (string | number)[];
      invert?: boolean;
    } = {},
  ): Promise<void> {
    await removeMissing(this, options);
  }

  /**
   * Trims specified characters from the beginning, end, or both sides of string values in the given columns.
   *
   * @param columns - The column name or an array of column names to trim.
   * @param options - An optional object with configuration options:
   * @param options.character - The string to trim. Defaults to whitespace characters.
   * @param options.method - The trimming method to apply: `"leftTrim"` (removes from the beginning), `"rightTrim"` (removes from the end), or `"trim"` (removes from both sides). Defaults to `"trim"`.
   * @returns A promise that resolves when the trimming operation is complete.
   * @category Updating Data
   *
   * @example
   * ```ts
   * // Trim whitespace from 'column1'
   * await table.trim("column1");
   * ```
   *
   * @example
   * ```ts
   * // Trim leading and trailing asterisks from 'productCode'
   * await table.trim("productCode", { character: "*" });
   * ```
   *
   * @example
   * ```ts
   * // Right-trim whitespace from 'description' and 'notes' columns
   * await table.trim(["description", "notes"], { method: "rightTrim" });
   * ```
   */
  async trim(
    columns: string | string[],
    options: {
      character?: string;
      method?: "leftTrim" | "rightTrim" | "trim";
    } = {},
  ): Promise<void> {
    options.method = options.method ?? "trim";
    await queryDB(
      this,
      trimQuery(this.name, stringToArray(columns), options),
      mergeOptions(this, {
        table: this.name,
        method: "trim()",
        parameters: { columns, options },
      }),
    );
  }

  /**
   * Filters rows from this table based on SQL conditions. Note that it's often faster to use the `removeRows` method for simple removals.
   * You can also use JavaScript syntax for conditions (e.g., `&&`, `||`, `===`, `!==`).
   *
   * @param conditions - The filtering conditions specified as a SQL `WHERE` clause (e.g., `"column1 > 10 AND column2 = 'value'"`).
   * @returns A promise that resolves when the rows have been filtered.
   * @category Selecting or Filtering Data
   *
   * @example
   * ```ts
   * // Keep only rows where the 'fruit' column is not 'apple'
   * await table.filter(`fruit != 'apple'`);
   * ```
   *
   * @example
   * ```ts
   * // Keep rows where 'price' is greater than 100 AND 'quantity' is greater than 0
   * await table.filter(`price > 100 && quantity > 0`); // Using JS syntax
   * ```
   *
   * @example
   * ```ts
   * // Keep rows where 'category' is 'Electronics' OR 'Appliances'
   * await table.filter(`category === 'Electronics' || category === 'Appliances'`); // Using JS syntax
   * ```
   *
   * @example
   * ```ts
   * // Keep rows where 'lastPurchaseDate' is on or after '2023-01-01'
   * await table.filter(`lastPurchaseDate >= '2023-01-01'`);
   * ```
   */
  async filter(conditions: string): Promise<void> {
    await queryDB(
      this,
      `CREATE OR REPLACE TABLE "${this.name}" AS SELECT *
        FROM "${this.name}"
        WHERE ${conditions}`,
      mergeOptions(this, {
        table: this.name,
        method: "filter()",
        parameters: { conditions },
      }),
    );
  }

  /**
   * Keeps rows in this table that have specific values in specified columns, removing all other rows.
   *
   * @param columnsAndValues - An object where keys are column names and values are the specific values (or an array of values) to keep in those columns.
   * @returns A promise that resolves when the rows have been filtered.
   * @category Selecting or Filtering Data
   *
   * @example
   * ```ts
   * // Keep only rows where 'job' is 'accountant' or 'developer', AND 'city' is 'Montreal'
   * await table.keep({ job: ["accountant", "developer"], city: "Montreal" });
   * ```
   *
   * @example
   * ```ts
   * // Keep only rows where 'status' is 'active'
   * await table.keep({ status: "active" });
   * ```
   */
  async keep(
    columnsAndValues: {
      [key: string]:
        | (number | string | Date | boolean | null)[]
        | (number | string | Date | boolean | null);
    },
  ): Promise<void> {
    await queryDB(
      this,
      keepQuery(this.name, columnsAndValues),
      mergeOptions(this, {
        table: this.name,
        method: "keep()",
        parameters: { columnsAndValues },
      }),
    );
  }

  /**
   * Removes rows from this table that have specific values in specified columns.
   *
   * @param columnsAndValues - An object where keys are column names and values are the specific values (or an array of values) to remove from those columns.
   * @returns A promise that resolves when the rows have been removed.
   * @category Selecting or Filtering Data
   *
   * @example
   * ```ts
   * // Remove rows where 'job' is 'accountant' or 'developer', AND 'city' is 'Montreal'
   * await table.remove({ job: ["accountant", "developer"], city: "Montreal" });
   * ```
   *
   * @example
   * ```ts
   * // Remove rows where 'status' is 'inactive'
   * await table.remove({ status: "inactive" });
   * ```
   */
  async remove(
    columnsAndValues: {
      [key: string]:
        | (number | string | Date | boolean | null)[]
        | (number | string | Date | boolean | null);
    },
  ): Promise<void> {
    await queryDB(
      this,
      removeQuery(this.name, columnsAndValues),
      mergeOptions(this, {
        table: this.name,
        method: "remove()",
        parameters: { columnsAndValues },
      }),
    );
  }

  /**
   * Removes rows from this table based on SQL conditions. This method is similar to `filter()`, but removes rows instead of keeping them.
   * You can also use JavaScript syntax for conditions (e.g., `&&`, `||`, `===`, `!==`).
   *
   * @param conditions - The filtering conditions specified as a SQL `WHERE` clause (e.g., `"fruit = 'apple'"`).
   * @returns A promise that resolves when the rows have been removed.
   * @category Selecting or Filtering Data
   *
   * @example
   * ```ts
   * // Remove rows where the 'fruit' column is 'apple'
   * await table.removeRows(`fruit = 'apple'`);
   * ```
   *
   * @example
   * ```ts
   * // Remove rows where 'quantity' is less than 5
   * await table.removeRows(`quantity < 5`);
   * ```
   *
   * @example
   * ```ts
   * // Remove rows where 'price' is less than 100 AND 'quantity' is 0
   * await table.removeRows(`price < 100 && quantity === 0`); // Using JS syntax
   * ```
   *
   * @example
   * ```ts
   * // Remove rows where 'category' is 'Electronics' OR 'Appliances'
   * await table.removeRows(`category === 'Electronics' || category === 'Appliances'`); // Using JS syntax
   * ```
   */
  async removeRows(conditions: string): Promise<void> {
    await queryDB(
      this,
      `DELETE FROM "${this.name}" WHERE ${conditions}`,
      mergeOptions(this, {
        table: this.name,
        method: "removeRows()",
        parameters: { conditions },
      }),
    );
  }

  /**
   * Renames one or more columns in the table.
   *
   * @param names - An object mapping old column names to their new column names (e.g., `{ "oldName": "newName", "anotherOld": "anotherNew" }`).
   * @returns A promise that resolves when the columns have been renamed.
   * @category Column Operations
   *
   * @example
   * ```ts
   * // Rename "How old?" to "age" and "Man or woman?" to "sex"
   * await table.renameColumns({ "How old?": "age", "Man or woman?": "sex" });
   * ```
   *
   * @example
   * ```ts
   * // Rename a single column
   * await table.renameColumns({ "product_id": "productId" });
   * ```
   */
  async renameColumns(names: { [key: string]: string }): Promise<void> {
    const oldNames = Object.keys(names);
    const newNames = Object.values(names);

    await queryDB(
      this,
      renameColumnQuery(this.name, oldNames, newNames),
      mergeOptions(this, {
        table: this.name,
        method: "renameColumns()",
        parameters: { names },
      }),
    );

    // Taking care of projections
    const types = await this.getTypes();
    for (let i = 0; i < newNames.length; i++) {
      if (types[newNames[i]] === "GEOMETRY") {
        const projection = this.projections[oldNames[i]];
        delete this.projections[oldNames[i]];
        this.projections[newNames[i]] = projection;
      }
    }
  }

  /**
   * Cleans column names by removing non-alphanumeric characters and formatting them to camel case.
   *
   * @returns A promise that resolves when the column names have been cleaned.
   * @category Column Operations
   *
   * @example
   * ```ts
   * // Clean all column names in the table
   * // e.g., "First Name" becomes "firstName", "Product ID" becomes "productId"
   * await table.cleanColumnNames();
   * ```
   */
  async cleanColumnNames(): Promise<void> {
    const columns = await this.getColumns();
    const obj: { [key: string]: string } = {};
    for (const col of columns) {
      obj[col] = camelCase(col);
    }
    await this.renameColumns(obj);
  }

  /**
   * Restructures this table by stacking (unpivoting) columns. This is useful for tidying up data from a wide format to a long format.
   *
   * For example, given a table showing employee counts per department per year:
   *
   * | Department | 2021 | 2022 | 2023 |
   * | :--------- | :--- | :--- | :--- |
   * | Accounting | 10   | 9    | 15   |
   * | Sales      | 52   | 75   | 98   |
   *
   * We can restructure it by putting all year columns into a new column named `Year` and their corresponding employee counts into a new column named `Employees`.
   *
   * @example
   * ```ts
   * // Restructure the table by stacking year columns into 'year' and 'employees'
   * await table.longer(["2021", "2022", "2023"], "year", "employees");
   * ```
   *
   * The table will then look like this:
   *
   * | Department | Year | Employees |
   * | :--------- | :--- | :-------- |
   * | Accounting | 2021 | 10        |
   * | Accounting | 2022 | 9         |
   * | Accounting | 2023 | 15        |
   * | Sales      | 2021 | 52        |
   * | Sales      | 2022 | 75        |
   * | Sales      | 2023 | 98        |
   *
   * @param columns - An array of strings representing the names of the columns to be stacked (unpivoted).
   * @param columnsTo - The name of the new column that will contain the original column names (e.g., "Year").
   * @param valuesTo - The name of the new column that will contain the values from the stacked columns (e.g., "Employees").
   * @returns A promise that resolves when the table has been restructured.
   * @category Restructuring Data
   */
  async longer(
    columns: string[],
    columnsTo: string,
    valuesTo: string,
  ): Promise<void> {
    await queryDB(
      this,
      `CREATE OR REPLACE TABLE "${this.name}" AS SELECT * FROM (
            FROM "${this.name}" UNPIVOT INCLUDE NULLS (
            "${valuesTo}"
            for "${columnsTo}" in (${columns.map((d) => `"${d}"`).join(", ")})
            )
        )`,
      mergeOptions(this, {
        table: this.name,
        method: "longer()",
        parameters: { columns, columnsTo, valuesTo },
      }),
    );
  }

  /**
   * Restructures this table by unstacking (pivoting) values, transforming data from a long format to a wide format.
   *
   * For example, given a table showing employee counts per department per year:
   *
   * | Department | Year | Employees |
   * | :--------- | :--- | :-------- |
   * | Accounting | 2021 | 10        |
   * | Accounting | 2022 | 9         |
   * | Accounting | 2023 | 15        |
   * | Sales      | 2021 | 52        |
   * | Sales      | 2022 | 75        |
   * | Sales      | 2023 | 98        |
   *
   * We can restructure it by creating new columns for each year, with the associated employee counts as values.
   *
   * @example
   * ```ts
   * // Restructure the table by pivoting 'Year' into new columns with 'Employees' as values
   * await table.wider("Year", "Employees");
   * ```
   *
   * The table will then look like this:
   *
   * | Department | 2021 | 2022 | 2023 |
   * | :--------- | :--- | :--- | :--- |
   * | Accounting | 10   | 9    | 15   |
   * | Sales      | 52   | 75   | 98   |
   *
   * @param columnsFrom - The name of the column containing the values that will be transformed into new column headers (e.g., "Year").
   * @param valuesFrom - The name of the column containing the values to be spread across the new columns (e.g., "Employees").
   * @returns A promise that resolves when the table has been restructured.
   * @category Restructuring Data
   */
  async wider(columnsFrom: string, valuesFrom: string): Promise<void> {
    await queryDB(
      this,
      `CREATE OR REPLACE TABLE "${this.name}" AS SELECT * FROM (PIVOT "${this.name}" ON "${columnsFrom}" USING sum("${valuesFrom}"));`,
      mergeOptions(this, {
        table: this.name,
        method: "wider()",
        parameters: { columnsFrom, valuesFrom },
      }),
    );
  }

  /**
   * Converts data types of specified columns to target types (JavaScript or SQL types).
   *
   * When converting timestamps, dates, or times to/from strings, you must provide a `datetimeFormat` option using [DuckDB's format specifiers](https://duckdb.org/docs/sql/functions/dateformat).
   *
   * When converting timestamps, dates, or times to/from numbers, the numerical representation will be in milliseconds since the Unix epoch (1970-01-01 00:00:00 UTC).
   *
   * When converting strings to numbers, commas (often used as thousand separators) will be automatically removed before conversion.
   *
   * @param types - An object mapping column names to their target data types for conversion.
   * @param options - An optional object with configuration options:
   * @param options.try - If `true`, values that cannot be converted will be replaced by `NULL` instead of throwing an error. Defaults to `false`.
   * @param options.datetimeFormat - A string specifying the format for date and time conversions. Uses `strftime` and `strptime` functions from DuckDB. For format specifiers, see [DuckDB's documentation](https://duckdb.org/docs/sql/functions/dateformat).
   * @returns A promise that resolves when the column types have been converted.
   * @category Updating Data
   *
   * @example
   * ```ts
   * // Convert 'column1' to string and 'column2' to integer (JavaScript types)
   * await table.convert({ column1: "string", column2: "integer" });
   * ```
   *
   * @example
   * ```ts
   * // Convert 'column1' to VARCHAR and 'column2' to BIGINT (SQL types)
   * await table.convert({ column1: "varchar", column2: "bigint" });
   * ```
   *
   * @example
   * ```ts
   * // Convert strings in 'column3' to datetime using a specific format
   * await table.convert({ column3: "datetime" }, { datetimeFormat: "%Y-%m-%d" });
   * ```
   *
   * @example
   * ```ts
   * // Convert datetime values in 'column3' to strings using a specific format
   * await table.convert({ column3: "string" }, { datetimeFormat: "%Y-%m-%d %H:%M:%S" });
   * ```
   *
   * @example
   * ```ts
   * // Convert 'amount' to float, replacing unconvertible values with NULL
   * await table.convert({ amount: "float" }, { try: true });
   * ```
   */
  async convert(
    types: {
      [key: string]:
        | "integer"
        | "float"
        | "number"
        | "string"
        | "date"
        | "time"
        | "datetime"
        | "datetimeTz"
        | "bigint"
        | "double"
        | "varchar"
        | "timestamp"
        | "timestamp with time zone"
        | "boolean";
    },
    options: {
      try?: boolean;
      datetimeFormat?: string;
    } = {},
  ): Promise<void> {
    const allTypes = await this.getTypes();
    const allColumns = Object.keys(allTypes);

    for (const col in types) {
      if (!allColumns.includes(col)) {
        throw new Error(
          `The column ${col} does not exist in the table.`,
        );
      }
    }

    await queryDB(
      this,
      convertQuery(
        this.name,
        Object.keys(types),
        Object.values(types),
        allColumns,
        allTypes,
        options,
      ),
      mergeOptions(this, {
        table: this.name,
        method: "convert()",
        parameters: { types, options },
      }),
    );
  }

  /**
   * Removes the table from the database. After this operation, invoking methods on this SimpleTable instance will result in an error.
   *
   * @returns A promise that resolves when the table has been removed.
   * @category Table Management
   *
   * @example
   * ```ts
   * // Remove the current table from the database
   * await table.removeTable();
   * ```
   */
  async removeTable(): Promise<void> {
    await queryDB(
      this,
      `DROP TABLE "${this.name}";`,
      mergeOptions(this, {
        table: null,
        method: "removeTable()",
        parameters: {},
      }),
    );

    this.sdb.tables = this.sdb.tables.filter(
      (t) => t.name !== this.name,
    );
  }

  /**
   * Removes one or more columns from this table.
   *
   * @param columns - The name or an array of names of the columns to be removed.
   * @returns A promise that resolves when the columns have been removed.
   * @category Column Operations
   *
   * @example
   * ```ts
   * // Remove 'column1' and 'column2' from the table
   * await table.removeColumns(["column1", "column2"]);
   * ```
   *
   * @example
   * ```ts
   * // Remove a single column named 'tempColumn'
   * await table.removeColumns("tempColumn");
   * ```
   */
  async removeColumns(columns: string | string[]): Promise<void> {
    const cols = stringToArray(columns);
    await queryDB(
      this,
      cols.map((d) => `ALTER TABLE "${this.name}" DROP "${d}";`).join("\n"),
      mergeOptions(this, {
        table: this.name,
        method: "removeColumns()",
        parameters: { columns },
      }),
    );

    // Taking care of projections
    for (const col of cols) {
      if (Object.prototype.hasOwnProperty.call(this.projections, col)) {
        delete this.projections[col];
      }
    }
  }

  /**
   * Adds a new column to the table based on a specified data type (JavaScript or SQL types) and a SQL definition.
   *
   * @param newColumn - The name of the new column to be added.
   * @param type - The data type for the new column. Can be a JavaScript type (e.g., `"number"`, `"string"`) or a SQL type (e.g., `"integer"`, `"varchar"`).
   * @param definition - A SQL expression defining how the values for the new column should be computed (e.g., `"column1 + column2"`, `"ST_Centroid(geom_column)"`).
   * @param options - An optional object with configuration options:
   * @param options.projection - Required if the new column stores geometries. Specifies the geospatial projection of the new geometry column. You can reuse the projection of an existing geometry column (available in `table.projections`).
   * @returns A promise that resolves when the new column has been added.
   * @category Column Operations
   *
   * @example
   * ```ts
   * // Add a new column 'total' as a float, calculated from 'column1' and 'column2'
   * await table.addColumn("total", "float", "column1 + column2");
   * ```
   *
   * @example
   * ```ts
   * // Add a new geometry column 'centroid' using the centroid of an existing 'country' geometry column
   * // The projection of the new 'centroid' column is set to be the same as 'country'.
   * await table.addColumn("centroid", "geometry", `ST_Centroid("country")`, {
   *   projection: table.projections.country,
   * });
   * ```
   */
  async addColumn(
    newColumn: string,
    type:
      | "integer"
      | "float"
      | "number"
      | "string"
      | "date"
      | "time"
      | "datetime"
      | "datetimeTz"
      | "bigint"
      | "double"
      | "varchar"
      | "timestamp"
      | "timestamp with time zone"
      | "boolean"
      | "geometry",
    definition: string,
    options: { projection?: string } = {},
  ): Promise<void> {
    const newType = parseType(type);
    await queryDB(
      this,
      `ALTER TABLE "${this.name}" ADD "${newColumn}" ${newType};
        UPDATE "${this.name}" SET "${newColumn}" = ${definition}`,
      mergeOptions(this, {
        table: this.name,
        method: "addColumn()",
        parameters: { newColumn, type, definition },
      }),
    );
    if (newType === "GEOMETRY") {
      if (typeof options.projection === "string") {
        this.projections[newColumn] = options.projection;
      } else {
        throw new Error(
          "You are creating a new column storing geometries. You must specify a projection. See examples in documentation.",
        );
      }
    }
  }

  /**
   * Adds a new column to the table containing the row number.
   *
   * @param newColumn - The name of the new column that will store the row number.
   * @returns A promise that resolves when the row number column has been added.
   * @category Column Operations
   *
   * @example
   * ```ts
   * // Add a new column named 'rowNumber' with the row number for each row
   * await table.addRowNumber("rowNumber");
   * ```
   */
  async addRowNumber(newColumn: string): Promise<void> {
    await queryDB(
      this,
      `CREATE OR REPLACE TABLE "${this.name}" AS SELECT *, ROW_NUMBER() OVER() AS ${newColumn} FROM "${this.name}"`,
      mergeOptions(this, {
        table: this.name,
        method: "addRowNumber()",
        parameters: { newColumn },
      }),
    );
  }

  /**
   * Performs a cross join operation with another table. A cross join returns the Cartesian product of the rows from both tables, meaning all possible pairs of rows will be in the resulting table.
   * This means that if the left table has `n` rows and the right table has `m` rows, the result will have `n * m` rows.
   *
   * @param rightTable - The SimpleTable instance to cross join with.
   * @param options - An optional object with configuration options:
   * @param options.outputTable - If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.
   * @returns A promise that resolves to the SimpleTable instance containing the cross-joined data (either the modified current table or a new table).
   * @category Table Operations
   *
   * @example
   * ```ts
   * // Perform a cross join with 'tableB', overwriting the current table (tableA)
   * await tableA.crossJoin(tableB);
   * ```
   *
   * @example
   * ```ts
   * // Perform a cross join with 'tableB' and store the results in a new table with a generated name
   * const tableC = await tableA.crossJoin(tableB, { outputTable: true });
   * ```
   *
   * @example
   * ```ts
   * // Perform a cross join with 'tableB' and store the results in a new table named 'tableC'
   * const tableC = await tableA.crossJoin(tableB, { outputTable: "tableC" });
   * ```
   */
  async crossJoin(
    rightTable: SimpleTable,
    options: {
      outputTable?: string | boolean;
    } = {},
  ): Promise<SimpleTable> {
    const identicalColumns = getIdenticalColumns(
      await this.getColumns(),
      await rightTable.getColumns(),
    );
    if (identicalColumns.length > 0) {
      throw new Error(
        `The tables have columns with identical names. Rename or remove ${
          identicalColumns.map((d) => `"${d}"`).join(", ")
        } in one of the two tables before doing the cross join.`,
      );
    }

    if (options.outputTable === true) {
      options.outputTable = `table${this.sdb.tableIncrement}`;
      this.sdb.tableIncrement += 1;
    }
    await queryDB(
      this,
      crossJoinQuery(this.name, rightTable.name, options),
      mergeOptions(this, {
        table: typeof options.outputTable === "string"
          ? options.outputTable
          : this.name,
        method: "crossJoin()",
        parameters: { rightTable, options },
      }),
    );

    const allProjections = {
      ...this.projections,
      ...rightTable.projections,
    };
    if (typeof options.outputTable === "string") {
      return this.sdb.newTable(options.outputTable, allProjections);
    } else {
      this.projections = allProjections;
      return this;
    }
  }

  /**
   * Merges the data of this table (considered the left table) with another table (the right table) based on a common column or multiple columns.
   * Note that the order of rows in the returned data is not guaranteed to be the same as in the original tables.
   * This operation might create temporary files in a `.tmp` folder; consider adding `.tmp` to your `.gitignore`.
   *
   * @param rightTable - The SimpleTable instance to be joined with this table.
   * @param options - An optional object with configuration options:
   * @param options.commonColumn - The common column(s) used for the join operation. If omitted, the method automatically searches for a column name that exists in both tables. Can be a single string or an array of strings for multiple join keys.
   * @param options.type - The type of join operation to perform. Possible values are `"inner"`, `"left"` (default), `"right"`, or `"full"`.
   * @param options.outputTable - If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.
   * @returns A promise that resolves to the SimpleTable instance containing the joined data (either the modified current table or a new table).
   * @category Table Operations
   *
   * @example
   * ```ts
   * // Perform a left join with 'tableB' on a common column (auto-detected), overwriting tableA
   * await tableA.join(tableB);
   * ```
   *
   * @example
   * ```ts
   * // Perform an inner join with 'tableB' on the 'id' column, storing results in a new table named 'tableC'
   * const tableC = await tableA.join(tableB, { commonColumn: 'id', type: 'inner', outputTable: "tableC" });
   * ```
   *
   * @example
   * ```ts
   * // Perform a join on multiple columns ('name' and 'category')
   * await tableA.join(tableB, { commonColumn: ['name', 'category'] });
   * ```
   */

  async join(
    rightTable: SimpleTable,
    options: {
      commonColumn?: string | string[];
      type?: "inner" | "left" | "right" | "full";
      outputTable?: string | boolean;
    } = {},
  ): Promise<SimpleTable> {
    if (options.outputTable === true) {
      options.outputTable = `table${this.sdb.tableIncrement}`;
      this.sdb.tableIncrement += 1;
    }
    return (await join(this, rightTable, options)) as SimpleTable;
  }

  /**
   * Replaces specified strings in the selected columns.
   *
   * @param columns - The column name or an array of column names where string replacements will occur.
   * @param strings - An object mapping old strings to new strings (e.g., `{ "oldValue": "newValue" }`).
   * @param options - An optional object with configuration options:
   * @param options.entireString - A boolean indicating whether the entire cell content must match the `oldString` for replacement to occur. Defaults to `false` (replaces substrings).
   * @param options.regex - A boolean indicating whether the `oldString` should be treated as a regular expression for global replacement. Cannot be used with `entireString: true`. Defaults to `false`.
   * @returns A promise that resolves when the string replacements are complete.
   * @category Updating Data
   *
   * @example
   * ```ts
   * // Replace all occurrences of "kilograms" with "kg" in 'column1'
   * await table.replace("column1", { "kilograms": "kg" });
   * ```
   *
   * @example
   * ```ts
   * // Replace "kilograms" with "kg" and "liters" with "l" in 'column1' and 'column2'
   * await table.replace(["column1", "column2"], { "kilograms": "kg", "liters": "l" });
   * ```
   *
   * @example
   * ```ts
   * // Replace only if the entire string in 'column1' is "kilograms"
   * await table.replace("column1", { "kilograms": "kg" }, { entireString: true });
   * ```
   *
   * @example
   * ```ts
   * // Replace any sequence of one or more digits with a hyphen in 'column1' using regex
   * await table.replace("column1", { "\d+": "-" }, { regex: true });
   * ```
   */
  async replace(
    columns: string | string[],
    strings: { [key: string]: string },
    options: {
      entireString?: boolean;
      regex?: boolean;
    } = {},
  ): Promise<void> {
    options.entireString = options.entireString ?? false;
    options.regex = options.regex ?? false;
    if (options.entireString === true && options.regex === true) {
      throw new Error(
        "You can't have entireString to true and regex to true at the same time. Pick one.",
      );
    }
    await queryDB(
      this,
      replaceQuery(
        this.name,
        stringToArray(columns),
        Object.keys(strings),
        Object.values(strings),
        options,
      ),
      mergeOptions(this, {
        table: this.name,
        method: "replace()",
        parameters: { columns, strings, options },
      }),
    );
  }

  /**
   * Converts string values in the specified columns to lowercase.
   *
   * @param columns - The column name or an array of column names to be converted to lowercase.
   * @returns A promise that resolves when the strings have been converted to lowercase.
   * @category Updating Data
   *
   * @example
   * ```ts
   * // Convert strings in 'column1' to lowercase
   * await table.lower("column1");
   * ```
   *
   * @example
   * ```ts
   * // Convert strings in 'column1' and 'column2' to lowercase
   * await table.lower(["column1", "column2"]);
   * ```
   */
  async lower(columns: string | string[]): Promise<void> {
    await queryDB(
      this,
      lowerQuery(this.name, stringToArray(columns)),
      mergeOptions(this, {
        table: this.name,
        method: "lower()",
        parameters: { columns },
      }),
    );
  }

  /**
   * Converts string values in the specified columns to uppercase.
   *
   * @param columns - The column name or an array of column names to be converted to uppercase.
   * @returns A promise that resolves when the strings have been converted to uppercase.
   * @category Updating Data
   *
   * @example
   * ```ts
   * // Convert strings in 'column1' to uppercase
   * await table.upper("column1");
   * ```
   *
   * @example
   * ```ts
   * // Convert strings in 'column1' and 'column2' to uppercase
   * await table.upper(["column1", "column2"]);
   * ```
   */
  async upper(columns: string | string[]): Promise<void> {
    await queryDB(
      this,
      upperQuery(this.name, stringToArray(columns)),
      mergeOptions(this, {
        table: this.name,
        method: "upper()",
        parameters: { columns },
      }),
    );
  }

  /**
   * Capitalizes the first letter of each string in the specified columns and converts the rest of the string to lowercase.
   *
   * @param columns - The column name or an array of column names to be capitalized.
   * @returns A promise that resolves when the strings have been capitalized.
   * @category Updating Data
   *
   * @example
   * ```ts
   * // Capitalize strings in 'column1' (e.g., "hello world" becomes "Hello world")
   * await table.capitalize("column1");
   * ```
   *
   * @example
   * ```ts
   * // Capitalize strings in 'column1' and 'column2'
   * await table.capitalize(["column1", "column2"]);
   * ```
   */
  async capitalize(columns: string | string[]): Promise<void> {
    await queryDB(
      this,
      capitalizeQuery(this.name, stringToArray(columns)),
      mergeOptions(this, {
        table: this.name,
        method: "upper()",
        parameters: { columns },
      }),
    );
  }

  /**
   * Splits strings in a specified column by a separator and extracts a substring at a given index, storing the result in a new or existing column.
   * If the index is out of bounds, an empty string will be returned for that row.
   *
   * @param column - The name of the column containing the strings to be split.
   * @param separator - The substring to use as a delimiter for splitting the strings.
   * @param index - The zero-based index of the substring to extract after splitting. For example, `0` for the first part, `1` for the second, etc.
   * @param newColumn - The name of the column where the extracted substrings will be stored. To overwrite the original column, use the same name as `column`.
   * @returns A promise that resolves when the strings have been split and extracted.
   * @category Updating Data
   *
   * @example
   * ```ts
   * // Split 'address' by comma and extract the second part (index 1) into a new 'city' column
   * // e.g., "123 Main St, Anytown, USA" -> "Anytown"
   * await table.splitExtract("address", ",", 1, "city");
   * ```
   *
   * @example
   * ```ts
   * // Split 'fileName' by dot and extract the first part (index 0), overwriting 'fileName'
   * // e.g., "document.pdf" -> "document"
   * await table.splitExtract("fileName", ".", 0, "fileName");
   * ```
   */
  async splitExtract(
    column: string,
    separator: string,
    index: number,
    newColumn: string,
  ): Promise<void> {
    await queryDB(
      this,
      `${
        column === newColumn
          ? ""
          : `ALTER TABLE "${this.name}" ADD "${newColumn}" VARCHAR;`
      }
      UPDATE "${this.name}" SET "${newColumn}" = SPLIT_PART("${column}", '${separator}', ${
        index + 1
      })`,
      mergeOptions(this, {
        table: this.name,
        method: "splitExtract()",
        parameters: { column, separator, index, newColumn },
      }),
    );
  }

  /**
   * Extracts a specific number of characters from the beginning (left side) of string values in the specified column.
   *
   * @param column - The name of the column containing the strings to be modified.
   * @param numberOfCharacters - The number of characters to extract from the left side of each string.
   * @returns A promise that resolves when the strings have been updated.
   * @category Updating Data
   *
   * @example
   * ```ts
   * // Replace strings in 'productCode' with their first two characters
   * // e.g., "ABC-123" becomes "AB"
   * await table.left("productCode", 2);
   * ```
   */
  async left(column: string, numberOfCharacters: number): Promise<void> {
    await queryDB(
      this,
      `UPDATE "${this.name}" SET "${column}" = LEFT("${column}", ${numberOfCharacters})`,
      mergeOptions(this, {
        table: this.name,
        method: "left()",
        parameters: { column, numberOfCharacters },
      }),
    );
  }

  /**
   * Extracts a specific number of characters from the end (right side) of string values in the specified column.
   *
   * @param column - The name of the column containing the strings to be modified.
   * @param numberOfCharacters - The number of characters to extract from the right side of each string.
   * @returns A promise that resolves when the strings have been updated.
   * @category Updating Data
   *
   * @example
   * ```ts
   * // Replace strings in 'productCode' with their last two characters
   * // e.g., "ABC-123" becomes "23"
   * await table.right("productCode", 2);
   * ```
   */
  async right(column: string, numberOfCharacters: number): Promise<void> {
    await queryDB(
      this,
      `UPDATE "${this.name}" SET "${column}" = RIGHT("${column}", ${numberOfCharacters})`,
      mergeOptions(this, {
        table: this.name,
        method: "right()",
        parameters: { column, numberOfCharacters },
      }),
    );
  }

  /**
   * Replaces `NULL` values in the specified columns with a given value.
   *
   * @param columns - The column name or an array of column names in which to replace `NULL` values.
   * @param value - The value to replace `NULL` occurrences with.
   * @returns A promise that resolves when the `NULL` values have been replaced.
   * @category Updating Data
   *
   * @example
   * ```ts
   * // Replace NULL values in 'column1' with 0
   * await table.replaceNulls("column1", 0);
   * ```
   *
   * @example
   * ```ts
   * // Replace NULL values in 'columnA' and 'columnB' with the string "N/A"
   * await table.replaceNulls(["columnA", "columnB"], "N/A");
   * ```
   *
   * @example
   * ```ts
   * // Replace NULL values in 'dateColumn' with a specific date
   * await table.replaceNulls("dateColumn", new Date("2023-01-01"));
   * ```
   */
  async replaceNulls(
    columns: string | string[],
    value: number | string | Date | boolean,
  ): Promise<void> {
    await queryDB(
      this,
      replaceNullsQuery(this.name, stringToArray(columns), value),
      mergeOptions(this, {
        table: this.name,
        method: "replaceNulls()",
        parameters: { columns, value },
      }),
    );
  }

  /**
   * Concatenates values from specified columns into a new column.
   *
   * @param columns - An array of column names whose values will be concatenated.
   * @param newColumn - The name of the new column to store the concatenated values.
   * @param options - An optional object with configuration options:
   * @param options.separator - The string used to separate concatenated values. Defaults to an empty string (`""`).
   * @returns A promise that resolves when the concatenation is complete.
   * @category Updating Data
   *
   * @example
   * ```ts
   * // Concatenate 'firstName' and 'lastName' into a new 'fullName' column
   * await table.concatenate(["firstName", "lastName"], "fullName");
   * ```
   *
   * @example
   * ```ts
   * // Concatenate 'city' and 'country' into 'location', separated by a comma and space
   * await table.concatenate(["city", "country"], "location", { separator: ", " });
   * ```
   */
  async concatenate(
    columns: string[],
    newColumn: string,
    options: {
      separator?: string;
    } = {},
  ): Promise<void> {
    await queryDB(
      this,
      concatenateQuery(this.name, columns, newColumn, options),
      mergeOptions(this, {
        table: this.name,
        method: "concatenate()",
        parameters: { columns, newColumn, options },
      }),
    );
  }

  /**
   * Rounds numeric values in specified columns.
   *
   * @param columns - The column name or an array of column names containing numeric values to be rounded.
   * @param options - An optional object with configuration options:
   * @param options.decimals - The number of decimal places to round to. Defaults to `0` (rounds to the nearest integer).
   * @param options.method - The rounding method to use: `"round"` (rounds to the nearest integer, with halves rounding up), `"ceiling"` (rounds up to the nearest integer), or `"floor"` (rounds down to the nearest integer). Defaults to `"round"`.
   * @returns A promise that resolves when the numeric values have been rounded.
   * @category Updating Data
   *
   * @example
   * ```ts
   * // Round 'column1' values to the nearest integer
   * await table.round("column1");
   * ```
   *
   * @example
   * ```ts
   * // Round 'column1' values to 2 decimal places
   * await table.round("column1", { decimals: 2 });
   * ```
   *
   * @example
   * ```ts
   * // Round 'column1' values down to the nearest integer (floor)
   * await table.round("column1", { method: "floor" });
   * ```
   *
   * @example
   * ```ts
   * // Round 'columnA' and 'columnB' values to 1 decimal place using ceiling method
   * await table.round(["columnA", "columnB"], { decimals: 1, method: "ceiling" });
   * ```
   */
  async round(
    columns: string | string[],
    options: {
      decimals?: number;
      method?: "round" | "ceiling" | "floor";
    } = {},
  ): Promise<void> {
    await queryDB(
      this,
      roundQuery(this.name, stringToArray(columns), options),
      mergeOptions(this, {
        table: this.name,
        method: "round()",
        parameters: { columns, options },
      }),
    );
  }

  /**
   * Updates values in a specified column using a SQL expression.
   *
   * @param column - The name of the column to be updated.
   * @param definition - The SQL expression used to set the new values in the column (e.g., `"column1 * 2"`, `"UPPER(column_name)"`).
   * @returns A promise that resolves when the column has been updated.
   * @category Updating Data
   *
   * @example
   * ```ts
   * // Update 'column1' with the left 5 characters of 'column2'
   * await table.updateColumn("column1", `LEFT(column2, 5)`);
   * ```
   *
   * @example
   * ```ts
   * // Double the values in 'price' column
   * await table.updateColumn("price", `price * 2`);
   * ```
   *
   * @example
   * ```ts
   * // Set 'status' to 'active' where 'isActive' is true
   * await table.updateColumn("status", `CASE WHEN isActive THEN 'active' ELSE 'inactive' END`);
   * ```
   */
  async updateColumn(column: string, definition: string): Promise<void> {
    await queryDB(
      this,
      `UPDATE "${this.name}" SET "${column}" = ${definition}`,
      mergeOptions(this, {
        table: this.name,
        method: "updateColumn()",
        parameters: { column, definition },
      }),
    );
  }

  /**
   * Assigns ranks to rows in a new column based on the values of a specified column.
   *
   * @param values - The column containing the values to be used for ranking.
   * @param newColumn - The name of the new column where the ranks will be stored.
   * @param options - An optional object with configuration options:
   * @param options.order - The order of values for ranking: `"asc"` for ascending (default) or `"desc"` for descending.
   * @param options.categories - The column name or an array of column names that define categories for ranking. Ranks will be assigned independently within each category.
   * @param options.noGaps - A boolean indicating whether to assign ranks without gaps (dense ranking). If `true`, ranks will be consecutive integers (e.g., 1, 2, 2, 3). If `false` (default), ranks might have gaps (e.g., 1, 2, 2, 4).
   * @returns A promise that resolves when the ranks have been assigned.
   * @category Analyzing Data
   *
   * @example
   * ```ts
   * // Compute ranks in a new 'rank' column based on 'score' values (ascending)
   * await table.ranks("score", "rank");
   * ```
   *
   * @example
   * ```ts
   * // Compute ranks in a new 'descRank' column based on 'score' values (descending)
   * await table.ranks("score", "descRank", { order: "desc" });
   * ```
   *
   * @example
   * ```ts
   * // Compute ranks within 'department' categories, based on 'salary' values, without gaps
   * await table.ranks("salary", "salaryRank", { categories: "department", noGaps: true });
   * ```
   *
   * @example
   * ```ts
   * // Compute ranks within multiple categories ('department' and 'city')
   * await table.ranks("sales", "salesRank", { categories: ["department", "city"] });
   * ```
   */
  async ranks(
    values: string,
    newColumn: string,
    options: {
      order?: "asc" | "desc";
      categories?: string | string[];
      noGaps?: boolean;
    } = {},
  ): Promise<void> {
    await queryDB(
      this,
      ranksQuery(this.name, values, newColumn, options),
      mergeOptions(this, {
        table: this.name,
        method: "ranks()",
        parameters: { values, newColumn, options },
      }),
    );
  }

  /**
   * Assigns quantiles to rows in a new column based on specified column values.
   *
   * @param values - The column containing values from which quantiles will be assigned.
   * @param nbQuantiles - The number of quantiles to divide the data into (e.g., `4` for quartiles, `10` for deciles).
   * @param newColumn - The name of the new column where the assigned quantiles will be stored.
   * @param options - An optional object with configuration options:
   * @param options.categories - The column name or an array of column names that define categories for computing quantiles. Quantiles will be assigned independently within each category.
   * @returns A promise that resolves when the quantiles have been assigned.
   * @category Analyzing Data
   *
   * @example
   * ```ts
   * // Assigns a quantile from 1 to 10 for each row in a new 'quantiles' column, based on 'column1' values.
   * await table.quantiles("column1", 10, "quantiles");
   * ```
   *
   * @example
   * ```ts
   * // Assigns quantiles within 'column2' categories, based on 'column1' values.
   * await table.quantiles("column1", 10, "quantiles", { categories: "column2" });
   * ```
   *
   * @example
   * ```ts
   * // Assigns quartiles (4 quantiles) to 'sales' data, storing results in 'salesQuartile'
   * await table.quantiles("sales", 4, "salesQuartile");
   * ```
   */
  async quantiles(
    values: string,
    nbQuantiles: number,
    newColumn: string,
    options: {
      categories?: string | string[];
    } = {},
  ): Promise<void> {
    await queryDB(
      this,
      quantilesQuery(this.name, values, nbQuantiles, newColumn, options),
      mergeOptions(this, {
        table: this.name,
        method: "quantiles()",
        parameters: {
          values,
          nbQuantiles,
          newColumn,
          options,
        },
      }),
    );
  }

  /**
   * Assigns bins for specified column values based on an interval size.
   *
   * @param values - The column containing values from which bins will be computed.
   * @param interval - The interval size for binning the values.
   * @param newColumn - The name of the new column where the bins will be stored.
   * @param options - An optional object with configuration options:
   * @param options.startValue - The starting value for binning. Defaults to the minimum value in the specified column.
   * @returns A promise that resolves when the bins have been assigned.
   * @category Analyzing Data
   *
   * @example
   * ```ts
   * // Assigns a bin for each row in a new 'bins' column based on 'column1' values, with an interval of 10.
   * // If the minimum value in 'column1' is 5, the bins will follow this pattern: "[5-14]", "[15-24]", etc.
   * await table.bins("column1", 10, "bins");
   * ```
   *
   * @example
   * ```ts
   * // Assigns bins starting at a specific value (0) with an interval of 10.
   * // The bins will follow this pattern: "[0-9]", "[10-19]", "[20-29]", etc.
   * await table.bins("column1", 10, "bins", { startValue: 0 });
   * ```
   */
  async bins(
    values: string,
    interval: number,
    newColumn: string,
    options: {
      startValue?: number;
    } = {},
  ): Promise<void> {
    await queryDB(
      this,
      await binsQuery(this, values, interval, newColumn, options),
      mergeOptions(this, {
        table: this.name,
        method: "bins()",
        parameters: {
          values,
          interval,
          newColumn,
          options,
        },
      }),
    );
  }

  /**
   * Computes proportions horizontally across specified columns for each row.
   *
   * For example, given a table showing counts of men, women, and non-binary individuals per year:
   *
   * | Year | Men | Women | NonBinary |
   * | :--- | :-- | :---- | :-------- |
   * | 2021 | 564 | 685   | 145       |
   * | 2022 | 354 | 278   | 56        |
   * | 2023 | 856 | 321   | 221       |
   *
   * This method computes the proportion of men, women, and non-binary individuals on each row, adding new columns for these proportions.
   *
   * @example
   * ```ts
   * // Compute horizontal proportions for 'Men', 'Women', and 'NonBinary' columns, rounded to 2 decimal places
   * await table.proportionsHorizontal(["Men", "Women", "NonBinary"], { decimals: 2 });
   * ```
   *
   * The table will then look like this:
   *
   * | Year | Men | Women | NonBinary | MenPerc | WomenPerc | NonBinaryPerc |
   * | :--- | :-- | :---- | :-------- | :------ | :-------- | :------------ |
   * | 2021 | 564 | 685   | 145       | 0.4     | 0.49      | 0.10          |
   * | 2022 | 354 | 278   | 56        | 0.51    | 0.4       | 0.08          |
   * | 2023 | 856 | 321   | 221       | 0.61    | 0.23      | 0.16          |
   *
   * By default, the new columns will be named with a suffix of `"Perc"`. You can customize this suffix using the `suffix` option.
   *
   * @example
   * ```ts
   * // Compute horizontal proportions with a custom suffix "Prop"
   * await table.proportionsHorizontal(["Men", "Women", "NonBinary"], { suffix: "Prop", decimals: 2 });
   * ```
   *
   * The table will then look like this:
   *
   * | Year | Men | Women | NonBinary | MenProp | WomenProp | NonBinaryProp |
   * | :--- | :-- | :---- | :-------- | :------ | :-------- | :------------ |
   * | 2021 | 564 | 685   | 145       | 0.4     | 0.49      | 0.10          |
   * | 2022 | 354 | 278   | 56        | 0.51    | 0.4       | 0.08          |
   * | 2023 | 856 | 321   | 221       | 0.61    | 0.23      | 0.16          |
   *
   * @param columns - An array of column names for which proportions will be computed on each row.
   * @param options - An optional object with configuration options:
   * @param options.suffix - A string suffix to append to the names of the new columns storing the computed proportions. Defaults to `"Perc"`.
   * @param options.decimals - The number of decimal places to round the computed proportions. Defaults to `undefined` (no rounding).
   * @returns A promise that resolves when the horizontal proportions have been computed.
   * @category Analyzing Data
   */
  async proportionsHorizontal(
    columns: string[],
    options: {
      suffix?: string;
      decimals?: number;
    } = {},
  ): Promise<void> {
    await queryDB(
      this,
      proportionsHorizontalQuery(this.name, columns, options),
      mergeOptions(this, {
        table: this.name,
        method: "proportionsHorizontal()",
        parameters: {
          columns,
          options,
        },
      }),
    );
  }

  /**
   * Computes proportions vertically over a column's values, relative to the sum of all values in that column (or within specified categories).
   *
   * @param column - The column containing values for which proportions will be computed. The proportions are calculated based on the sum of values in the specified column.
   * @param newColumn - The name of the new column where the proportions will be stored.
   * @param options - An optional object with configuration options:
   * @param options.categories - The column name or an array of column names that define categories for computing proportions. Proportions will be calculated independently within each category.
   * @param options.decimals - The number of decimal places to round the computed proportions. Defaults to `undefined` (no rounding).
   * @returns A promise that resolves when the vertical proportions have been computed.
   * @category Analyzing Data
   *
   * @example
   * ```ts
   * // Add a new column 'perc' with each 'column1' value divided by the sum of all 'column1' values
   * await table.proportionsVertical("column1", "perc");
   * ```
   *
   * @example
   * ```ts
   * // Compute proportions for 'column1' within 'column2' categories, rounded to two decimal places
   * await table.proportionsVertical("column1", "perc", { categories: "column2", decimals: 2 });
   * ```
   *
   * @example
   * ```ts
   * // Compute proportions for 'sales' within 'region' and 'product_type' categories
   * await table.proportionsVertical("sales", "sales_proportion", { categories: ["region", "product_type"] });
   * ```
   */
  async proportionsVertical(
    column: string,
    newColumn: string,
    options: {
      categories?: string | string[];
      decimals?: number;
    } = {},
  ): Promise<void> {
    await queryDB(
      this,
      proportionsVerticalQuery(this.name, column, newColumn, options),
      mergeOptions(this, {
        table: this.name,
        method: "proportionsVertical()",
        parameters: {
          column,
          newColumn,
          options,
        },
      }),
    );
  }

  /**
   * Creates a summary table based on specified values, categories, and summary operations.
   * This method allows you to aggregate data, calculate statistics (e.g., count, mean, sum), and group results by categorical columns.
   *
   * @param options - An object with configuration options for summarization:
   * @param options.values - The column name or an array of column names whose values will be summarized. If omitted, all columns will be summarized.
   * @param options.categories - The column name or an array of column names that define categories for the summarization. Results will be grouped by these categories.
   * @param options.summaries - The summary operations to be performed. Can be a single operation (e.g., `"mean"`), an array of operations (e.g., `["min", "max"]`), or an object mapping new column names to operations (e.g., `{ avgSalary: "mean" }`). Supported operations include: `"count"`, `"countUnique"`, `"countNull"`, `"min"`, `"max"`, `"mean"`, `"median"`, `"sum"`, `"skew"`, `"stdDev"`, `"var"`.
   * @param options.decimals - The number of decimal places to round the summarized values. Defaults to `undefined` (no rounding).
   * @param options.outputTable - If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.
   * @param options.toMs - If `true`, timestamps, dates, and times will be converted to milliseconds before summarizing. This is useful when summarizing mixed data types (numbers and dates) as values must be of the same type for aggregation.
   * @param options.noColumnValue - If `true`, the default `value` column will be removed. This option only works when summarizing a single column without categories. Defaults to `false`.
   * @returns A promise that resolves to the SimpleTable instance containing the summarized data (either the modified current table or a new table).
   * @category Analyzing Data
   *
   * @example
   * ```ts
   * // Summarize all columns with all available summary operations, overwriting the current table
   * const columns = await table.getColumns();
   * await table.summarize({ values: columns });
   * ```
   *
   * @example
   * ```ts
   * // Summarize all columns and store the results in a new table with a generated name
   * const columns = await table.getColumns();
   * const summaryTable = await table.summarize({ values: columns, outputTable: true });
   * ```
   *
   * @example
   * ```ts
   * // Summarize all columns and store the results in a new table named 'mySummary'
   * const columns = await table.getColumns();
   * const mySummaryTable = await table.summarize({ values: columns, outputTable: "mySummary" });
   * ```
   *
   * @example
   * ```ts
   * // Summarize a single column ('sales') with all available summary operations
   * await table.summarize({ values: "sales" });
   * ```
   *
   * @example
   * ```ts
   * // Summarize multiple columns ('sales' and 'profit') with all available summary operations
   * await table.summarize({ values: ["sales", "profit"] });
   * ```
   *
   * @example
   * ```ts
   * // Summarize 'sales' by 'region' (single category)
   * await table.summarize({ values: "sales", categories: "region" });
   * ```
   *
   * @example
   * ```ts
   * // Summarize 'sales' by 'region' and 'product_type' (multiple categories)
   * await table.summarize({ values: "sales", categories: ["region", "product_type"] });
   * ```
   *
   * @example
   * ```ts
   * // Summarize 'sales' by 'region' with a specific summary operation (mean)
   * await table.summarize({ values: "sales", categories: "region", summaries: "mean" });
   * ```
   *
   * @example
   * ```ts
   * // Summarize 'sales' by 'region' with specific summary operations (mean and sum)
   * await table.summarize({ values: "sales", categories: "region", summaries: ["mean", "sum"] });
   * ```
   *
   * @example
   * ```ts
   * // Summarize 'sales' by 'region' with custom named summary operations
   * await table.summarize({ values: "sales", categories: "region", summaries: { averageSales: "mean", totalSales: "sum" } });
   * ```
   *
   * @example
   * ```ts
   * // Summarize 'price' and 'cost', rounding aggregated values to 2 decimal places
   * await table.summarize({ values: ["price", "cost"], decimals: 2 });
   * ```
   *
   * @example
   * ```ts
   * // Summarize 'timestamp_column' by converting to milliseconds first
   * await table.summarize({ values: "timestamp_column", toMs: true, summaries: "mean" });
   * ```
   *
   * @example
   * ```ts
   * // Summarize a single column 'value_column' without the default 'value' column in the output
   * await table.summarize({ values: "value_column", noColumnValue: true });
   * ```
   */
  async summarize(
    options: {
      values?: string | string[];
      categories?: string | string[];
      summaries?:
        | (
          | "count"
          | "countUnique"
          | "countNull"
          | "min"
          | "max"
          | "mean"
          | "median"
          | "sum"
          | "skew"
          | "stdDev"
          | "var"
        )
        | (
          | "count"
          | "countUnique"
          | "countNull"
          | "min"
          | "max"
          | "mean"
          | "median"
          | "sum"
          | "skew"
          | "stdDev"
          | "var"
        )[]
        | {
          [key: string]:
            | "count"
            | "countUnique"
            | "countNull"
            | "min"
            | "max"
            | "mean"
            | "median"
            | "sum"
            | "skew"
            | "stdDev"
            | "var";
        };
      decimals?: number;
      outputTable?: string | boolean;
      toMs?: boolean;
      noColumnValue?: boolean;
    } = {},
  ): Promise<SimpleTable> {
    if (options.outputTable === true) {
      options.outputTable = `table${this.sdb.tableIncrement}`;
      this.sdb.tableIncrement += 1;
    }
    await summarize(this, options);
    if (typeof options.outputTable === "string") {
      return this.sdb.newTable(options.outputTable, this.projections);
    } else {
      return this;
    }
  }

  /**
   * Computes the cumulative sum of values in a column. For this method to work properly, ensure your data is sorted first.
   *
   * @param column - The name of the column storing the values to be accumulated.
   * @param newColumn - The name of the new column in which the computed cumulative values will be stored.
   * @param options - An optional object with configuration options:
   * @param options.categories - The column name or an array of column names that define categories for the accumulation. Accumulation will be performed independently within each category.
   * @returns A promise that resolves when the cumulative sum has been computed.
   * @category Analyzing Data
   *
   * @example
   * ```ts
   * // Compute the cumulative sum of 'sales' in a new 'cumulativeSales' column
   * // Ensure the table is sorted by a relevant column (e.g., date) before calling this method.
   * await table.accumulate("sales", "cumulativeSales");
   * ```
   *
   * @example
   * ```ts
   * // Compute the cumulative sum of 'orders' within 'customer_id' categories
   * // Ensure the table is sorted by 'customer_id' and then by a relevant order column (e.g., order_date).
   * await table.accumulate("orders", "cumulativeOrders", { categories: "customer_id" });
   * ```
   *
   * @example
   * ```ts
   * // Compute the cumulative sum of 'revenue' within 'region' and 'product_category' categories
   * await table.accumulate("revenue", "cumulativeRevenue", { categories: ["region", "product_category"] });
   * ```
   */
  async accumulate(
    column: string,
    newColumn: string,
    options: {
      categories?: string | string[];
    } = {},
  ): Promise<void> {
    await queryDB(
      this,
      accumulateQuery(this.name, column, newColumn, options),
      mergeOptions(this, {
        table: this.name,
        method: "accumulate()",
        parameters: { column, newColumn, options },
      }),
    );
  }

  /**
   * Computes rolling aggregations (e.g., rolling average, min, max) over a specified column.
   * For rows without enough preceding or following rows to form a complete window, `NULL` will be returned.
   * For this method to work properly, ensure your data is sorted by the relevant column(s) first.
   *
   * @param column - The name of the column storing the values to be aggregated.
   * @param newColumn - The name of the new column in which the computed rolling values will be stored.
   * @param summary - The aggregation function to apply: `"min"`, `"max"`, `"mean"`, `"median"`, or `"sum"`.
   * @param preceding - The number of preceding rows to include in the rolling window.
   * @param following - The number of following rows to include in the rolling window.
   * @param options - An optional object with configuration options:
   * @param options.categories - The column name or an array of column names that define categories for the aggregation. Rolling aggregations will be computed independently within each category.
   * @param options.decimals - The number of decimal places to round the aggregated values. Defaults to `undefined` (no rounding).
   * @returns A promise that resolves when the rolling aggregation is complete.
   * @category Analyzing Data
   *
   * @example
   * ```ts
   * // Compute a 7-day rolling average of 'sales' with 3 preceding and 3 following rows
   * // (total window size of 7: 3 preceding + current + 3 following)
   * await table.rolling("sales", "rollingAvgSales", "mean", 3, 3);
   * ```
   *
   * @example
   * ```ts
   * // Compute a rolling sum of 'transactions' within 'customer_id' categories
   * await table.rolling("transactions", "rollingSumTransactions", "sum", 5, 0, { categories: "customer_id" });
   * ```
   *
   * @example
   * ```ts
   * // Compute a rolling maximum of 'temperature' rounded to 1 decimal place
   * await table.rolling("temperature", "rollingMaxTemp", "max", 2, 2, { decimals: 1 });
   * ```
   */
  async rolling(
    column: string,
    newColumn: string,
    summary: "min" | "max" | "mean" | "median" | "sum",
    preceding: number,
    following: number,
    options: {
      categories?: string | string[];
      decimals?: number;
    } = {},
  ): Promise<void> {
    await queryDB(
      this,
      rollingQuery(
        this.name,
        column,
        newColumn,
        summary,
        preceding,
        following,
        options,
      ),
      mergeOptions(this, {
        table: this.name,
        method: "rolling()",
        parameters: {
          column,
          newColumn,
          summary,
          preceding,
          following,
          options,
        },
      }),
    );
  }

  /**
   * Calculates correlations between columns. If no `x` and `y` columns are specified, the method computes the correlations for all numeric column combinations.
   * Note that correlation is symmetrical: the correlation of `x` with `y` is the same as `y` with `x`.
   *
   * @param options - An optional object with configuration options:
   * @param options.x - The name of the column for the x-values. If omitted, correlations will be computed for all numeric columns.
   * @param options.y - The name of the column for the y-values. If omitted, correlations will be computed for all numeric columns.
   * @param options.categories - The column name or an array of column names that define categories. Correlation calculations will be performed independently for each category.
   * @param options.decimals - The number of decimal places to round the correlation values. Defaults to `undefined` (no rounding).
   * @param options.outputTable - If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.
   * @returns A promise that resolves to the SimpleTable instance containing the correlation results (either the modified current table or a new table).
   * @category Analyzing Data
   *
   * @example
   * ```ts
   * // Compute correlations between all numeric columns, overwriting the current table
   * await table.correlations();
   * ```
   *
   * @example
   * ```ts
   * // Compute correlations between 'column1' and all other numeric columns
   * await table.correlations({ x: "column1" });
   * ```
   *
   * @example
   * ```ts
   * // Compute the correlation between 'column1' and 'column2'
   * await table.correlations({ x: "column1", y: "column2" });
   * ```
   *
   * @example
   * ```ts
   * // Compute correlations within 'categoryColumn' and store results in a new table
   * const correlationTable = await table.correlations({ categories: "categoryColumn", outputTable: true });
   * ```
   *
   * @example
   * ```ts
   * // Compute correlations, rounded to 2 decimal places
   * await table.correlations({ decimals: 2 });
   * ```
   */
  async correlations(
    options: {
      x?: string;
      y?: string;
      categories?: string | string[];
      decimals?: number;
      outputTable?: string | boolean;
    } = {},
  ): Promise<SimpleTable> {
    if (options.outputTable === true) {
      options.outputTable = `table${this.sdb.tableIncrement}`;
      this.sdb.tableIncrement += 1;
    }
    await correlations(this, options);
    if (typeof options.outputTable === "string") {
      return this.sdb.newTable(options.outputTable, this.projections);
    } else {
      return this;
    }
  }

  /**
   * Performs linear regression analysis. The results include the slope, the y-intercept, and the R-squared value.
   * If no `x` and `y` columns are specified, the method computes linear regression analysis for all numeric column permutations.
   * Note that linear regression analysis is asymmetrical: the linear regression of `x` over `y` is not the same as `y` over `x`.
   *
   * @param options - An optional object with configuration options:
   * @param options.x - The name of the column for the independent variable (x-values). If omitted, linear regressions will be computed for all numeric columns as x.
   * @param options.y - The name of the column for the dependent variable (y-values). If omitted, linear regressions will be computed for all numeric columns as y.
   * @param options.categories - The column name or an array of column names that define categories. Linear regression analysis will be performed independently for each category.
   * @param options.decimals - The number of decimal places to round the regression values (slope, intercept, r-squared). Defaults to `undefined` (no rounding).
   * @param options.outputTable - If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.
   * @returns A promise that resolves to the SimpleTable instance containing the linear regression results (either the modified current table or a new table).
   * @category Analyzing Data
   *
   * @example
   * ```ts
   * // Compute all linear regressions between all numeric columns, overwriting the current table
   * await table.linearRegressions();
   * ```
   *
   * @example
   * ```ts
   * // Compute linear regressions with 'column1' as the independent variable and all other numeric columns as dependent variables
   * await table.linearRegressions({ x: "column1" });
   * ```
   *
   * @example
   * ```ts
   * // Compute the linear regression of 'sales' (y) over 'advertising' (x)
   * await table.linearRegressions({ x: "advertising", y: "sales" });
   * ```
   *
   * @example
   * ```ts
   * // Compute linear regressions within 'region' categories and store results in a new table
   * const regressionTable = await table.linearRegressions({ categories: "region", outputTable: true });
   * ```
   *
   * @example
   * ```ts
   * // Compute linear regressions, rounded to 3 decimal places
   * await table.linearRegressions({ decimals: 3 });
   * ```
   */
  async linearRegressions(
    options: {
      x?: string;
      y?: string;
      categories?: string | string[];
      decimals?: number;
      outputTable?: string | boolean;
    } = {},
  ): Promise<SimpleTable> {
    if (options.outputTable === true) {
      options.outputTable = `table${this.sdb.tableIncrement}`;
      this.sdb.tableIncrement += 1;
    }
    await linearRegressions(this, options);
    if (typeof options.outputTable === "string") {
      return this.sdb.newTable(options.outputTable, this.projections);
    } else {
      return this;
    }
  }

  /**
   * Identifies outliers in a specified column using the Interquartile Range (IQR) method.
   *
   * @param column - The name of the column in which outliers will be identified.
   * @param newColumn - The name of the new column where the boolean results (`TRUE` for outlier, `FALSE` otherwise) will be stored.
   * @param options - An optional object with configuration options:
   * @param options.categories - The column name or an array of column names that define categories. Outlier detection will be performed independently within each category.
   * @returns A promise that resolves when the outliers have been identified.
   * @category Analyzing Data
   *
   * @example
   * ```ts
   * // Look for outliers in the 'age' column and store results in a new 'isOutlier' column
   * await table.outliersIQR("age", "isOutlier");
   * ```
   *
   * @example
   * ```ts
   * // Look for outliers in 'salary' within 'gender' categories
   * await table.outliersIQR("salary", "salaryOutlier", { categories: "gender" });
   * ```
   */
  async outliersIQR(
    column: string,
    newColumn: string,
    options: {
      categories?: string | string[];
    } = {},
  ): Promise<void> {
    await queryDB(
      this,
      outliersIQRQuery(
        this.name,
        column,
        newColumn,
        (await this.getNbRows()) % 2 === 0 ? "even" : "odd",
        options,
      ),
      mergeOptions(this, {
        table: this.name,
        method: "outliersIQR()",
        parameters: { column, newColumn, options },
      }),
    );
  }

  /**
   * Computes the Z-score for values in a specified column.
   *
   * @param column - The name of the column for which Z-scores will be calculated.
   * @param newColumn - The name of the new column where the computed Z-scores will be stored.
   * @param options - An optional object with configuration options:
   * @param options.categories - The column name or an array of column names that define categories. Z-scores will be calculated independently within each category.
   * @param options.decimals - The number of decimal places to round the Z-score values. Defaults to `undefined` (no rounding).
   * @returns A promise that resolves when the Z-scores have been computed.
   * @category Analyzing Data
   *
   * @example
   * ```ts
   * // Calculate the Z-score for 'age' values and store results in a new 'ageZScore' column
   * await table.zScore("age", "ageZScore");
   * ```
   *
   * @example
   * ```ts
   * // Calculate Z-scores for 'salary' within 'department' categories
   * await table.zScore("salary", "salaryZScore", { categories: "department" });
   * ```
   *
   * @example
   * ```ts
   * // Calculate Z-scores for 'score', rounded to 2 decimal places
   * await table.zScore("score", "scoreZScore", { decimals: 2 });
   * ```
   */
  async zScore(
    column: string,
    newColumn: string,
    options: {
      categories?: string | string[];
      decimals?: number;
    } = {},
  ): Promise<void> {
    await queryDB(
      this,
      zScoreQuery(this.name, column, newColumn, options),
      mergeOptions(this, {
        table: this.name,
        method: "zScore()",
        parameters: { column, newColumn, options },
      }),
    );
  }

  /**
   * Normalizes the values in a column using min-max normalization.
   *
   * @param column - The name of the column in which values will be normalized.
   * @param newColumn - The name of the new column where normalized values will be stored.
   * @param options - An optional object with configuration options:
   * @param options.categories - The column name or an array of column names that define categories for the normalization. Normalization will be performed independently within each category.
   * @param options.decimals - The number of decimal places to round the normalized values. Defaults to `undefined` (no rounding).
   * @returns A promise that resolves when the values have been normalized.
   * @category Analyzing Data
   *
   * @example
   * ```ts
   * // Normalize the values in 'column1' and store them in a new 'normalizedColumn1' column
   * await table.normalize("column1", "normalizedColumn1");
   * ```
   *
   * @example
   * ```ts
   * // Normalize 'value' within 'group' categories
   * await table.normalize("value", "normalizedValue", { categories: "group" });
   * ```
   *
   * @example
   * ```ts
   * // Normalize 'data' values, rounded to 2 decimal places
   * await table.normalize("data", "normalizedData", { decimals: 2 });
   * ```
   */
  async normalize(
    column: string,
    newColumn: string,
    options: {
      categories?: string | string[];
      decimals?: number;
    } = {},
  ): Promise<void> {
    await queryDB(
      this,
      normalizeQuery(this.name, column, newColumn, options),
      mergeOptions(this, {
        table: this.name,
        method: "normalize()",
        parameters: { column, options },
      }),
    );
  }

  /**
   * Updates data in the table using a JavaScript function. The function receives the existing rows as an array of objects and must return the modified rows as an array of objects.
   * This method offers high flexibility for data manipulation but can be slow for large tables as it involves transferring data between DuckDB and JavaScript.
   * This method does not work with tables containing geometries.
   *
   * @param dataModifier - A synchronous or asynchronous function that takes the existing rows (as an array of objects) and returns the modified rows (as an array of objects).
   * @returns A promise that resolves when the data has been updated.
   * @category Updating Data
   *
   * @example
   * ```ts
   * // Add 1 to values in 'column1'. If values are not numbers, they are replaced by null.
   * await table.updateWithJS((rows) => {
   *   const modifiedRows = rows.map(d => ({
   *     ...d,
   *     column1: typeof d.column1 === "number" ? d.column1 + 1 : null,
   *   }));
   *   return modifiedRows;
   * });
   * ```
   *
   * @example
   * ```ts
   * // Convert a date string to a Date object in 'dateColumn'
   * await table.updateWithJS((rows) => {
   *   const modifiedRows = rows.map(d => ({
   *     ...d,
   *     dateColumn: typeof d.dateColumn === "string" ? new Date(d.dateColumn) : d.dateColumn,
   *   }));
   *   return modifiedRows;
   * });
   * ```
   */
  async updateWithJS(
    dataModifier:
      | ((
        rows: {
          [key: string]: number | string | Date | boolean | null;
        }[],
      ) => Promise<
        {
          [key: string]: number | string | Date | boolean | null;
        }[]
      >)
      | ((
        rows: {
          [key: string]: number | string | Date | boolean | null;
        }[],
      ) => {
        [key: string]: number | string | Date | boolean | null;
      }[]),
  ): Promise<void> {
    const types = await this.getTypes();
    if (Object.values(types).includes("GEOMETRY")) {
      throw new Error(
        "updateWithJS doesn't work with tables containing geometries.",
      );
    }

    const oldData = await this.getData();
    if (!oldData) {
      throw new Error("No data from getData.");
    }
    const newData = await dataModifier(oldData);
    await this.loadArray(newData);
  }

  /**
   * Returns the schema of the table, including column names and their data types.
   *
   * @returns A promise that resolves to an array of objects, where each object represents a column with its name and data type.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get the schema of the table
   * const schema = await table.getSchema();
   * console.table(schema); // Log the schema in a readable table format
   * ```
   */
  async getSchema(): Promise<
    {
      [key: string]: string | null;
    }[]
  > {
    return (await queryDB(
      this,
      `DESCRIBE "${this.name}"`,
      mergeOptions(this, {
        returnDataFrom: "query",
        nbRowsToLog: Infinity,
        table: this.name,
        method: "getSchema()",
        parameters: {},
      }),
    )) as {
      [key: string]: string | null;
    }[];
  }

  /**
   * Returns descriptive statistical information about the columns, including details like data types, number of null values, and distinct values.
   *
   * @returns A promise that resolves to an array of objects, each representing descriptive statistics for a column.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get and log descriptive information about the table's columns
   * const description = await table.getDescription();
   * console.table(description);
   * ```
   */
  async getDescription(): Promise<
    {
      [key: string]: unknown;
    }[]
  > {
    return await getDescription(this);
  }

  /**
   * Returns a list of all column names in the table.
   *
   * @returns A promise that resolves to an array of strings, where each string is a column name.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get all column names from the table
   * const columns = await table.getColumns();
   * console.log(columns); // e.g., ["id", "name", "age"]
   * ```
   */
  async getColumns(): Promise<string[]> {
    return await getColumns(this);
  }

  /**
   * Returns the number of columns in the table.
   *
   * @returns A promise that resolves to a number representing the total count of columns.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get the number of columns in the table
   * const nbColumns = await table.getNbColumns();
   * console.log(nbColumns); // e.g., 3
   * ```
   */
  async getNbColumns(): Promise<number> {
    const result = (await getColumns(this)).length;
    return result;
  }

  /**
   * Returns the number of rows in the table.
   *
   * @returns A promise that resolves to a number representing the total count of rows.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get the number of rows in the table
   * const nbRows = await table.getNbRows();
   * console.log(nbRows); // e.g., 100
   * ```
   */
  async getNbRows(): Promise<number> {
    return await getNbRows(this);
  }

  /**
   * Returns the total number of values in the table (number of columns multiplied by the number of rows).
   *
   * @returns A promise that resolves to a number representing the total count of values.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get the total number of values in the table
   * const nbValues = await table.getNbValues();
   * console.log(nbValues); // e.g., 300 (if 3 columns and 100 rows)
   * ```
   */
  async getNbValues(): Promise<number> {
    const result = (await this.getNbColumns()) * (await this.getNbRows());
    return result;
  }

  /**
   * Returns the data types of all columns in the table.
   *
   * @returns A promise that resolves to an object where keys are column names and values are their corresponding data types (e.g., `{ "id": "BIGINT", "name": "VARCHAR" }`).
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get the data types of all columns
   * const dataTypes = await table.getTypes();
   * console.log(dataTypes);
   * ```
   */
  async getTypes(): Promise<{
    [key: string]: string;
  }> {
    return await getTypes(this);
  }

  /**
   * Returns all values from a specific column.
   *
   * @param column - The name of the column from which to retrieve values.
   * @returns A promise that resolves to an array containing all values from the specified column.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get all values from the 'productName' column
   * const productNames = await table.getValues("productName");
   * console.log(productNames); // e.g., ["Laptop", "Mouse", "Keyboard"]
   * ```
   */
  async getValues(
    column: string,
  ): Promise<(string | number | boolean | Date | null)[]> {
    return await getValues(this, column);
  }

  /**
   * Returns the minimum value from a specific column.
   *
   * @param column - The name of the column from which to retrieve the minimum value.
   * @returns A promise that resolves to the minimum value of the specified column.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get the minimum value from the 'price' column
   * const minPrice = await table.getMin("price");
   * console.log(minPrice); // e.g., 10.50
   * ```
   */
  async getMin(
    column: string,
  ): Promise<string | number | boolean | Date | null> {
    return await getMin(this, column);
  }

  /**
   * Returns the maximum value from a specific column.
   *
   * @param column - The name of the column from which to retrieve the maximum value.
   * @returns A promise that resolves to the maximum value of the specified column.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get the maximum value from the 'price' column
   * const maxPrice = await table.getMax("price");
   * console.log(maxPrice); // e.g., 99.99
   * ```
   */
  async getMax(
    column: string,
  ): Promise<string | number | boolean | Date | null> {
    return await getMax(this, column);
  }

  /**
   * Returns the extent (minimum and maximum values) of a specific column as an array.
   *
   * @param column - The name of the column from which to retrieve the extent.
   * @returns A promise that resolves to an array `[min, max]` containing the minimum and maximum values of the specified column.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get the extent of the 'temperature' column
   * const tempExtent = await table.getExtent("temperature");
   * console.log(tempExtent); // e.g., [15.2, 30.1]
   * ```
   */
  async getExtent(
    column: string,
  ): Promise<
    [
      string | number | boolean | Date | null,
      string | number | boolean | Date | null,
    ]
  > {
    return [await this.getMin(column), await this.getMax(column)];
  }

  /**
   * Returns the mean (average) value from a specific numeric column.
   *
   * @param column - The name of the numeric column from which to retrieve the mean value.
   * @param options - An optional object with configuration options:
   * @param options.decimals - The number of decimal places to round the result to. Defaults to `undefined` (no rounding).
   * @returns A promise that resolves to the mean value of the specified column.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get the mean of the 'age' column
   * const meanAge = await table.getMean("age");
   * console.log(meanAge); // e.g., 35.75
   * ```
   *
   * @example
   * ```ts
   * // Get the mean of the 'salary' column, rounded to 2 decimal places
   * const meanSalary = await table.getMean("salary", { decimals: 2 });
   * console.log(meanSalary); // e.g., 55000.23
   * ```
   */
  async getMean(
    column: string,
    options: {
      decimals?: number;
    } = {},
  ): Promise<number> {
    return await getMean(this, column, options);
  }

  /**
   * Returns the median value from a specific numeric column.
   *
   * @param column - The name of the numeric column from which to retrieve the median value.
   * @param options - An optional object with configuration options:
   * @param options.decimals - The number of decimal places to round the result to. Defaults to `undefined` (no rounding).
   * @returns A promise that resolves to the median value of the specified column.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get the median of the 'age' column
   * const medianAge = await table.getMedian("age");
   * console.log(medianAge); // e.g., 30
   * ```
   *
   * @example
   * ```ts
   * // Get the median of the 'salary' column, rounded to 2 decimal places
   * const medianSalary = await table.getMedian("salary", { decimals: 2 });
   * console.log(medianSalary); // e.g., 50000.00
   * ```
   */
  async getMedian(
    column: string,
    options: {
      decimals?: number;
    } = {},
  ): Promise<number> {
    return await getMedian(this, column, options);
  }

  /**
   * Returns the sum of values from a specific numeric column.
   *
   * @param column - The name of the numeric column from which to retrieve the sum.
   * @returns A promise that resolves to the sum of values in the specified column.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get the sum of the 'quantity' column
   * const totalQuantity = await table.getSum("quantity");
   * console.log(totalQuantity); // e.g., 1250
   * ```
   */
  async getSum(column: string): Promise<number> {
    return await getSum(this, column);
  }

  /**
   * Returns the skewness of values from a specific numeric column.
   *
   * @param column - The name of the numeric column from which to retrieve the skewness.
   * @param options - An optional object with configuration options:
   * @param options.decimals - The number of decimal places to round the result to. Defaults to `undefined` (no rounding).
   * @returns A promise that resolves to the skewness value of the specified column.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get the skewness of the 'data' column
   * const dataSkew = await table.getSkew("data");
   * console.log(dataSkew); // e.g., 0.5
   * ```
   *
   * @example
   * ```ts
   * // Get the skewness of the 'values' column, rounded to 2 decimal places
   * const valuesSkew = await table.getSkew("values", { decimals: 2 });
   * console.log(valuesSkew); // e.g., -0.25
   * ```
   */
  async getSkew(
    column: string,
    options: {
      decimals?: number;
    } = {},
  ): Promise<number> {
    return await getSkew(this, column, options);
  }

  /**
   * Returns the standard deviation of values from a specific numeric column.
   *
   * @param column - The name of the numeric column from which to retrieve the standard deviation.
   * @param options - An optional object with configuration options:
   * @param options.decimals - The number of decimal places to round the result to. Defaults to `undefined` (no rounding).
   * @returns A promise that resolves to the standard deviation value of the specified column.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get the standard deviation of the 'height' column
   * const heightStdDev = await table.getStdDev("height");
   * console.log(heightStdDev); // e.g., 5.2
   * ```
   *
   * @example
   * ```ts
   * // Get the standard deviation of the 'score' column, rounded to 3 decimal places
   * const scoreStdDev = await table.getStdDev("score", { decimals: 3 });
   * console.log(scoreStdDev); // e.g., 12.345
   * ```
   */
  async getStdDev(
    column: string,
    options: {
      decimals?: number;
    } = {},
  ): Promise<number> {
    return await getStdDev(this, column, options);
  }

  /**
   * Returns the variance of values from a specific numeric column.
   *
   * @param column - The name of the numeric column from which to retrieve the variance.
   * @param options - An optional object with configuration options:
   * @param options.decimals - The number of decimal places to round the result to. Defaults to `undefined` (no rounding).
   * @returns A promise that resolves to the variance value of the specified column.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get the variance of the 'data' column
   * const dataVariance = await table.getVar("data");
   * console.log(dataVariance); // e.g., 25.5
   * ```
   *
   * @example
   * ```ts
   * // Get the variance of the 'values' column, rounded to 2 decimal places
   * const valuesVariance = await table.getVar("values", { decimals: 2 });
   * console.log(valuesVariance); // e.g., 10.23
   * ```
   */
  async getVar(
    column: string,
    options: {
      decimals?: number;
    } = {},
  ): Promise<number> {
    return await getVar(this, column, options);
  }

  /**
   * Returns the value of a specific quantile from the values in a given numeric column.
   *
   * @param column - The name of the numeric column from which to calculate the quantile.
   * @param quantile - The quantile to calculate, expressed as a number between 0 and 1 (e.g., `0.25` for the first quartile, `0.5` for the median, `0.75` for the third quartile).
   * @param options - An optional object with configuration options:
   * @param options.decimals - The number of decimal places to round the result to. Defaults to `undefined` (no rounding).
   * @returns A promise that resolves to the quantile value of the specified column.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get the first quartile (25th percentile) of 'column1'
   * const firstQuartile = await table.getQuantile("column1", 0.25);
   * console.log(firstQuartile); // e.g., 15.7
   * ```
   *
   * @example
   * ```ts
   * // Get the 90th percentile of 'score' values, rounded to 2 decimal places
   * const ninetiethPercentile = await table.getQuantile("score", 0.9, { decimals: 2 });
   * console.log(ninetiethPercentile); // e.g., 88.55
   * ```
   */
  async getQuantile(
    column: string,
    quantile: number,
    options: { decimals?: number } = {},
  ): Promise<number> {
    return await getQuantile(this, column, quantile, options);
  }

  /**
   * Returns unique values from a specific column. The values are returned in ascending order.
   *
   * @param column - The name of the column from which to retrieve unique values.
   * @returns A promise that resolves to an array containing the unique values from the specified column, sorted in ascending order.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get unique values from the 'category' column
   * const uniqueCategories = await table.getUniques("category");
   * console.log(uniqueCategories); // e.g., ["Books", "Clothing", "Electronics"]
   * ```
   */
  async getUniques(
    column: string,
  ): Promise<(string | number | boolean | Date | null)[]> {
    return await getUniques(this, column);
  }

  /**
   * Returns the first row of the table, optionally filtered by SQL conditions.
   * You can also use JavaScript syntax for conditions (e.g., `&&`, `||`, `===`, `!==`).
   *
   * @param options - An optional object with configuration options:
   * @param options.conditions - The filtering conditions specified as a SQL `WHERE` clause (e.g., `"category = 'Book'"`).
   * @returns A promise that resolves to an object representing the first row, or `null` if no rows match the conditions.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get the very first row of the table
   * const firstRow = await table.getFirstRow();
   * console.log(firstRow);
   * ```
   *
   * @example
   * ```ts
   * // Get the first row where the 'category' is 'Book'
   * const firstRowBooks = await table.getFirstRow({ conditions: `category === 'Book'` }); // Using JS syntax
   * console.log(firstRowBooks);
   * ```
   */
  async getFirstRow(
    options: {
      conditions?: string;
    } = {},
  ): Promise<{
    [key: string]: string | number | boolean | Date | null;
  }> {
    return await getFirstRow(this, options);
  }

  /**
   * Returns the last row of the table, optionally filtered by SQL conditions.
   * You can also use JavaScript syntax for conditions (e.g., `&&`, `||`, `===`, `!==`).
   *
   * @param options - An optional object with configuration options:
   * @param options.conditions - The filtering conditions specified as a SQL `WHERE` clause (e.g., `"category = 'Book'"`).
   * @returns A promise that resolves to an object representing the last row, or `null` if no rows match the conditions.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get the very last row of the table
   * const lastRow = await table.getLastRow();
   * console.log(lastRow);
   * ```
   *
   * @example
   * ```ts
   * // Get the last row where the 'category' is 'Book'
   * const lastRowBooks = await table.getLastRow({ conditions: `category === 'Book'` }); // Using JS syntax
   * console.log(lastRowBooks);
   * ```
   */
  async getLastRow(
    options: {
      conditions?: string;
    } = {},
  ): Promise<{
    [key: string]: string | number | boolean | Date | null;
  }> {
    return await getLastRow(this, options);
  }

  /**
   * Returns the top `n` rows of the table, optionally filtered by SQL conditions.
   * You can also use JavaScript syntax for conditions (e.g., `&&`, `||`, `===`, `!==`).
   *
   * @param count - The number of rows to return from the top of the table.
   * @param options - An optional object with configuration options:
   * @param options.conditions - The filtering conditions specified as a SQL `WHERE` clause (e.g., `"category = 'Books'"`).
   * @returns A promise that resolves to an array of objects representing the top `n` rows.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get the first 10 rows of the table
   * const top10 = await table.getTop(10);
   * console.log(top10);
   * ```
   *
   * @example
   * ```ts
   * // Get the first 5 rows where the 'category' is 'Books'
   * const top5Books = await table.getTop(5, { conditions: `category === 'Books'` }); // Using JS syntax
   * console.log(top5Books);
   * ```
   */
  async getTop(
    count: number,
    options: {
      conditions?: string;
    } = {},
  ): Promise<
    {
      [key: string]: string | number | boolean | Date | null;
    }[]
  > {
    return await getTop(this, count, options);
  }

  /**
   * Returns the bottom `n` rows of the table, optionally filtered by SQL conditions.
   * By default, the last row will be returned first. To preserve the original order, use the `originalOrder` option.
   * You can also use JavaScript syntax for conditions (e.g., `&&`, `||`, `===`, `!==`).
   *
   * @param count - The number of rows to return from the bottom of the table.
   * @param options - An optional object with configuration options:
   * @param options.originalOrder - A boolean indicating whether the rows should be returned in their original order (`true`) or in reverse order (last row first, `false`). Defaults to `false`.
   * @param options.conditions - The filtering conditions specified as a SQL `WHERE` clause (e.g., `"category = 'Books'"`).
   * @returns A promise that resolves to an array of objects representing the bottom `n` rows.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get the last 10 rows (last row first)
   * const bottom10 = await table.getBottom(10);
   * console.log(bottom10);
   * ```
   *
   * @example
   * ```ts
   * // Get the last 10 rows in their original order
   * const bottom10OriginalOrder = await table.getBottom(10, { originalOrder: true });
   * console.log(bottom10OriginalOrder);
   * ```
   *
   * @example
   * ```ts
   * // Get the last 5 rows where the 'category' is 'Books' (using JS syntax)
   * const bottom5Books = await table.getBottom(5, { conditions: `category === 'Books'` });
   * console.log(bottom5Books);
   * ```
   */
  async getBottom(
    count: number,
    options: {
      originalOrder?: boolean;
      conditions?: string;
    } = {},
  ): Promise<
    {
      [key: string]: string | number | boolean | Date | null;
    }[]
  > {
    return await getBottom(this, count, options);
  }

  /**
   * Returns a single row that matches the specified conditions. If no row matches or if more than one row matches, an error is thrown by default.
   * You can also use JavaScript syntax for conditions (e.g., `AND`, `||`, `===`, `!==`).
   *
   * @param conditions - The conditions to match, specified as a SQL `WHERE` clause.
   * @param options - Optional settings:
   * @param options.noCheck - If `true`, no error will be thrown when no row or more than one row match the condition. Defaults to `false`.
   * @returns A promise that resolves to an object representing the matched row.
   * @throws {Error} If `noCheck` is `false` and no row or more than one row matches the conditions.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get a row where 'name' is 'John'
   * const johnsRow = await table.getRow(`name = 'John'`);
   * console.log(johnsRow);
   * ```
   *
   * @example
   * ```ts
   * // Get a row where 'id' is 123 (using JS syntax)
   * const rowById = await table.getRow(`id === 123`);
   * console.log(rowById);
   * ```
   *
   * @example
   * ```ts
   * // Get a row without throwing an error if multiple matches or no match
   * const flexibleRow = await table.getRow(`status = 'pending'`, { noCheck: true });
   * console.log(flexibleRow);
   * ```
   */
  async getRow(
    conditions: string,
    options: { noCheck?: boolean } = {},
  ): Promise<
    {
      [key: string]: string | number | boolean | Date | null;
    } | undefined
  > {
    const data = await this.getData({ conditions });
    if (options.noCheck !== true) {
      if (data.length === 0) {
        throw new Error(`No row found with condition \`${conditions}\`.`);
      } else if (data.length > 1) {
        throw new Error(
          `More than one row found with condition \`${conditions}\`.`,
        );
      }
    }

    return data[0];
  }

  /**
   * Returns the data from the table as an array of objects, optionally filtered by SQL conditions.
   * You can also use JavaScript syntax for conditions (e.g., `&&`, `||`, `===`, `!==`).
   *
   * @param options - An optional object with configuration options:
   * @param options.conditions - The filtering conditions specified as a SQL `WHERE` clause (e.g., `"category = 'Book'"`).
   * @returns A promise that resolves to an array of objects, where each object represents a row in the table.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get all data from the table
   * const allData = await table.getData();
   * console.log(allData);
   * ```
   *
   * @example
   * ```ts
   * // Get data filtered by a condition (using JS syntax)
   * const booksData = await table.getData({ conditions: `category === 'Book'` });
   * console.log(booksData);
   * ```
   */
  async getData(
    options: {
      conditions?: string;
    } = {},
  ): Promise<
    {
      [key: string]: string | number | boolean | Date | null;
    }[]
  > {
    return (await queryDB(
      this,
      `SELECT * from "${this.name}"${
        options.conditions ? ` WHERE ${options.conditions}` : ""
      }`,
      mergeOptions(this, {
        returnDataFrom: "query",
        table: this.name,
        method: "getData()",
        parameters: { options },
      }),
    )) as {
      [key: string]: string | number | boolean | Date | null;
    }[];
  }

  // GEOSPATIAL

  /**
   * Creates point geometries from longitude and latitude columns. The geometries will have `[latitude, longitude]` axis order.
   *
   * @param columnLat - The name of the column storing the latitude values.
   * @param columnLon - The name of the column storing the longitude values.
   * @param newColumn - The name of the new column where the point geometries will be stored.
   * @returns A promise that resolves when the point geometries have been created.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Create point geometries in a new 'geom' column using 'lat' and 'lon' columns
   * await table.points("lat", "lon", "geom");
   * ```
   */
  async points(
    columnLat: string,
    columnLon: string,
    newColumn: string,
  ): Promise<void> {
    await queryDB(
      this,
      `INSTALL spatial; LOAD spatial;
            ALTER TABLE "${this.name}" ADD COLUMN "${newColumn}" GEOMETRY; UPDATE "${this.name}" SET "${newColumn}" = ST_Point2D("${columnLat}", "${columnLon}")`,
      mergeOptions(this, {
        table: this.name,
        method: "points()",
        parameters: { columnLat, columnLon, newColumn },
      }),
    );
    this.projections[newColumn] = "+proj=latlong +datum=WGS84 +no_defs";
  }

  /**
   * Adds a column with boolean values indicating the validity of geometries.
   *
   * @param newColumn - The name of the new column where the boolean results (`TRUE` for valid, `FALSE` for invalid) will be stored.
   * @param options - An optional object with configuration options:
   * @param options.column - The name of the column storing the geometries to be checked. If omitted, the method will automatically attempt to find a geometry column.
   * @returns A promise that resolves when the validity check is complete.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Check if geometries are valid and store results in a new 'isValid' column
   * // The method will automatically detect the geometry column.
   * await table.isValidGeo("isValid");
   * ```
   *
   * @example
   * ```ts
   * // Check validity of geometries in a specific column named 'myGeom'
   * await table.isValidGeo("isValidMyGeom", { column: "myGeom" });
   * ```
   */
  async isValidGeo(
    newColumn: string,
    options: { column?: string } = {},
  ): Promise<void> {
    const column = typeof options.column === "string"
      ? options.column
      : await findGeoColumn(this);

    await queryDB(
      this,
      `ALTER TABLE "${this.name}" ADD COLUMN "${newColumn}" BOOLEAN; UPDATE "${this.name}" SET "${newColumn}" = ST_IsValid("${column}")`,
      mergeOptions(this, {
        table: this.name,
        method: "isValidGeo()",
        parameters: { column, newColumn },
      }),
    );
  }

  /**
   * Adds a column with the number of vertices (points) in each geometry.
   *
   * @param newColumn - The name of the new column where the vertex counts will be stored.
   * @param options - An optional object with configuration options:
   * @param options.column - The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.
   * @returns A promise that resolves when the vertex counts have been added.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Add a new column 'vertexCount' with the number of vertices for each geometry
   * // The method will automatically detect the geometry column.
   * await table.nbVertices("vertexCount");
   * ```
   *
   * @example
   * ```ts
   * // Add vertex counts for geometries in a specific column named 'myGeom'
   * await table.nbVertices("myGeomVertices", { column: "myGeom" });
   * ```
   */
  async nbVertices(
    newColumn: string,
    options: { column?: string } = {},
  ): Promise<void> {
    const column = typeof options.column === "string"
      ? options.column
      : await findGeoColumn(this);

    await queryDB(
      this,
      `ALTER TABLE "${this.name}" ADD COLUMN "${newColumn}" BIGINT; UPDATE "${this.name}" SET "${newColumn}" = ST_NPoints("${column}")`,
      mergeOptions(this, {
        table: this.name,
        method: "nbVertices()",
        parameters: { column, newColumn },
      }),
    );
  }

  /**
   * Attempts to make invalid geometries valid without removing any vertices.
   *
   * @param column - The name of the column storing the geometries to be fixed. If omitted, the method will automatically attempt to find a geometry column.
   * @returns A promise that resolves when the geometries have been processed.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Fix invalid geometries in the default geometry column
   * await table.fixGeo();
   * ```
   *
   * @example
   * ```ts
   * // Fix invalid geometries in a specific column named 'myGeom'
   * await table.fixGeo("myGeom");
   * ```
   */
  async fixGeo(column?: string): Promise<void> {
    const col = column ?? (await findGeoColumn(this));
    await queryDB(
      this,
      `UPDATE "${this.name}" SET "${col}" = ST_MakeValid("${col}")`,
      mergeOptions(this, {
        table: this.name,
        method: "fixGeo()",
        parameters: { column },
      }),
    );
  }

  /**
   * Adds a column with boolean values indicating whether geometries are closed (e.g., polygons) or open (e.g., linestrings).
   *
   * @param newColumn - The name of the new column where the boolean results (`TRUE` for closed, `FALSE` for open) will be stored.
   * @param options - An optional object with configuration options:
   * @param options.column - The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.
   * @returns A promise that resolves when the closed geometry check is complete.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Check if geometries are closed and store results in a new 'isClosed' column
   * await table.isClosedGeo("isClosed");
   * ```
   *
   * @example
   * ```ts
   * // Check closed status of geometries in a specific column named 'boundaryGeom'
   * await table.isClosedGeo("boundaryClosed", { column: "boundaryGeom" });
   * ```
   */
  async isClosedGeo(
    newColumn: string,
    options: { column?: string } = {},
  ): Promise<void> {
    const column = typeof options.column === "string"
      ? options.column
      : await findGeoColumn(this);

    await queryDB(
      this,
      `ALTER TABLE "${this.name}" ADD COLUMN "${newColumn}" BOOLEAN; UPDATE "${this.name}" SET "${newColumn}" = ST_IsClosed("${column}")`,
      mergeOptions(this, {
        table: this.name,
        method: "isClosedGeo()",
        parameters: { column, newColumn },
      }),
    );
  }

  /**
   * Adds a column with the geometry type (e.g., `"POINT"`, `"LINESTRING"`, `"POLYGON"`) for each geometry.
   *
   * @param newColumn - The name of the new column where the geometry types will be stored.
   * @param options - An optional object with configuration options:
   * @param options.column - The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.
   * @returns A promise that resolves when the geometry types have been added.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Add a new column 'geometryType' with the type of each geometry
   * await table.typeGeo("geometryType");
   * ```
   *
   * @example
   * ```ts
   * // Get the geometry type for geometries in a specific column named 'featureGeom'
   * await table.typeGeo("featureType", { column: "featureGeom" });
   * ```
   */
  async typeGeo(
    newColumn: string,
    options: { column?: string } = {},
  ): Promise<void> {
    const column = typeof options.column === "string"
      ? options.column
      : await findGeoColumn(this);
    await queryDB(
      this,
      `ALTER TABLE "${this.name}" ADD COLUMN "${newColumn}" VARCHAR; UPDATE "${this.name}" SET "${newColumn}" = ST_GeometryType("${column}")`,
      mergeOptions(this, {
        table: this.name,
        method: "typeGeo()",
        parameters: { column, newColumn },
      }),
    );
  }

  /**
   * Flips the coordinate order of geometries in a specified column (e.g., from `[lon, lat]` to `[lat, lon]` or vice-versa).
   * **Warning:** This method should be used with caution as it directly manipulates coordinate order and can affect the accuracy of geospatial operations if not used correctly. It also messes up with the projections stored in `table.projections`.
   *
   * @param column - The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.
   * @returns A promise that resolves when the coordinates have been flipped.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Flip coordinates in the default geometry column
   * await table.flipCoordinates();
   * ```
   *
   * @example
   * ```ts
   * // Flip coordinates in a specific column named 'myGeom'
   * await table.flipCoordinates("myGeom");
   * ```
   */
  async flipCoordinates(column?: string): Promise<void> {
    const col = column ?? (await findGeoColumn(this));

    await queryDB(
      this,
      `UPDATE "${this.name}" SET "${col}" = ST_FlipCoordinates("${col}")`,
      mergeOptions(this, {
        table: this.name,
        method: "flipCoordinates()",
        parameters: { column },
      }),
    );
  }

  /**
   * Reduces the precision of geometries in a specified column to a given number of decimal places.
   *
   * @param decimals - The number of decimal places to keep in the coordinates of the geometries.
   * @param options - An optional object with configuration options:
   * @param options.column - The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.
   * @returns A promise that resolves when the precision of the geometries has been reduced.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Reduce the precision of geometries in the default column to 3 decimal places
   * await table.reducePrecision(3);
   * ```
   *
   * @example
   * ```ts
   * // Reduce the precision of geometries in a specific column named 'myGeom' to 2 decimal places
   * await table.reducePrecision(2, { column: "myGeom" });
   * ```
   */
  async reducePrecision(
    decimals: number,
    options: { column?: string } = {},
  ): Promise<void> {
    const column = typeof options.column === "string"
      ? options.column
      : await findGeoColumn(this);

    await queryDB(
      this,
      `UPDATE "${this.name}" SET "${column}" = ST_ReducePrecision("${column}", ${
        1 / Math.pow(10, decimals)
      })`,
      mergeOptions(this, {
        table: this.name,
        method: "reducePrecision()",
        parameters: { column, decimals },
      }),
    );
  }

  /**
   * Reprojects the geometries in a specified column to another Spatial Reference System (SRS).
   * If reprojecting to WGS84 (`"WGS84"` or `"EPSG:4326"`), the resulting geometries will have `[latitude, longitude]` axis order.
   *
   * @param to - The target SRS (e.g., `"EPSG:3347"`, `"WGS84"`).
   * @param options - An optional object with configuration options:
   * @param options.from - The original projection of the geometries. If omitted, the method attempts to automatically detect it. Provide this option if auto-detection fails.
   * @param options.column - The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.
   * @returns A promise that resolves when the geometries have been reprojected.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Reproject geometries in the default column to EPSG:3347 (NAD83/Statistics Canada Lambert)
   * await table.reproject("EPSG:3347");
   * ```
   *
   * @example
   * ```ts
   * // Reproject geometries from EPSG:4326 to EPSG:3347, specifying the original projection
   * await table.reproject("EPSG:3347", { from: "EPSG:4326" });
   * ```
   *
   * @example
   * ```ts
   * // Reproject geometries in a specific column named 'myGeom' to EPSG:3347
   * await table.reproject("EPSG:3347", { column: "myGeom", from: "EPSG:4326" });
   * ```
   */
  async reproject(
    to: string,
    options: { from?: string; column?: string } = {},
  ): Promise<void> {
    const column = typeof options.column === "string"
      ? options.column
      : await findGeoColumn(this);

    const from = options.from ?? this.projections[column];
    if (typeof from !== "string" || from === "") {
      throw new Error(
        "Method reproject can't determine the original projection. Use the option 'from' to provide one.",
      );
    }
    if (from === "+proj=latlong +datum=WGS84 +no_defs") {
      await this.flipCoordinates(column);
    }
    if (to.toUpperCase() === "WGS84" || to.toUpperCase() === "EPSG:4326") {
      to = "+proj=latlong +datum=WGS84 +no_defs";
    }
    await queryDB(
      this,
      `UPDATE "${this.name}" SET "${column}" = ST_Transform("${column}", '${from}', '${to}')`,
      mergeOptions(this, {
        table: this.name,
        method: "reproject()",
        parameters: { column, to },
      }),
    );
    this.projections[column] = to;
    if (
      this.projections[column] === "+proj=latlong +datum=WGS84 +no_defs"
    ) {
      await this.flipCoordinates(column);
    }
  }

  /**
   * Computes the area of geometries in square meters (`"m2"`) or optionally square kilometers (`"km2"`).
   * The input geometry is assumed to be in the EPSG:4326 coordinate system (WGS84), with `[latitude, longitude]` axis order.
   *
   * @param newColumn - The name of the new column where the computed areas will be stored.
   * @param options - An optional object with configuration options:
   * @param options.unit - The unit for the computed area: `"m2"` (square meters) or `"km2"` (square kilometers). Defaults to `"m2"`.
   * @param options.column - The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.
   * @returns A promise that resolves when the areas have been computed.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Compute the area of geometries in square meters and store in 'area_m2'
   * await table.area("area_m2");
   * ```
   *
   * @example
   * ```ts
   * // Compute the area of geometries in square kilometers and store in 'area_km2'
   * await table.area("area_km2", { unit: "km2" });
   * ```
   *
   * @example
   * ```ts
   * // Compute the area of geometries in a specific column named 'myGeom'
   * await table.area("myGeomArea", { column: "myGeom" });
   * ```
   */
  async area(
    newColumn: string,
    options: { unit?: "m2" | "km2"; column?: string } = {},
  ): Promise<void> {
    const column = typeof options.column === "string"
      ? options.column
      : await findGeoColumn(this);

    await queryDB(
      this,
      `ALTER TABLE "${this.name}" ADD "${newColumn}" DOUBLE; UPDATE "${this.name}" SET "${newColumn}" =  ST_Area_Spheroid("${column}") ${
        options.unit === "km2" ? "/ 1000000" : ""
      };`,
      mergeOptions(this, {
        table: this.name,
        method: "area()",
        parameters: { column, newColumn, options },
      }),
    );
  }

  /**
   * Computes the length of line geometries in meters or optionally kilometers. The input geometry is assumed to be in the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
   *
   * @example
   * Basic usage
   * ```ts
   * // Computes the length of the geometries and returns the results in the column length.
   * // By default, the method will look for the column storing the geometries.
   * await table.length("length")
   * ```
   *
   * @example
   * With a different unit
   * ```ts
   * // Same things but in kilometers.
   * await table.length("length", { unit: "km" })
   * ```
   *
   * @example
   * Specific column storing geometries
   * ```ts
   * // If the table has more than one column storing geometries, you must specify which column should be used.
   * await table.length("length", { column: "geom", unit: "km" })
   * ```
   *
   * @param newColumn - The name of the new column storing the computed lengths.
   * @param options - An optional object with configuration options:
   *   @param options.unit - The length can be returned as meters or kilometers.
   *   @param options.column - The column storing geometries.
   * @category Geospatial
   */
  async length(
    newColumn: string,
    options: { unit?: "m" | "km"; column?: string } = {},
  ): Promise<void> {
    const column = typeof options.column === "string"
      ? options.column
      : await findGeoColumn(this);

    await queryDB(
      this,
      `ALTER TABLE "${this.name}" ADD "${newColumn}" DOUBLE; UPDATE "${this.name}" SET "${newColumn}" =  ST_Length_Spheroid("${column}") ${
        options.unit === "km" ? "/ 1000" : ""
      };`,
      mergeOptions(this, {
        table: this.name,
        method: "length()",
        parameters: { column, newColumn, options },
      }),
    );
  }

  /**
   * Computes the perimeter of polygon geometries in meters or optionally kilometers. The input geometry is assumed to be in the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
   *
   * @example
   * Basic usage
   * ```ts
   * // Computes the perimeter of the geometries and returns the results in the column perim.
   * // By default, the method will look for the column storing the geometries.
   * await table.perimeter("perim")
   * ```
   *
   * @example
   * With a different unit
   * ```ts
   * // Same things but in kilometers.
   * await table.perimeter("perim", { unit: "km" })
   * ```
   *
   * @example
   * Specific column storing geometries
   * ```ts
   * // If the table has more than one column storing geometries, you must specify which column should be used.
   * await table.perimeter("perim", { unit: "km" })
   * ```
   *
   * @param newColumn - The name of the new column storing the computed perimeters.
   * @param options - An optional object with configuration options:
   *   @param options.unit - The perimeter can be returned as meters or kilometers.
   *   @param options.column - The column storing geometries.
   *
   * @category Geospatial
   */
  async perimeter(
    newColumn: string,
    options: { unit?: "m" | "km"; column?: string } = {},
  ): Promise<void> {
    const column = typeof options.column === "string"
      ? options.column
      : await findGeoColumn(this);

    await queryDB(
      this,
      `ALTER TABLE "${this.name}" ADD "${newColumn}" DOUBLE; UPDATE "${this.name}" SET "${newColumn}" =  ST_Perimeter_Spheroid("${column}") ${
        options.unit === "km" ? "/ 1000" : ""
      };`,
      mergeOptions(this, {
        table: this.name,
        method: "perimeter()",
        parameters: { column, newColumn, options },
      }),
    );
  }

  /**
   * Computes a buffer around geometries based on a specified distance. The distance is in the SRS unit.
   *
   * @example
   * Basic usage
   * ```ts
   * // Creates new geomeotries from the geometries with a buffer of 1 and puts the results in column buffer.
   * // By default, the method will look for the column storing the geometries.
   * await table.buffer("buffer", 1)
   * ```
   *
   * @example
   * Specific column storing geometries
   * ```ts
   * // If the table has more than one column storing geometries, you must specify which column should be used.
   * await table.buffer("buffer", 1, { column: "geom" })
   * ```
   *
   * @param newColumn - The name of the new column to store the buffered geometries.
   * @param distance - The distance for the buffer, in SRS unit.
   * @param options - An optional object with configuration options:
   *   @param options.column - The column storing geometries.
   *
   * @category Geospatial
   */
  async buffer(
    newColumn: string,
    distance: number,
    options: { column?: string } = {},
  ): Promise<void> {
    const column = typeof options.column === "string"
      ? options.column
      : await findGeoColumn(this);

    await queryDB(
      this,
      `ALTER TABLE "${this.name}" ADD "${newColumn}" GEOMETRY; UPDATE "${this.name}" SET "${newColumn}" =  ST_Buffer("${column}", ${distance});`,
      mergeOptions(this, {
        table: this.name,
        method: "buffer()",
        parameters: { column, newColumn, distance },
      }),
    );

    this.projections[newColumn] = this.projections[column];
  }

  /**
   * Merges the data of the table with another table based on a spatial join. Note that the returned data is not guaranteed to be in the same order as the original tables.
   *
   * By default, the method looks for a column storing the geometries in each table, does a left join and overwrites leftTable (the current table) with the results. The method also appends the name of the table to the columns storing the geometries if they have the same name in both tables.
   *
   * It might create a .tmp folder, so make sure to add .tmp to your gitignore.
   *
   * @example
   * Basic usage
   * ```ts
   * // Merges data of tableA and tableB based on geometries that intersect. tableA is overwritten with the result.
   * await tableA.joinGeo(tableB, "intersect")
   *
   * // Merges data of tableA and tableB based on geometries that in tableA that are inside geometries in tableB. tableA is overwritten with the result.
   * await tableA.joinGeo(tableB, "inside")
   *
   * // Merges data based on geometries in tableA that are within a target distance of geometries in tableB. By default, the distance is in the SRS unit.
   * await tableA.joinGeo(tableB, "within", { distance : 10 })
   *
   * // Same thing but using the haversine distance. The distance is in meters. The input geometries must use the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
   * await tableA.joinGeo(tableB, "within", { distance : 10, distanceMethod: "haversine" })
   *
   * // Same thing but using an ellipsoidal model of the earth's surface. The distance is in meters. The input geometries must use the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
   * await tableA.joinGeo(tableB, "within", { distance : 10, distanceMethod: "spheroid" })
   * ```
   *
   * @example
   * With options
   * ```ts
   * // Same thing but with specific column names storing geometries, a specific join type, and returning the results in a new table.
   * const tableC = await tableA.joinGeo(tableB, "intersect", { leftTableColumn: "geometriesA", rightTableColumn: "geometriesB", type: "inner", outputTable: true })
   * ```
   *
   * @param method - The method for the spatial join.
   * @param rightTable - The right table to be joined.
   * @param options - An optional object with configuration options:
   *   @param options.leftTableColumn - The column storing the geometries in leftTable. The method tries to find one by default.
   *   @param options.rightTableColumn - The column storing the geometries in rightTable. The method tries to find one by default.
   *   @param options.type - The type of join operation to perform. For some types (like 'inside'), the table order is important. Defaults to 'left'.
   *   @param options.distance - If the method is 'within', you need to specify a target distance. The distance is in the SRS unit. If you choose options.distanceMethod 'haversine' or 'spheroid', it will be considered as meters.
   *   @param options.distanceMethod - 'srs' is default, but you can choose 'haversine' or 'spheroid'. These two need the input geometries with the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
   *   @param options.outputTable - An option to store the results in a new table.
   *
   * @category Geospatial
   */
  async joinGeo(
    rightTable: SimpleTable,
    method: "intersect" | "inside" | "within",
    options: {
      leftTableColumn?: string;
      rightTableColumn?: string;
      type?: "inner" | "left" | "right" | "full";
      distance?: number;
      distanceMethod?: "srs" | "haversine" | "spheroid";
      outputTable?: string | boolean;
    } = {},
  ): Promise<SimpleTable> {
    if (options.outputTable === true) {
      options.outputTable = `table${this.sdb.tableIncrement}`;
      this.sdb.tableIncrement += 1;
    }
    return (await joinGeo(
      this,
      method,
      rightTable,
      options,
    )) as SimpleTable;
  }

  /**
   * Computes the intersection of geometries.
   *
   * @example
   * Basic usage
   * ```ts
   * // Computes the intersection of geometries in geomA and geomB columns and puts the new geometries in column inter.
   * await table.intersection("geomA", "geomB", "inter")
   * ```
   * @param column1 - The names of a column storing geometries.
   * @param column2 - The name of a column storing  geometries.
   * @param newColumn - The name of the new column storing the computed intersections.
   *
   * @category Geospatial
   */
  async intersection(
    column1: string,
    column2: string,
    newColumn: string,
  ): Promise<void> {
    if (this.projections[column1] !== this.projections[column2]) {
      throw new Error(
        `${column1} and ${column2} don't have the same projection.\n${column1}: ${
          this.projections[column1]
        }\n${column2}: ${this.projections[column2]}`,
      );
    }
    await queryDB(
      this,
      `ALTER TABLE "${this.name}" ADD "${newColumn}" GEOMETRY; UPDATE "${this.name}" SET "${newColumn}" = ST_Intersection("${column1}", "${column2}")`,
      mergeOptions(this, {
        table: this.name,
        method: "intersection()",
        parameters: { column1, column2, newColumn },
      }),
    );
    this.projections[newColumn] = this.projections[column1];
  }

  /**
   * Removes the intersection of two geometries.
   *
   * @example
   * Basic usage
   * ```ts
   * // Removes the intersection of geomA and geomB from geomA and returns the results in the new column noIntersection. The column order is important.
   * await table.removeIntersection("geomA", "geomB", "noIntersection")
   * ```
   *
   * @param column1 - The names of a column storing geometries. These are the reference geometries that will be returned without the intersection.
   * @param column2 - The name of a column storing  geometries. These are the geometries used to compute the intersection.
   * @param newColumn - The name of the new column storing the new geometries.
   *
   * @category Geospatial
   */
  async removeIntersection(
    column1: string,
    column2: string,
    newColumn: string,
  ): Promise<void> {
    if (this.projections[column1] !== this.projections[column2]) {
      throw new Error(
        `${column1} and ${column2} don't have the same projection.\n${column1}: ${
          this.projections[column1]
        }\n${column2}: ${this.projections[column2]}`,
      );
    }
    await queryDB(
      this,
      (await this.getColumns()).includes(newColumn)
        ? `UPDATE "${this.name}" SET "${newColumn}" = ST_Difference("${column1}", "${column2}")`
        : `ALTER TABLE "${this.name}" ADD "${newColumn}" GEOMETRY; UPDATE "${this.name}" SET "${newColumn}" = ST_Difference("${column1}", "${column2}")`,
      mergeOptions(this, {
        table: this.name,
        method: "removeIntersection()",
        parameters: { column1, column2, newColumn },
      }),
    );
    this.projections[newColumn] = this.projections[column1];
  }

  /**
   * Fill holes in geometries.
   *
   * @example
   * Basic usage
   * ```ts
   * // By default, this method will look for the column storing the geometries.
   * await table.fillHoles()
   * ```
   *
   * @example
   * Specific column storing geometries
   * ```ts
   * // If the table has more than one column storing geometries, you must specify which column should be used.
   * await table.fillHoles("geom")
   * ```
   *
   * @param column - The name of the column storing the geometries.
   * @category Geospatial
   */
  async fillHoles(column?: string): Promise<void> {
    const col = column ?? (await findGeoColumn(this));
    await queryDB(
      this,
      `UPDATE "${this.name}" SET geom = ST_MakePolygon(ST_ExteriorRing("${col}"));`,
      mergeOptions(this, {
        table: this.name,
        method: "fillHoles()",
        parameters: { column },
      }),
    );
  }

  /**
   * Returns true if two geometries intersect.
   *
   * @example
   * Basic usage
   * ```ts
   * // Checks if geometries in geomA and in geomB intersect and return true or false in new column inter.
   * await table.intersect("geomA", "geomB", "inter")
   * ```
   *
   * @param column1 - The names of a column storing geometries.
   * @param column2 - The name of a column storing  geometries.
   * @param newColumn - The name of the new column with true or false values.
   *
   * @category Geospatial
   */
  async intersect(
    column1: string,
    column2: string,
    newColumn: string,
  ): Promise<void> {
    await queryDB(
      this,
      `ALTER TABLE "${this.name}" ADD "${newColumn}" BOOLEAN; UPDATE "${this.name}" SET "${newColumn}" = ST_Intersects("${column1}", "${column2}")`,
      mergeOptions(this, {
        table: this.name,
        method: "intersect()",
        parameters: { column1, column2, newColumn },
      }),
    );
  }

  /**
   * Returns true if all points of a geometry lies inside another geometry.
   *
   * @example
   * Basic usage
   * ```ts
   * // Checks if geometries in column geomA are inside geometries in column geomB and return true or false in new column isInside.
   * await table.inside("geomA", "geomB", "isInside")
   * ```
   *
   * @param column1 - The first column holds the geometries that will be tested for containment.
   * @param column2 - The second column stores the geometries to be tested as containers.
   * @param newColumn - The name of the new column with true or false values.
   *
   * @category Geospatial
   */
  async inside(
    column1: string,
    column2: string,
    newColumn: string,
  ): Promise<void> {
    await queryDB(
      this,
      `ALTER TABLE "${this.name}" ADD "${newColumn}" BOOLEAN; UPDATE "${this.name}" SET "${newColumn}" = ST_Covers("${column2}", "${column1}")`,
      mergeOptions(this, {
        table: this.name,
        method: "inside()",
        parameters: { column1, column2, newColumn },
      }),
    );
  }

  /**
   * Computes the union of geometries.
   *
   * @example
   * Basic usage
   * ```ts
   * // Computes the union of geometries in geomA and geomB columns and puts the new geometries in column union.
   * await tabele.union("geomA", "geomB", "union")
   * ```
   *
   * @param column1 - The names of a column storing geometries.
   * @param column2 - The name of a column storing  geometries.
   * @param newColumn - The name of the new column storing the computed unions.
   *
   * @category Geospatial
   */
  async union(
    column1: string,
    column2: string,
    newColumn: string,
  ): Promise<void> {
    if (this.projections[column1] !== this.projections[column2]) {
      throw new Error(
        `${column1} and ${column2} don't have the same projection.\n${column1}: ${
          this.projections[column1]
        }\n${column2}: ${this.projections[column2]}`,
      );
    }
    await queryDB(
      this,
      `ALTER TABLE "${this.name}" ADD "${newColumn}" GEOMETRY; UPDATE "${this.name}" SET "${newColumn}" = ST_Union("${column1}", "${column2}")`,
      mergeOptions(this, {
        table: this.name,
        method: "union()",
        parameters: { column1, column2, newColumn },
      }),
    );

    this.projections[newColumn] = this.projections[column1];
  }

  /**
   * Extracts the latitude and longitude of points. The input geometry is assumed to be in the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
   *
   * @example
   * Basic usage
   * ```ts
   * // Extracts the latitude and longitude of points from the points in the "geom" column and put them in the columns "lat" and "lon".
   * await table.latLon("geom", "lat", "lon")
   * ```
   *
   * @param column - The name of the table storing the points.
   * @param columnLat - The name of the column storing the extracted latitude.
   * @param columnLon - The name of the column storing the extracted longitude.
   *
   * @category Geospatial
   */
  async latLon(
    column: string,
    columnLat: string,
    columnLon: string,
  ): Promise<void> {
    await queryDB(
      this,
      `ALTER TABLE "${this.name}" ADD "${columnLat}" DOUBLE; UPDATE "${this.name}" SET "${columnLat}" = ST_X("${column}");
             ALTER TABLE "${this.name}" ADD "${columnLon}" DOUBLE; UPDATE "${this.name}" SET "${columnLon}" = ST_Y("${column}");`,
      mergeOptions(this, {
        table: this.name,
        method: "latLon()",
        parameters: { column, columnLon, columnLat },
      }),
    );
  }

  /**
   * Simplifies the geometries while preserving the overall coverage. A higher tolerance results in a more significant simplification.
   *
   * @example
   * Basic usage
   * ```ts
   * // Simplifies with a tolerance of 0.1.
   * // By default, the method will look for the column storing the geometries.
   * await table.simplify(0.1)
   * ```
   *
   * @example
   * Keeping the overall boundary intact
   * ```ts
   * // Simplifies the interior only.
   * await table.simplify(0.1, { simplifyBoundary: false })
   * ```
   *
   * @example
   * Specific column storing geometries
   * ```ts
   * // If the table has more than one column storing geometries, you must specify which column should be used.
   * await table.simplify(0.1, { column: "geom" })
   * ```
   *
   * @param tolerance - A number used for the simplification. A higher tolerance results in a more significant simplification.
   * @param options - An optional object with configuration options:
   *   @param options.column - The column storing geometries.
   *   @param options.simplifyBoundary - If true, the method will simplify the boundary of the geometries. If false, it will simplify the interior of the geometries. Detaults to true.
   *
   * @category Geospatial
   */
  async simplify(
    tolerance: number,
    options: { column?: string; simplifyBoundary?: boolean } = {},
  ): Promise<void> {
    const column = typeof options.column === "string"
      ? options.column
      : await findGeoColumn(this);

    await this.addRowNumber("rowNumberForSimplify");

    await queryDB(
      this,
      `CREATE OR REPLACE TABLE "${this.name}" AS SELECT * REPLACE(ST_CoverageSimplify(ARRAY_AGG("${column}"), ${tolerance}${
        options.simplifyBoundary === false ? ", FAlSE" : ""
      }) AS "${column}") FROM "${this.name}" GROUP BY ALL;`,
      mergeOptions(this, {
        table: this.name,
        method: "simplify()",
        parameters: { column, tolerance },
      }),
    );

    await this.removeColumns("rowNumberForSimplify");
  }

  /**
   * Computes the centroid of geometries. The values are returned in the SRS unit.
   *
   * @example
   * Basic usage
   * ```ts
   * // Computes the centroid of the geometries and returns the results in the column centroid.
   * // By default, the method will look for the column storing the geometries.
   * await table.centroid("centroid")
   * ```
   *
   * @example
   * Specific column storing geometries
   * ```ts
   * // If the table has more than one column storing geometries, you must specify which column should be used.
   * await table.centroid("centroid", { column: "geom" })
   * ```
   *
   * @param newColumn - The name of the new column storing the centroids.
   * @param options - An optional object with configuration options:
   *   @param options.column - The column storing geometries.
   *
   * @category Geospatial
   */
  async centroid(
    newColumn: string,
    options: { column?: string } = {},
  ): Promise<void> {
    const column = typeof options.column === "string"
      ? options.column
      : await findGeoColumn(this);
    await queryDB(
      this,
      `ALTER TABLE "${this.name}" ADD "${newColumn}" GEOMETRY; UPDATE "${this.name}" SET "${newColumn}" =  ST_Centroid("${column}");`,
      mergeOptions(this, {
        table: this.name,
        method: "centroid()",
        parameters: { column, newColumn },
      }),
    );
    this.projections[newColumn] = this.projections[column];
  }

  /**
   * Computes the distance between geometries. By default, it uses the SRS unit. You can pass "spheroid" or "haversine" as options.method to get results in meters or optionally kilometers. If you do use these methods, the input geometries must use the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
   *
   * @example
   * Basic usage (SRS unit)
   * ```ts
   * // Computes the distance between geometries in columns geomA and geomB. The distance is returned in the new column "distance" in the SRS unit.
   * await table.distance("geomA", "geomB", "distance")
   * ```
   *
   * @example
   * Haversine (meters)
   * ```ts
   * // Same but using the haversine distance. The distance is returned in meters by default. The input geometries must use the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
   * await table.distance("geomA", "geomB", "distance", { method: "haversine" })
   * ```
   *
   * @example
   * Haversine (kilometers)
   * ```
   * // Same but the distance is returned in kilometers. The input geometries must use the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
   * await table.distance("geomA", "geomB", "distance", { method: "haversine", unit: "km" })
   * ```
   *
   * @example
   * Spheroid (meters and optionally kilometers)
   * ```ts
   * // Same but using an ellipsoidal model of the earth's surface. It's the most accurate but the slowest. By default, the distance is returned in meters and optionally as kilometers. The input geometries must use the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
   * await table.distance("geomA", "geomB", "distance", { method: "spheroid", unit: "km" })
   * ```
   *
   * @param column1 - The name of a column storing geometries.
   * @param column2 - The name of a column storing geometries.
   * @param newColumn - The name of the new column storing the centroids.
   * @param options - An optional object with configuration options:
   *   @param options.method - The method to be used for the distance calculations. "srs" returns the values in the SRS unit. "spheroid" and "haversine" return the values in meters by default and the input geometries must use the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
   *   @param options.unit - If the method is "spheroid" or "haversine", you can choose between meters or kilometers. It's meters by default.
   *   @param options.decimals - Number of decimal places to round to.
   *
   * @category Geospatial
   */
  async distance(
    column1: string,
    column2: string,
    newColumn: string,
    options: {
      unit?: "m" | "km";
      method?: "srs" | "haversine" | "spheroid";
      decimals?: number;
    } = {},
  ): Promise<void> {
    await queryDB(
      this,
      distanceQuery(this.name, column1, column2, newColumn, options),
      mergeOptions(this, {
        table: this.name,
        method: "distance()",
        parameters: { column1, column2, newColumn },
      }),
    );
  }

  /**
   * Unnests geometries recursively.
   *
   * @example
   * Basic usage
   * ```ts
   * // Unnests geometries in the column "geom" and returns the same table with unnested items.
   * // By default, the method will look for the column storing the geometries.
   * await table.unnestGeo()
   * ```
   *
   * @example
   * Specific column storing geometries
   * ```ts
   * // If the table has more than one column storing geometries, you must specify which column should be used.
   * await table.unnestGeo("geom")
   * ```
   *
   * @param column - The name of a column storing geometries.
   *
   * @category Geospatial
   */
  async unnestGeo(column?: string): Promise<void> {
    const col = column ?? (await findGeoColumn(this));
    await queryDB(
      this,
      `CREATE OR REPLACE TABLE "${this.name}" AS SELECT * EXCLUDE("${col}"), UNNEST(ST_Dump("${col}"), recursive := TRUE) FROM "${this.name}"; ALTER TABLE "${this.name}" DROP COLUMN path;`,
      mergeOptions(this, {
        table: this.name,
        method: "unnestGeo()",
        parameters: { column },
      }),
    );
  }

  /**
   * Aggregates geometries.
   *
   * @example
   * Basic usage
   * ```ts
   * // Returns the union of all geometries.
   * // By default, the method will look for the column storing the geometries.
   * await table.aggregateGeo("union")
   *
   * // Same thing but for intersection.
   * await table.aggregateGeo("intersection")
   * ```
   *
   * @example
   * Specific column storing geometries
   * ```ts
   * // If the table has more than one column storing geometries, you must specify which column should be used.
   * await table.aggregateGeo("union", { column: "geom" })
   * ```
   *
   * @example
   * With categories
   * ```ts
   * // Returns the union of all geometries and uses the values in the column country as categories.
   * await table.aggregateGeo("union", { categories: "country" })
   * ```
   *
   * @example
   * Returning results in a new table
   * ```ts
   * // Same thing but results a return in tableA
   * const tableA = await table.aggregateGeo("union", { categories: "country", outputTable: true })
   * ```
   *
   * @example
   * Returning results in a new table with a specific name in the DB
   * ```ts
   * // Same thing but results a return in tableA
   * const tableA = await table.aggregateGeo("union", { categories: "country", outputTable: "tableA" })
   * ```
   *
   * @param method - The method to use for the aggregation.
   * @param options - An optional object with configuration options:
   *   @param options.column - The column storing geometries.
   *   @param options.categories - The column or columns that define categories for the aggragation. This can be a single column name or an array of column names.
   *   @param options.outputTable - An option to store the results in a new table.
   *
   * @category Geospatial
   */
  async aggregateGeo(
    method: "union" | "intersection",
    options: {
      column?: string;
      categories?: string | string[];
      outputTable?: string | boolean;
    } = {},
  ): Promise<SimpleTable> {
    const column = typeof options.column === "string"
      ? options.column
      : await findGeoColumn(this);

    if (options.outputTable === true) {
      options.outputTable = `table${this.sdb.tableIncrement}`;
      this.sdb.tableIncrement += 1;
    }
    await queryDB(
      this,
      aggregateGeoQuery(this.name, column, method, options),
      mergeOptions(this, {
        table: this.name,
        method: "aggregateGeo()",
        parameters: { column, method, options },
      }),
    );
    if (typeof options.outputTable === "string") {
      return this.sdb.newTable(options.outputTable, this.projections);
    } else {
      return this;
    }
  }

  /**
   * Transforms closed lines into polygons.
   *
   * @example
   * Basic usage
   * ```ts
   * // Transforms geometries into polygons.
   * // By default, the method will look for the column storing the geometries.
   * await table.linesToPolygons()
   * ```
   *
   * @example
   * Specific column storing geometries
   * ```ts
   * // If the table has more than one column storing geometries, you must specify which column should be used.
   * await table.linesToPolygons("geom")
   * ```
   *
   * @param column - The name of a column storing geometries.
   *
   * @category Geospatial
   */
  async linesToPolygons(column?: string): Promise<void> {
    const col = column ?? (await findGeoColumn(this));

    await queryDB(
      this,
      `CREATE OR REPLACE TABLE "${this.name}" AS SELECT * EXCLUDE("${col}"), ST_MakePolygon("${col}") as "${col}" FROM "${this.name}";`,
      mergeOptions(this, {
        table: this.name,
        method: "linesToPolygons()",
        parameters: { column },
      }),
    );
  }

  /**
   * Get the bounding box of geometries in [minLong, minLat, maxLong, maxLat] order. By default, the method will try find the column with the geometries, but can also specify one. The input geometry is assumed to be in the EPSG:4326 coordinate system (WGS84), with [latitude, longitude] axis order.
   *
   * @example
   * Basic usage
   * ```ts
   * const bbox = await table.getBoundingBox()
   * ```
   *
   * @example
   * Specific column storing geometries
   * ```ts
   * const bbox = await table.getBoundingBox("geometries")
   * ```
   *
   * @param column - The name of a column storing geometries.
   *
   * @category Geospatial
   */
  async getBoundingBox(
    column?: string,
  ): Promise<[number, number, number, number]> {
    const col = column ?? (await findGeoColumn(this));
    const result = (await queryDB(
      this,
      `SELECT
                MIN(ST_XMin("${col}")) AS minX,
                MIN(ST_YMin("${col}")) AS minY,
                MAX(ST_XMax("${col}")) AS maxX,
                MAX(ST_YMax("${col}")) AS maxY,
            from "${this.name}";`,
      mergeOptions(this, {
        table: this.name,
        method: "getBoundingBox()",
        parameters: { column },
        returnDataFrom: "query",
      }),
    )) as { minX: number; minY: number; maxX: number; maxY: number }[];
    return [result[0].minY, result[0].minX, result[0].maxY, result[0].maxX];
  }

  /**
   * Returns the data as a geojson. If the table has more than one column storing geometries, you must specify which column should be used. If the projection is WGS84 or EPSG:4326 ([latitude, longitude] axis order), the coordinates will be flipped to follow the RFC7946 standard ([longitude, latitude] axis order).
   *
   * @example
   * Basic usage
   * ```ts
   * // By default, the method will look for the column storing the geometries. The other columns in the table will be stored as properties.
   * const geojson = await table.getGeoData()
   * ```
   *
   * @example
   * Specific geometry column
   * ```ts
   * // If the table has more than one column storing geometries, you must specify which column should be used. All the other columns in the table will be stored as properties.
   * const geojson = await table.getGeoData("geometries")
   * ```
   *
   * @param column - The name of a column storing geometries.
   * @param options - An optional object with configuration options:
   *   @param options.rewind - If true, rewinds in the spherical winding order (important for D3.js). Default is false.
   *
   * @category Geospatial
   */
  async getGeoData(
    column?: string,
    options: { rewind?: boolean } = {},
  ): Promise<{
    type: string;
    features: unknown[];
  }> {
    if (column === undefined) {
      column = await findGeoColumn(this);
    }

    return await getGeoData(this, column, options);
  }

  /**
   * Writes data to a file. If the path doesn't exist, it will be created.
   *
   * @example
   * Basic usage
   * ```ts
   * await table.writeData("output/data.csv");
   * ```
   *
   * @example
   * Writing JSON data
   * ```ts
   * await table.writeData("output/data.json");
   * ```
   *
   * @example
   * Writing Parquet data
   * ```ts
   * await table.writeData("output/data.parquet");
   * ```
   *
   * @example
   * Writing as a DuckDB database
   * ```ts
   * await table.writeData("output/data.db");
   * ```
   *
   * @example
   * Writing as a SQLite db
   * ```ts
   * await table.writeData("output/data.sqlite");
   * ```
   *
   * @param file - The path to the file to which data will be written.
   * @param options - An optional object with configuration options:
   *   @param options.compression - A boolean indicating whether to compress the output file. Defaults to false. If true, CSV and JSON files will be compressed with GZIP while PARQUET files will use ZSTD.
   *   @param options.dataAsArrays - A boolean for JSON files. If true, JSON files are written as one object with arrays instead of an array of objects. Convenient to reduce the size of JSON files for web projects. You can use the function arraysToData from the journalism library to bring back the data to its original state.
   *   @param options.formatDates - If true, dates will be formatted as ISO strings ("2025-01-01T01:00:00.000Z"). Defaults to false. Works only with CSV and JSON files.
   *
   * @category Exporting data
   */
  async writeData(
    file: string,
    options: {
      compression?: boolean;
      dataAsArrays?: boolean;
      formatDates?: boolean;
    } = {},
  ): Promise<void> {
    createDirectory(file);

    const extension = getExtension(file);

    if (options.dataAsArrays) {
      await writeDataAsArrays(this, file);
    } else {
      await queryDB(
        this,
        writeDataQuery(this.name, file, extension, options),
        mergeOptions(this, {
          table: this.name,
          method: "writeData()",
          parameters: { file, options },
        }),
      );
    }
  }

  /**
   * Writes geospatial data to a file. If the path doesn't exist, it will be created.
   *
   * For .geojson files, if the projection is WGS84 or EPSG:4326 ([latitude, longitude] axis order), the coordinates will be flipped to follow the RFC7946 standard ([longitude, latitude] axis order).
   *
   * @example
   * Basic usage to write geojson files
   * ```ts
   * await table.writeGeoata("output/data.geojson");
   * ```
   *
   * @example
   * Basic usage to write geoparquet files
   * ```ts
   * await table.writeGeoata("output/data.geoparquet");
   * ```
   *
   * @param file - The path to the file to which data will be written.
   * @param options - An optional object with configuration options:
   *   @param options.precision - Maximum number of figures after decimal separator to write in coordinates. Works with GeoJSON files only.
   *   @param options.rewind - If true, rewinds in the spherical winding order (important for D3.js). Default is false. Works with GeoJSON files only.
   *   @param options.compression - A boolean indicating whether to compress the output file. Works with GeoParquet files only. Defaults to false. If true, the file will be compressed with ZSTD.
   *   @param options.metadata - Metadata to be added to the file. Works only with GeoJSON files.
   *   @param options.formatDates - If true, dates will be formatted as ISO strings ("2025-01-01T01:00:00.000Z"). Defaults to false. Works only with GeoJSON files.
   *
   * * @category Exporting data
   */
  async writeGeoData(
    file: string,
    options: {
      precision?: number;
      compression?: boolean;
      rewind?: boolean;
      metadata?: unknown;
      formatDates?: boolean;
    } = {},
  ): Promise<void> {
    createDirectory(file);
    const fileExtension = getExtension(file);
    if (fileExtension === "geojson" || fileExtension === "json") {
      let types;
      if (options.formatDates === true) {
        types = await this.getTypes();
        if (
          Object.values(types).includes("DATE") ||
          Object.values(types).includes("TIMESTAMP")
        ) {
          await stringifyDates(this, types);
        }
      }

      if (typeof options.compression === "boolean") {
        throw new Error(
          "The compression option is not supported for writing GeoJSON files.",
        );
      }
      const geoColumn = await findGeoColumn(this);
      const flip = shouldFlipBeforeExport(this.projections[geoColumn]);
      if (flip) {
        await this.flipCoordinates(geoColumn);
        await queryDB(
          this,
          writeGeoDataQuery(this.name, file, fileExtension, options),
          mergeOptions(this, {
            table: this.name,
            method: "writeGeoData()",
            parameters: { file, options },
          }),
        );

        await this.flipCoordinates(geoColumn);
      } else {
        await queryDB(
          this,
          writeGeoDataQuery(this.name, file, fileExtension, options),
          mergeOptions(this, {
            table: this.name,
            method: "writeGeoData()",
            parameters: { file, options },
          }),
        );
      }
      if (options.metadata) {
        const fileData = JSON.parse(readFileSync(file, "utf-8"));
        fileData.metadata = options.metadata;
        writeFileSync(file, JSON.stringify(fileData));
      }
      if (options.rewind) {
        const fileData = JSON.parse(readFileSync(file, "utf-8"));
        const fileRewinded = rewind(fileData);
        writeFileSync(file, JSON.stringify(fileRewinded));
      }
      if (
        types && (Object.values(types).includes("DATE") ||
          Object.values(types).includes("TIMESTAMP"))
      ) {
        await stringifyDatesInvert(this, types);
      }
    } else if (fileExtension === "geoparquet") {
      if (typeof options.precision === "number") {
        throw new Error(
          "The precision option is not supported for writing PARQUET files. Use the .reducePrecision() method.",
        );
      }
      if (typeof options.rewind === "boolean") {
        throw new Error(
          "The rewind option is not supported for writing PARQUET files.",
        );
      }
      await queryDB(
        this,
        `COPY "${this.name}" TO '${cleanPath(file)}' WITH (FORMAT PARQUET${
          options.compression === true ? ", COMPRESSION 'zstd'" : ""
        }, KV_METADATA {
             projections: '${JSON.stringify(this.projections)}'
        });`,
        mergeOptions(this, {
          table: this.name,
          method: "writeGeoData()",
          parameters: { file, options },
        }),
      );
    } else {
      throw new Error(`Unknown extension ${fileExtension}`);
    }
  }

  /**
   * Clears a Google Sheet and populates it with the table's data. This methods uses the [overwriteSheetData function from the journalism library](https://jsr.io/@nshiab/journalism/doc/~/overwriteSheetData). See its documentation for more information.
   *
   * By default, this function looks for the API key in process.env.GOOGLE_PRIVATE_KEY and the service account email in process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL. If you don't have credentials, check [this](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication).
   *
   * @example
   * Basic usage
   * ```ts
   * await table.toSheet("https://docs.google.com/spreadsheets/d/.../edit#gid=0")
   * ```
   *
   * @param sheetUrl - The url directing to a specific sheet.
   * @param options - An optional object with configuration options:
   *   @param options.prepend - Text to be added before the data.
   *   @param options.lastUpdate - If true, adds a row before the data with the date of the update.
   *   @param options.timeZone - If lastUpdate is true, you can use this option to format the date to a specific time zone.
   *   @param options.raw - If true, Google Sheet won't try to guess the data type and won't format or parse the values.
   *   @param options.apiEmail - If your API email is stored under different names in process.env, use this option.
   *   @param options.apiKey - If your API key is stored under different names in process.env, use this option.
   */
  async toSheet(sheetUrl: string, options: {
    prepend?: string;
    lastUpdate?: boolean;
    timeZone?:
      | "Canada/Atlantic"
      | "Canada/Central"
      | "Canada/Eastern"
      | "Canada/Mountain"
      | "Canada/Newfoundland"
      | "Canada/Pacific"
      | "Canada/Saskatchewan"
      | "Canada/Yukon";
    raw?: boolean;
    apiEmail?: string;
    apiKey?: string;
  } = {}): Promise<void> {
    await overwriteSheetData(await this.getData(), sheetUrl, options);
  }

  /**
   * Caches the results of computations in `./.sda-cache` which you probably want to add to your `.gitignore`.
   *
   * @example
   * Basic usage
   *
   * The code will be triggered on the first run or if you update the function passed to the cache method. Otherwise, the result will be loaded from the cache.
   *
   * ```js
   * const sdb = new SimpleDB()
   * const table = sdb.newTable()
   *
   * await table.cache(async () => {
   *     await table.loadData("items.csv")
   *     await table.summarize({
   *         values: "price",
   *         categories: "department",
   *         summaries: ["min", "max", "mean"]
   *     })
   * })
   *
   * // It's important to call done() on the SimpleDB instance to clean up the cache.
   * // We don't want it to grow in size indefinitely.
   * await sdb.done()
   * ```
   *
   * @example
   * With a ttl
   *
   * You can pass a ttl option in seconds. Here, the code will be triggered on the first run or if the result is more than 1 minute old.
   *
   * ```js
   * const sdb = new SimpleDB()
   * const table = sdb.newTable()
   *
   * await table.cache(async () => {
   *     await table.loadData("items.csv")
   *     await table.summarize({
   *         values: "price",
   *         categories: "department",
   *         summaries: ["min", "max", "mean"]
   *     })
   * }, { ttl: 60 })
   *
   * // It's important to call done() on the SimpleDB instance to clean up the cache.
   * // We don't want it to grow in size indefinitely.
   * await sdb.done()
   * ```
   *
   * @example
   * Verbose
   *
   * If you want to know when computations are bein run or when data is being loaded from the cache, use the option verbose when instanciating the SimpleDB. Messages will be logged in the terminal.
   *
   * ```js
   * const sdb = new SimpleDB({ cacheVerbose: true })
   * const table = sdb.newTable()
   *
   * await table.cache(async () => {
   *     await table.loadData("items.csv")
   *     await table.summarize({
   *         values: "price",
   *         categories: "department",
   *         summaries: ["min", "max", "mean"]
   *     })
   * }, { ttl: 60 })
   *
   * // It's important to call done() on the SimpleDB instance to clean up the cache.
   * // We don't want it to grow in size indefinitely.
   * await sdb.done()
   * ```
   *
   * @param run - A function wrapping the computations.
   * @param options - An optional object with configuration options:
   *   @param options.ttl - If the data in cache is older than the ttl (in seconds), the computations will be run. By default, there is no ttl.
   */
  async cache(
    run: () => Promise<void>,
    options: { ttl?: number } = {},
  ): Promise<void> {
    await cache(this, run, { ...options, verbose: this.sdb.cacheVerbose });
  }

  /**
   * Creates an [Observable Plot](https://github.com/observablehq/plot) chart as an image file (.png, .jpeg or .svg) from the table data.
   *
   * To create maps, use the writeMap method.
   *
   * @example
   * Basic usage:
   * ```ts
   * import { dot, plot } from "@observablehq/plot";
   *
   * const sdb = new SimpleDB();
   * const table = sdb.newTable();
   *
   * const data = [{ year: 2024, value: 10 }, { year: 2025, value: 15 }]
   *
   * await table.loadArray(data);
   *
   * const chart = (data: unknown[]) =>
   *   plot({
   *     marks: [
   *       dot(data, { x: "year", y: "value" }),
   *     ],
   *   });
   *
   * const path = "output/chart.png";
   *
   * await table.writeChart(chart, path);
   * ```
   *
   * @param chart - A function that takes data and returns an Observable Plot chart.
   * @param path - The path where the chart image will be saved.
   * @param options - Optional object containing additional settings.
   * @param options.style - CSS string to customize the chart's appearance if the Plot `style` option is not enough. Note the Plot chart is wrapped within a <div> element with the id `chart`.
   * @param options.dark - To switch the chart to dark mode. Defaults to false.
   */
  async writeChart(
    chart: (data: unknown[]) => SVGSVGElement | HTMLElement,
    path: string,
    options: { style?: string; dark?: boolean } = {},
  ): Promise<void> {
    await saveChart(
      await this.getData(),
      chart as (data: Data) => SVGSVGElement | HTMLElement, // Not great.
      path,
      options,
    );
  }

  /**
   * Creates an [Observable Plot](https://github.com/observablehq/plot) map as an image file (.png, .jpeg or .svg) from the table data.
   *
   * To create charts, use the writeChart method.
   *
   * @example
   * Basic usage:
   * ```ts
   * import { geo, plot } from "@observablehq/plot";
   *
   * const sdb = new SimpleDB();
   * const table = sdb.newTable();
   *
   * await table.loadGeoData(
   *   "./CanadianProvincesAndTerritories.geojson",
   * );
   *
   * const map = (data: {
   *   features: unknown[];
   * }) =>
   *   plot({
   *     projection: {
   *       type: "conic-conformal",
   *       rotate: [100, -60],
   *       domain: data,
   *     },
   *     marks: [
   *       geo(data, { stroke: "black", fill: "lightblue" }),
   *     ],
   *   });
   *
   * const path = "./output/map.png";
   *
   * await table.writeMap(map, path);
   * ```
   *
   * @param map - A function that takes geospatial data and returns an Observable Plot map.
   * @param path - The path where the map image will be saved.
   * @param options - An optional object with configuration options:
   *   @param options.column - The name of a column storing geometries. If there is just one, it will be used by default.
   *   @param options.rewind - If true, rewinds in the spherical winding order (important for D3.js). Default is true.
   *   @param options.style - CSS string to customize the chart's appearance if the Plot `style` option is not enough. Note the Plot chart is wrapped within a <div> element with the id `chart`.
   *   @param options.dark - To switch the chart to dark mode. Defaults to false.
   */
  async writeMap(
    map: (geoData: {
      features: {
        properties: { [key: string]: unknown };
      }[];
    }) => SVGSVGElement | HTMLElement,
    path: string,
    options: {
      column?: string;
      rewind?: boolean;
      style?: string;
      dark?: boolean;
    } = {},
  ): Promise<void> {
    options.rewind = options.rewind ?? true;
    await saveChart(
      await this.getGeoData(options.column, {
        rewind: options.rewind,
      }) as unknown as Data, // Not great.
      map as unknown as (data: Data) => SVGSVGElement | HTMLElement, // Not great.
      path,
      options,
    );
  }

  /**
   * Logs a specified number of rows. Default is 10 rows. You can optionnally log the types of the columns.
   *
   * @example
   * Basic usage
   * ```ts
   * // Logs first 10 rows. No types.
   * await table.logTable();
   * ```
   *
   * @example
   * Specific number of rows
   * ```ts
   * // Logs first 100 rows. No types.
   * await table.logTable(100);
   * ```
   *
   * @example
   * Specific number of rows in options
   * ```ts
   * // Logs first 100 rows. No types.
   * await table.logTable({ nbRowsToLog: 100 });
   * ```
   *
   * @example
   * Specific number of rows and types options
   * ```ts
   * await table.logTable({ nbRowsToLog: 100, types: true });
   * ```
   *
   * @param options Either the number of rows to log (a specific number or "all") or an object with configuration options:
   *   @param nbRowsToLog - The number of rows to log. Defaults to 10 or the value set in the SimpleWebDB instance. If you want to log all rows, you can pass "all".
   *   @param types - If true, logs the column types.
   *   @param conditions - A SQL WHERE clause condition to filter the data. Defaults to no condition.
   */
  async logTable(
    options: "all" | number | {
      nbRowsToLog?: number | "all";
      types?: boolean;
      conditions?: string;
    } = {},
  ): Promise<void> {
    if (
      this.connection === undefined
    ) {
      await this.sdb.start();
      this.db = this.sdb.db;
      this.connection = this.sdb.connection;
    }
    if (this.connection === undefined) {
      throw new Error("this.connection is undefined");
    }

    let rows: number;
    if (typeof options === "number") {
      rows = options;
    } else if (options === "all") {
      rows = await this.getNbRows();
    } else if (typeof options === "object") {
      if (options.nbRowsToLog === "all") {
        rows = await this.getNbRows();
      } else if (typeof options.nbRowsToLog === "number") {
        rows = options.nbRowsToLog;
      } else {
        rows = this.nbRowsToLog;
      }
    } else {
      rows = this.nbRowsToLog;
    }
    const types = typeof options === "object" ? options.types ?? false : false;
    const conditions = typeof options === "object"
      ? options.conditions ?? undefined
      : undefined;

    if (
      this.connection === undefined ||
      !(await this.sdb.hasTable(this.name))
    ) {
      console.log(`\nTable ${this.name}: no data`);
    } else {
      console.log(`\nTable ${this.name}:`);
      conditions && console.log(`Conditions: ${conditions}`);
      const data = await this.getTop(rows, { conditions });
      logData(
        this.types || types ? await this.getTypes() : null,
        data,
        this.nbCharactersToLog,
      );
      const nbRows = conditions
        ? parseInt(
          (await this.sdb.customQuery(
            `select count(*) as count from "${this.name}" where ${conditions}`,
            { returnDataFrom: "query" },
          ) as { count: string }[])[0].count,
        )
        : await this.getNbRows();
      console.log(
        `${formatNumber(nbRows)} rows in total ${`(nbRowsToLog: ${rows}${
          typeof this.nbCharactersToLog === "number"
            ? `, nbCharactersToLog: ${this.nbCharactersToLog}`
            : ""
        })`}`,
      );
    }
  }

  /**
   * Generates and logs a line chart. The data is expected to be sorted by the x-axis values.
   *
   * @example
   * Basic usage
   * ```typescript
   * const data = [
   *     { date: new Date("2023-01-01"), value: 10 },
   *     { date: new Date("2023-02-01"), value: 20 },
   *     { date: new Date("2023-03-01"), value: 30 },
   *     { date: new Date("2023-04-01"), value: 40 },
   * ]
   * await table.loadArray(data)
   * await table.convert({ date: "string" }, { datetimeFormat: "%x" })
   * await table.logLineChart("date", "value")
   * ```
   *
   * @example
   * Small multiples
   * ```typescript
   * const data = [
   *     { date: new Date("2023-01-01"), value: 10, category: "A" },
   *     { date: new Date("2023-02-01"), value: 20, category: "A" },
   *     { date: new Date("2023-03-01"), value: 30, category: "A" },
   *     { date: new Date("2023-04-01"), value: 40, category: "A" },
   *     { date: new Date("2023-01-01"), value: 15, category: "B" },
   *     { date: new Date("2023-02-01"), value: 25, category: "B" },
   *     { date: new Date("2023-03-01"), value: 35, category: "B" },
   *     { date: new Date("2023-04-01"), value: 45, category: "B" },
   * ]
   * await table.loadArray(data)
   * await table.convert({ date: "string" }, { datetimeFormat: "%x" })
   * await table.logLineChart("date", "value", {
   *     smallMultiples: "category",
   * })
   * ```
   *
   * @param x - The key for the x-axis values in the data objects.
   * @param y - The key for the y-axis values in the data objects.
   * @param options - An optional object to customize the chart.
   * @param options.formatX - A function to format the x-axis values.
   * @param options.formatY - A function to format the y-axis values.
   * @param options.smallMultiples - A key in the data objects to create small multiples of the chart.
   * @param options.fixedScales - A boolean to determine if small multiple scales should be identical.
   * @param options.smallMultiplesPerRow - The number of small multiples per row.
   * @param options.width - The width of the chart.
   * @param options.height - The height of the chart.
   *
   * @category Dataviz
   */
  async logLineChart(
    x: string,
    y: string,
    options: {
      formatX?: (d: unknown) => string;
      formatY?: (d: unknown) => string;
      smallMultiples?: string;
      fixedScales?: boolean;
      smallMultiplesPerRow?: number;
      width?: number;
      height?: number;
    } = {},
  ): Promise<void> {
    const data = await this.sdb.customQuery(
      `SELECT "${x}", "${y}"${
        typeof options.smallMultiples === "string"
          ? `, "${options.smallMultiples}"`
          : ""
      } FROM "${this.name}"`,
      { returnDataFrom: "query" },
    );
    logLineChart(data as { [key: string]: unknown }[], x, y, options);
  }

  /**
   * Generates and logs a dot chart. The data is expected to be sorted by the x-axis values.
   *
   * @example
   * Basic usage
   * ```typescript
   * const data = [
   *     { date: new Date("2023-01-01"), value: 10 },
   *     { date: new Date("2023-02-01"), value: 20 },
   *     { date: new Date("2023-03-01"), value: 30 },
   *     { date: new Date("2023-04-01"), value: 40 },
   * ]
   * await table.loadArray(data)
   * await table.convert({ date: "string" }, { datetimeFormat: "%x" })
   * await table.logDotChart("date", "value")
   * ```
   *
   * @example
   * Small multiples
   * ```typescript
   * const data = [
   *     { date: new Date("2023-01-01"), value: 10, category: "A" },
   *     { date: new Date("2023-02-01"), value: 20, category: "A" },
   *     { date: new Date("2023-03-01"), value: 30, category: "A" },
   *     { date: new Date("2023-04-01"), value: 40, category: "A" },
   *     { date: new Date("2023-01-01"), value: 15, category: "B" },
   *     { date: new Date("2023-02-01"), value: 25, category: "B" },
   *     { date: new Date("2023-03-01"), value: 35, category: "B" },
   *     { date: new Date("2023-04-01"), value: 45, category: "B" },
   * ]
   * await table.loadArray(data)
   * await table.convert({ date: "string" }, { datetimeFormat: "%x" })
   * await table.logDotChart("date", "value", {
   *     smallMultiples: "category",
   * })
   * ```
   *
   * @param x - The key for the x-axis values in the data objects.
   * @param y - The key for the y-axis values in the data objects.
   * @param options - An optional object to customize the chart.
   * @param options.formatX - A function to format the x-axis values.
   * @param options.formatY - A function to format the y-axis values.
   * @param options.smallMultiples - A key in the data objects to create small multiples of the chart.
   * @param options.fixedScales - A boolean to determine if small multiple scales should be identical.
   * @param options.smallMultiplesPerRow - The number of small multiples per row.
   * @param options.width - The width of the chart.
   * @param options.height - The height of the chart.
   *
   * @category Dataviz
   */
  async logDotChart(
    x: string,
    y: string,
    options: {
      formatX?: (d: unknown) => string;
      formatY?: (d: unknown) => string;
      smallMultiples?: string;
      fixedScales?: boolean;
      smallMultiplesPerRow?: number;
      width?: number;
      height?: number;
    } = {},
  ): Promise<void> {
    const data = await this.sdb.customQuery(
      `SELECT "${x}", "${y}"${
        typeof options.smallMultiples === "string"
          ? `, "${options.smallMultiples}"`
          : ""
      } FROM "${this.name}"`,
      { returnDataFrom: "query" },
    );
    logDotChart(data as { [key: string]: unknown }[], x, y, options);
  }

  /**
   * Generates and logs a bar chart. The data is expected to be sorted.
   *
   * @example
   * ```typescript
   * const data = [
   *     { category: "A", value: 10 },
   *     { category: "B", value: 20 },
   * ]
   * await table.loadArray(data)
   * await table.logBarChart("category", "value")
   * ```
   *
   * @param labels - The key in the data objects to be used for the labels.
   * @param values - The key in the data objects to be used for the values.
   * @param options - Optional configuration for the chart.
   * @param options.formatLabels - A function to format the labels. Defaults to converting the label to a string.
   * @param options.formatValues - A function to format the values. Defaults to converting the value to a string.
   * @param options.width - The width of the chart. Defaults to 40.
   *
   * @category Dataviz
   */
  async logBarChart(
    labels: string,
    values: string,
    options: {
      formatLabels?: (d: unknown) => string;
      formatValues?: (d: unknown) => string;
      width?: number;
    } = {},
  ): Promise<void> {
    const data = await this.sdb.customQuery(
      `SELECT "${labels}", "${values}" FROM "${this.name}"`,
      { returnDataFrom: "query" },
    );
    logBarChart(
      data as { [key: string]: unknown }[],
      labels,
      values,
      options,
    );
  }

  /**
   * Generates and logs a histogram. The data is expected to be numeric.
   *
   * @example
   * Basic usage
   * ```typescript
   * await table.logHistogram("temperature")
   * ```
   *
   * @param values - The key for the numeric values.
   * @param options - An optional object to customize the histogram.
   * @param options.bins - The number of bins to use for the histogram. Defaults to 10.
   * @param options.formatLabels - A function to format the labels for the bins.
   * @param options.compact - A boolean to determine if the histogram should be compact.
   * @param options.width - The width of the histogram.
   *
   * @category Dataviz
   */
  async logHistogram(
    values: string,
    options: {
      bins?: number;
      formatLabels?: (a: number, b: number) => string;
      compact?: boolean;
      width?: number;
    } = {},
  ): Promise<void> {
    await logHistogram(this, values, options);
  }

  /**
   * Logs descriptive information about the columns, including details like data types, number of null and distinct values. It calls getDescription.
   *
   * @example
   * Basic usage
   * ```ts
   * await table.logDescription()
   * ```
   */
  async logDescription(): Promise<void> {
    if (
      this.connection === undefined ||
      !(await this.sdb.hasTable(this.name))
    ) {
      console.log(`\ntable ${this.name}: no data`);
    } else {
      console.log(`\ntable ${this.name}:`);
      console.table(await getDescription(this));
    }
  }

  /**
   * Logs the projections, if any.
   *
   * @example
   * Basic usage
   * ```ts
   * await table.logProjections()
   * ```
   */
  async logProjections(): Promise<SimpleTable> {
    console.log(`\ntable ${this.name} projections:`);
    console.log(this.projections);
    return await this;
  }

  /**
   * Logs the types of the columns.
   *
   * @example
   * Basic usage
   * ```ts
   * await table.logTypes()
   * ```
   */
  async logTypes(): Promise<SimpleTable> {
    console.log(`\ntable ${this.name} types:`);
    console.log(await this.getTypes());
    return await this;
  }

  /**
   * Logs unique values for a column. By default, a maximum of 100 values are logged (depending on your runtime). You can optionnally stringify the values to see them all.
   *
   * @example
   * Basic usage
   * ```ts
   * // Logs unique values for the column "name".
   * await table.logUniques("name")
   * ```
   *
   * @example
   * Stringifying the values
   * ```ts
   * // Logs unique values for the column "name" and stringifies them.
   * await table.logUniques("name", { stringify: true })
   * ```
   *
   * @param column - The name of the column.
   * @param options - An optional object with configuration options:
   *  @param options.stringify - If true, stringifies the values.
   */
  async logUniques(
    column: string,
    options: { stringify?: boolean } = {},
  ): Promise<SimpleTable> {
    const values = await this.getUniques(column);
    console.log(`\nUnique values in ${column}:`);
    if (options.stringify) {
      console.log(JSON.stringify(values, null, 2));
    } else {
      console.log(values);
    }
    return await this;
  }

  /**
   * Logs the columns in the table.
   *
   * @example
   * Basic usage
   * ```ts
   * await table.logColumns()
   * ```
   *
   * @example
   * With types
   * ```ts
   * await table.logColumns({ types: true })
   * ```
   */
  async logColumns(options: { types?: boolean } = {}): Promise<SimpleTable> {
    console.log(`\nTable ${this.name} columns:`);
    if (options.types) {
      console.log(await this.getTypes());
    } else {
      console.log(await this.getColumns());
    }

    return await this;
  }

  /**
   * Logs the number of rows in the table.
   *
   * @example
   * Basic usage
   * ```ts
   * await table.logNbRows()
   * ```
   */
  async logNbRows(): Promise<SimpleTable> {
    const nbRows = await this.getNbRows();
    console.log(`\nTable ${this.name}: ${formatNumber(nbRows)} rows.`);
    return await this;
  }

  /**
   * Logs the bottom n rows.
   *
   * @example
   * Basic usage
   * ```ts
   * await table.logBottom(10)
   * ```
   *
   * @param count - The number of rows to log.
   */
  async logBottom(
    count: number,
  ): Promise<void> {
    console.log(`\nTable ${this.name} (${count} bottom rows):`);
    const data = await this.getBottom(count, { originalOrder: true });
    logData(
      null,
      data,
      this.nbCharactersToLog,
    );
  }

  /**
   * Logs the extent of a column.
   *
   * @example
   * Basic usage
   * ```ts
   * await table.logExtent("price")
   * ```
   *
   * @param column - The name of the column.
   */
  async logExtent(column: string): Promise<void> {
    const extent = await this.getExtent(column);
    console.log(`\nTable ${this.name} (${column} extent):`);
    console.log(extent);
  }
}
