import { csvFormat } from "d3-dsv";
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
import splitSpread from "../methods/splitSpread.ts";
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
import { camelCase, formatNumber } from "@nshiab/journalism-format";
import createDirectory from "../helpers/createDirectory.ts";
import { overwriteSheetData } from "@nshiab/journalism-google";
import {
  logBarChart,
  logDotChart,
  logLineChart,
  rewind,
  saveChart,
} from "@nshiab/journalism-dataviz";
import writeDataAsArrays from "../helpers/writeDataAsArrays.ts";
import logHistogram from "../methods/logHistogram.ts";
import logData from "../helpers/logData.ts";
import { readFileSync, writeFileSync } from "node:fs";
import type { Data } from "@observablehq/plot";
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
import type { Ollama } from "ollama";
import unnestQuery from "../helpers/unnestQuery.ts";
import nestQuery from "../helpers/nestQuery.ts";
import concatenateRowQuery from "../helpers/concatenateRowQuery.ts";

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
          .map((d) => `"${d}" ${parseType(types[d])}`)
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
   * For Ollama, set the `OLLAMA` environment variable to `true`, ensure Ollama is running, and set `AI_MODEL` to your desired model name. You can also pass your instance of Ollama to the `ollama` option.
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
   * @param newColumn - The name of the new column (or an array of column names) where the AI's response will be stored.
   * @param prompt - The input string to guide the AI's response.
   * @param options - Configuration options for the AI request.
   * @param options.batchSize - The number of rows to process in each batch. Defaults to `1`.
   * @param options.concurrent - The number of concurrent requests to send. Defaults to `1`.
   * @param options.cache - If `true`, the results will be cached locally. Defaults to `false`.
   * @param options.test - A function to validate the returned data. If it throws an error, the request will be retried (if `retry` is set). Defaults to `undefined`.
   * @param options.retry - The number of times to retry the request in case of failure. Defaults to `0`.
   * @param options.rateLimitPerMinute - The rate limit for AI requests in requests per minute. The method will wait between requests if necessary. Defaults to `undefined` (no limit).
   * @param options.model - The AI model to use. Defaults to the `AI_MODEL` environment variable.
   * @param options.apiKey - The API key for the AI service. Defaults to the `AI_KEY` environment variable.
   * @param options.vertex - If `true`, uses Vertex AI. Automatically set to `true` if `AI_PROJECT` and `AI_LOCATION` are set in the environment. Defaults to `false`.
   * @param options.project - The Google Cloud project ID for Vertex AI. Defaults to the `AI_PROJECT` environment variable.
   * @param options.location - The Google Cloud location for Vertex AI. Defaults to the `AI_LOCATION` environment variable.
   * @param options.ollama - If `true`, uses Ollama. Defaults to the `OLLAMA` environment variable. If you want your Ollama
  instance to be used, you can pass it here too.
   * @param options.verbose - If `true`, logs additional debugging information, including the full prompt sent to the AI. Defaults to `false`.
   * @param options.clean - A function to clean the AI's response after JSON parsing, testing, caching, and storing. Defaults to `undefined`.
   * @param options.contextWindow - An option to specify the context window size for Ollama models. By default, Ollama sets this depending on the model, which can be lower than the actual maximum context window size of the model.
   * @param options.thinkingBudget - Sets the reasoning token budget: 0 to disable (default, though some models may reason regardless), -1 for a dynamic budget, or > 0 for a fixed budget. For Ollama models, any non-zero value simply enables reasoning, ignoring the specific budget amount.
   * @param options.extraInstructions - Additional instructions to append to the prompt, providing more context or guidance for the AI.
   * @param options.metrics - An object to track cumulative metrics across multiple AI requests. Pass an object with totalCost, totalInputTokens, totalOutputTokens, and totalRequests properties (all initialized to 0). The function will update these values after each request. Note: totalCost is only calculated for Google GenAI models, not for Ollama.
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
   *     test: (data: { [key: string]: unknown }) => { // Validate AI's response
   *       if (
   *         typeof data.gender !== "string" ||
   *         !["Man", "Woman", "Neutral"].includes(data.gender)
   *       ) {
   *         throw new Error(`Invalid response: ${data.gender}`);
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
   *
   * @example
   * ```ts
   * await table.loadArray([
   *   { city: "Marrakech" },
   *   { city: "Kyoto" },
   *   { city: "Auckland" },
   * ]);
   *
   * await table.aiRowByRow(
   *   "city",
   *   ["country", "continent"], // Multiple new columns
   *   `Give me the country and continent of the city.`,
   *   { verbose: true },
   * );
   *
   * // Example results:
   * // [
   * //   { city: "Marrakech", country: "Morocco", continent: "Africa" },
   * //   { city: "Kyoto", country: "Japan", continent: "Asia" },
   * //   { city: "Auckland", country: "New Zealand", continent: "Oceania" },
   * // ]
   * ```
   */
  async aiRowByRow(
    column: string,
    newColumn: string | string[],
    prompt: string,
    options: {
      batchSize?: number;
      concurrent?: number;
      cache?: boolean;
      test?: (result: { [key: string]: unknown }) => void;
      retry?: number;
      model?: string;
      apiKey?: string;
      vertex?: boolean;
      project?: string;
      location?: string;
      ollama?: boolean | Ollama;
      verbose?: boolean;
      rateLimitPerMinute?: number;
      clean?: (
        response: unknown,
      ) => unknown;
      contextWindow?: number;
      thinkingBudget?: number;
      extraInstructions?: string;
      metrics?: {
        totalCost: number;
        totalInputTokens: number;
        totalOutputTokens: number;
        totalRequests: number;
      };
    } = {},
  ): Promise<void> {
    await aiRowByRow(this, column, newColumn, prompt, options);
  }

  /**
   * Generates embeddings for a specified text column and stores the results in a new column.
   *
   * This method supports Google Gemini, Vertex AI, and local models running with Ollama. Credentials and model selection are determined by environment variables (`AI_KEY`, `AI_PROJECT`, `AI_LOCATION`, `AI_EMBEDDINGS_MODEL`) or directly via `options`, with `options` taking precedence.
   *
   * For Ollama, set the `OLLAMA` environment variable to `true`, ensure Ollama is running, and set `AI_EMBEDDINGS_MODEL` to your desired model name. You can also pass your instance of Ollama to the `ollama` option.
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
   * @param options.ollama - If `true`, uses Ollama. Defaults to the `OLLAMA` environment variable. If you want your Ollama
  instance to be used, you can pass it here too.
   * @param options.contextWindow - An option to specify the context window size for Ollama models. By default, Ollama sets this depending on the model, which can be lower than the actual maximum context window size of the model.
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
    ollama?: boolean | Ollama;
    verbose?: boolean;
    rateLimitPerMinute?: number;
    contextWindow?: number;
  } = {}): Promise<void> {
    await aiEmbeddings(this, column, newColumn, options);
  }

  /**
   * Creates an embedding from a specified text and returns the most similar text content based on their embeddings.
   * This method is useful for semantic search and text similarity tasks, computing cosine distance and sorting results by similarity.
   *
   * To create the embedding, this method supports Google Gemini, Vertex AI, and local models running with Ollama. Credentials and model selection are determined by environment variables (`AI_KEY`, `AI_PROJECT`, `AI_LOCATION`, `AI_EMBEDDINGS_MODEL`) or directly via `options`, with `options` taking precedence.
   *
   * For Ollama, set the `OLLAMA` environment variable to `true`, ensure Ollama is running, and set `AI_EMBEDDINGS_MODEL` to your desired model name. You can also pass your instance of Ollama to the `ollama` option.
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
   * @param options.ollama - If `true`, uses Ollama. Defaults to the `OLLAMA` environment variable. If you want your Ollama
  instance to be used, you can pass it here too.
   * @param options.verbose - If `true`, logs additional debugging information. Defaults to `false`.
   * @param options.contextWindow - An option to specify the context window size for Ollama models. By default, Ollama sets this depending on the model, which can be lower than the actual maximum context window size of the model.
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
      ollama?: boolean | Ollama;
      contextWindow?: number;
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
   * For Ollama, set the `OLLAMA` environment variable to `true`, ensure Ollama is running, and set `AI_MODEL` to your desired model name. You can also pass your instance of Ollama to the `ollama` option.
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
   * @param options.ollama - If `true`, uses Ollama. Defaults to the `OLLAMA` environment variable. If you want your Ollama
  instance to be used, you can pass it here too.
   * @param options.contextWindow - An option to specify the context window size for Ollama models. By default, Ollama sets this depending on the model, which can be lower than the actual maximum context window size of the model.
   * @param options.thinkingBudget - Sets the reasoning token budget: 0 to disable (default, though some models may reason regardless), -1 for a dynamic budget, or > 0 for a fixed budget. For Ollama models, any non-zero value simply enables reasoning, ignoring the specific budget amount.
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
    ollama?: boolean | Ollama;
    contextWindow?: number;
    thinkingBudget?: number;
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
   * Inserts all rows from one or more other tables into this table. If tables do not have the same columns, an error will be thrown unless the `unifyColumns` option is set to `true`.
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

    // Checking columns, types and projections
    if (!options.unifyColumns) {
      const thisColumns = (await this.getColumns()).sort().join(",");
      for (const table of array) {
        const tableColumns = (await table.getColumns()).sort().join(",");
        if (thisColumns !== tableColumns) {
          throw new Error(
            `Tables ${this.name} and ${table.name} don't have the same columns: ${thisColumns} vs ${tableColumns}`,
          );
        }
      }
    }
    const allTables = [this, ...array];
    const allTypes: { [key: string]: string } = {};
    const allProjections: { [key: string]: string } = {};
    for (const table of allTables) {
      const types = await table.getTypes();
      for (const key in types) {
        if (!allTypes[key]) {
          allTypes[key] = types[key];
          allProjections[key] = table.projections[key];
        } else {
          if (allTypes[key] !== types[key]) {
            throw new Error(
              `The column ${key} has different types in the tables.`,
            );
          } else if (allProjections[key] !== table.projections[key]) {
            throw new Error(
              `The column ${key} has different projections in the tables.`,
            );
          }
        }
      }
    }

    let columnsAdded: {
      [key: string]: string[];
    } = {};
    if (options.unifyColumns) {
      columnsAdded = await unifyColumns(allTables, allTypes, allProjections);
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
   * @param nameOrOptions - Either a string specifying the name of the new table, or an optional object with configuration options. If not provided, a default name (e.g., "table1", "table2") will be generated.
   * @param nameOrOptions.outputTable - The name of the new table to be created in the database. If not provided, a default name (e.g., "table1", "table2") will be generated.
   * @param nameOrOptions.conditions - A SQL `WHERE` clause condition to filter the data during cloning. Defaults to no condition (clones all rows).
   * @param nameOrOptions.columns - An array of column names to include in the cloned table. If not provided, all columns will be included.
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
   * // Clone tableA to a new table named "my_cloned_table" using string parameter
   * const tableB = await tableA.cloneTable("my_cloned_table");
   * ```
   *
   * @example
   * ```ts
   * // Clone tableA to a new table named "my_cloned_table" using options object
   * const tableB = await tableA.cloneTable({ outputTable: "my_cloned_table" });
   * ```
   *
   * @example
   * ```ts
   * // Clone tableA, including only rows where 'column1' is greater than 10
   * const tableB = await tableA.cloneTable({ conditions: `column1 > 10` });
   * ```
   *
   * @example
   * ```ts
   * // Clone tableA with only specific columns
   * const tableB = await tableA.cloneTable({ columns: ["name", "age", "city"] });
   * ```
   *
   * @example
   * ```ts
   * // Clone tableA to a specific table name with filtered data and specific columns
   * const tableB = await tableA.cloneTable({
   *   outputTable: "filtered_data",
   *   conditions: `status = 'active' AND created_date >= '2023-01-01'`,
   *   columns: ["name", "status", "created_date"]
   * });
   * ```
   */
  async cloneTable(
    nameOrOptions: string | {
      outputTable?: string;
      conditions?: string;
      columns?: string | string[];
    } = {},
  ): Promise<SimpleTable> {
    const columns = typeof nameOrOptions === "object" && nameOrOptions.columns
      ? stringToArray(nameOrOptions.columns)
      : [];

    // Dealing with projections
    const clonedProjections = structuredClone(this.projections);
    let newProjections: {
      [key: string]: string;
    } = {};
    if (columns.length > 0) {
      for (const col of columns) {
        if (clonedProjections[col]) {
          newProjections[col] = clonedProjections[col];
        }
      }
    } else {
      newProjections = clonedProjections;
    }

    // Should match newTable from SimpleDB
    let clonedTable;
    const options = typeof nameOrOptions === "string"
      ? { outputTable: nameOrOptions }
      : nameOrOptions;
    if (typeof options.outputTable === "string") {
      clonedTable = new SimpleTable(
        options.outputTable,
        newProjections,
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
        newProjections,
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
      cloneQuery(this.name, clonedTable.name, columns, options),
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
   * Splits strings in a specified column by a separator and spreads the resulting parts into multiple new columns.
   *
   * Each part of the split string will be stored in a separate column. The number of columns created is determined by the length of the `newColumns` array.
   * If a row has fewer parts than the number of new columns, a warning will be logged and the extra columns will contain empty strings (unless `noCheck` is set to true).
   * If a row has more parts than the number of new columns, an error will be thrown unless `noCheck` is set to true.
   *
   * @param column - The name of the column containing the strings to be split.
   * @param separator - The substring to use as a delimiter for splitting the strings.
   * @param newColumns - An array of column names for the extracted parts.
   * @param options - Optional configuration.
   * @param options.noCheck - If true, skips all validation checks (both max and min parts). Default is false.
   * @returns A promise that resolves when the strings have been split and spread into new columns.
   * @category Updating Data
   *
   * @example
   * ```ts
   * // Split 'fullName' by comma and spread into 'lastName' and 'firstName'
   * // e.g., "Shiab, Nael" -> lastName: "Shiab", firstName: "Nael"
   * await table.splitSpread("fullName", ",", ["lastName", "firstName"]);
   * ```
   *
   * @example
   * ```ts
   * // Split 'address' by comma and spread into three columns
   * // e.g., "123 Main St, Anytown, USA" -> street: "123 Main St", city: "Anytown", country: "USA"
   * await table.splitSpread("address", ",", ["street", "city", "country"]);
   * ```
   *
   * @example
   * ```ts
   * // Skip validation for performance with noCheck option
   * await table.splitSpread("data", "|", ["col1", "col2"], { noCheck: true });
   * ```
   */
  async splitSpread(
    column: string,
    separator: string,
    newColumns: string[],
    options: {
      noCheck?: boolean;
    } = {},
  ): Promise<void> {
    await splitSpread(this, column, separator, newColumns, options);
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
   * Concatenates values from multiple columns into a new column with labeled rows.
   *
   * This method creates a new column where each value is a concatenation of the specified columns,
   * with each column value prefixed by its column name and a colon, followed by a newline.
   * Column entries are separated by double newlines ("\n\n").
   *
   * All values must be string, otherwise an error will be thrown. Use the `convert()` method first to convert non-string columns to string.
   *
   * If a column value is `NULL`, it will be replaced by `'Unknown'` in the concatenated result.
   *
   * @param columns - An array of column names whose values will be concatenated with labels.
   * @param newColumn - The name of the new column to create with the concatenated values.
   * @returns A promise that resolves when the concatenation is complete.
   * @category Updating Data
   *
   * @example
   * ```ts
   * // Concatenate multiple string columns into a labeled text field
   * await table.concatenateRow(
   *   ["summary", "findings", "context", "date", "quote"],
   *   "fullText"
   * );
   * // Result in "fullText" will look like:
   * // summary:
   * // [value]
   * //
   * // findings:
   * // [value]
   * //
   * // context:
   * // [value]
   * //
   * // date:
   * // [value]
   * //
   * // quote:
   * // [value]
   * ```
   *
   * @example
   * ```ts
   * // Convert numeric columns to strings first, then concatenate
   * // NULL values will appear as 'Unknown'
   * await table.convert({ age: "string", salary: "string" });
   * await table.concatenateRow(["name", "age", "salary"], "profile");
   * ```
   */
  async concatenateRow(
    columns: string[],
    newColumn: string,
  ): Promise<void> {
    const allTypes = await this.getTypes();
    for (const col of columns) {
      if (allTypes[col] !== "VARCHAR") {
        throw new Error(
          `The column ${col} is of type ${
            allTypes[col]
          }. The concatenateRow() method only works with string columns. Please convert the column to string first with the .convert() method.`,
        );
      }
    }

    await queryDB(
      this,
      concatenateRowQuery(this.name, columns, newColumn),
      mergeOptions(this, {
        table: this.name,
        method: "concatenateRow()",
        parameters: { columns, newColumn },
      }),
    );
  }

  /**
   * Unnests (expands) rows by splitting a column's string values into multiple rows based on a separator.
   *
   * Each value in the specified column is split using the provided separator, and a new row is created for each resulting substring. All other column values are duplicated across the newly created rows.
   *
   * @param column - The name of the column containing string values to be split and unnested.
   * @param separator - The delimiter string used to split the column values.
   * @returns A promise that resolves when the unnesting is complete.
   * @category Updating Data
   *
   * @example
   * ```ts
   * // Unnest 'tags' column separated by commas
   * // Before: [{ id: 1, tags: "red,blue,green" }]
   * // After:  [{ id: 1, tags: "red" }, { id: 1, tags: "blue" }, { id: 1, tags: "green" }]
   * await table.unnest("tags", ",");
   * ```
   *
   * @example
   * ```ts
   * // Unnest 'neighborhoods' column separated by " / "
   * // Before: [{ city: "Montreal", neighborhoods: "Old Montreal / Chinatown / Griffintown" }]
   * // After:  [{ city: "Montreal", neighborhoods: "Old Montreal" },
   * //         { city: "Montreal", neighborhoods: "Chinatown" },
   * //         { city: "Montreal", neighborhoods: "Griffintown" }]
   * await table.unnest("neighborhoods", " / ");
   * ```
   */
  async unnest(column: string, separator: string): Promise<void> {
    await queryDB(
      this,
      unnestQuery(this.name, column, separator),
      mergeOptions(this, {
        table: this.name,
        method: "unnest()",
        parameters: { column, separator },
      }),
    );
  }

  /**
   * Nests (collapses) rows by aggregating a column's values into a single string per group, separated by a delimiter.
   *
   * This is the inverse operation of `unnest()`. Multiple rows are combined into fewer rows by grouping on specified category columns and concatenating the target column values with a separator.
   *
   * @param column - The name of the column whose values will be aggregated and concatenated.
   * @param separator - The delimiter string used to join the column values.
   * @param categories - The column name or an array of column names to group by.
   * @returns A promise that resolves when the nesting is complete.
   * @category Updating Data
   *
   * @example
   * ```ts
   * // Nest 'neighborhoods' column separated by " / " for each city
   * // Before: [{ city: "Montreal", neighborhoods: "Old Montreal" },
   * //         { city: "Montreal", neighborhoods: "Chinatown" },
   * //         { city: "Montreal", neighborhoods: "Griffintown" }]
   * // After:  [{ city: "Montreal", neighborhoods: "Old Montreal / Chinatown / Griffintown" }]
   * await table.nest("neighborhoods", " / ", "city");
   * ```
   *
   * @example
   * ```ts
   * // Nest with multiple category columns
   * // Before: [{ country: "Canada", city: "Montreal", tags: "red" },
   * //         { country: "Canada", city: "Montreal", tags: "blue" }]
   * // After:  [{ country: "Canada", city: "Montreal", tags: "red,blue" }]
   * await table.nest("tags", ",", ["country", "city"]);
   * ```
   */
  async nest(
    column: string,
    separator: string,
    categories: string | string[],
  ): Promise<void> {
    await queryDB(
      this,
      nestQuery(this.name, column, separator, categories),
      mergeOptions(this, {
        table: this.name,
        method: "nest()",
        parameters: { column, separator, categories },
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

  /**
   * Returns the data from the table as a CSV string, optionally filtered by SQL conditions.
   * You can also use JavaScript syntax for conditions (e.g., `&&`, `||`, `===`, `!==`).
   *
   * @param options - An optional object with configuration options:
   * @param options.conditions - The filtering conditions specified as a SQL `WHERE` clause (e.g., `"category = 'Book'"`).
   * @returns A promise that resolves to a CSV-formatted string representation of the table data.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get all data from the table as CSV
   * const allDataCSV = await table.getDataAsCSV();
   * console.log(allDataCSV);
   * ```
   *
   * @example
   * ```ts
   * // Get data filtered by a condition (using JS syntax or SQL syntax) as CSV
   * const booksDataCSV = await table.getDataAsCSV({ conditions: `category === 'Book'` });
   * console.log(booksDataCSV);
   * ```
   */
  async getDataAsCSV(options: {
    conditions?: string;
  } = {}): Promise<string> {
    const data = await this.getData(options);
    return csvFormat(data);
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
   * Computes the length of line geometries in meters (`"m"`) or optionally kilometers (`"km"`).
   * The input geometry is assumed to be in the EPSG:4326 coordinate system (WGS84), with `[latitude, longitude]` axis order.
   *
   * @param newColumn - The name of the new column where the computed lengths will be stored.
   * @param options - An optional object with configuration options:
   * @param options.unit - The unit for the computed length: `"m"` (meters) or `"km"` (kilometers). Defaults to `"m"`.
   * @param options.column - The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.
   * @returns A promise that resolves when the lengths have been computed.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Compute the length of line geometries in meters and store in 'length_m'
   * await table.length("length_m");
   * ```
   *
   * @example
   * ```ts
   * // Compute the length of line geometries in kilometers and store in 'length_km'
   * await table.length("length_km", { unit: "km" });
   * ```
   *
   * @example
   * ```ts
   * // Compute the length of geometries in a specific column named 'routeGeom'
   * await table.length("routeLength", { column: "routeGeom" });
   * ```
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
   * Computes the perimeter of polygon geometries in meters (`"m"`) or optionally kilometers (`"km"`).
   * The input geometry is assumed to be in the EPSG:4326 coordinate system (WGS84), with `[latitude, longitude]` axis order.
   *
   * @param newColumn - The name of the new column where the computed perimeters will be stored.
   * @param options - An optional object with configuration options:
   * @param options.unit - The unit for the computed perimeter: `"m"` (meters) or `"km"` (kilometers). Defaults to `"m"`.
   * @param options.column - The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.
   * @returns A promise that resolves when the perimeters have been computed.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Compute the perimeter of polygon geometries in meters and store in 'perimeter_m'
   * await table.perimeter("perimeter_m");
   * ```
   *
   * @example
   * ```ts
   * // Compute the perimeter of polygon geometries in kilometers and store in 'perimeter_km'
   * await table.perimeter("perimeter_km", { unit: "km" });
   * ```
   *
   * @example
   * ```ts
   * // Compute the perimeter of geometries in a specific column named 'landParcelGeom'
   * await table.perimeter("landParcelPerimeter", { column: "landParcelGeom" });
   * ```
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
   * Computes a buffer (a polygon representing a specified distance around a geometry) for geometries in a specified column.
   * The distance is in the Spatial Reference System (SRS) unit of the input geometries.
   *
   * @param newColumn - The name of the new column where the buffered geometries will be stored.
   * @param distance - The distance for the buffer. This value is in the units of the geometry's SRS.
   * @param options - An optional object with configuration options:
   * @param options.column - The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.
   * @returns A promise that resolves when the buffers have been computed.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Create a buffer of 1 unit around geometries in the default column, storing results in 'bufferedGeom'
   * await table.buffer("bufferedGeom", 1);
   * ```
   *
   * @example
   * ```ts
   * // Create a buffer of 10 units around geometries in a specific column named 'pointsGeom'
   * await table.buffer("pointsBuffer", 10, { column: "pointsGeom" });
   * ```
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
   * Merges the data of this table (considered the left table) with another table (the right table) based on a spatial relationship.
   * Note that the order of rows in the returned data is not guaranteed to be the same as in the original tables.
   * This operation might create temporary files in a `.tmp` folder; consider adding `.tmp` to your `.gitignore`.
   *
   * @param rightTable - The SimpleTable instance to be joined with this table.
   * @param method - The spatial join method to use: `"intersect"` (geometries overlap), `"inside"` (geometries of the left table are entirely within geometries of the right table), or `"within"` (geometries of the left table are within a specified distance of geometries in the right table).
   * @param options - An optional object with configuration options:
   * @param options.leftTableColumn - The name of the column storing geometries in the left table (this table). If omitted, the method attempts to find one.
   * @param options.rightTableColumn - The name of the column storing geometries in the right table. If omitted, the method attempts to find one.
   * @param options.type - The type of join operation to perform: `"inner"`, `"left"` (default), `"right"`, or `"full"`. For some types (like `"inside"`), the table order is important.
   * @param options.distance - Required if `method` is `"within"`. The target distance for the spatial join. The unit depends on `distanceMethod`.
   * @param options.distanceMethod - The method for distance calculations: `"srs"` (default, uses the SRS unit), `"haversine"` (uses meters, requires EPSG:4326 input), or `"spheroid"` (uses meters, requires EPSG:4326 input, most accurate but slowest).
   * @param options.outputTable - If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.
   * @returns A promise that resolves to the SimpleTable instance containing the spatially joined data (either the modified current table or a new table).
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Merge data based on intersecting geometries, overwriting tableA
   * await tableA.joinGeo(tableB, "intersect");
   * ```
   *
   * @example
   * ```ts
   * // Merge data where geometries in tableA are inside geometries in tableB
   * await tableA.joinGeo(tableB, "inside");
   * ```
   *
   * @example
   * ```ts
   * // Merge data where geometries in tableA are within 10 units (SRS) of geometries in tableB
   * await tableA.joinGeo(tableB, "within", { distance: 10 });
   * ```
   *
   * @example
   * ```ts
   * // Merge data where geometries in tableA are within 10 kilometers (Haversine) of geometries in tableB
   * // Input geometries must be in EPSG:4326.
   * await tableA.joinGeo(tableB, "within", { distance: 10, distanceMethod: "haversine", unit: "km" });
   * ```
   *
   * @example
   * ```ts
   * // Merge data with specific geometry columns and an inner join type, storing results in a new table
   * const tableC = await tableA.joinGeo(tableB, "intersect", {
   *   leftTableColumn: "geometriesA",
   *   rightTableColumn: "geometriesB",
   *   type: "inner",
   *   outputTable: true,
   * });
   * ```
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
   * Computes the intersection of two sets of geometries, creating new geometries where they overlap.
   *
   * @param column1 - The name of the first column storing geometries.
   * @param column2 - The name of the second column storing geometries. Both columns must have the same projection.
   * @param newColumn - The name of the new column where the computed intersection geometries will be stored.
   * @returns A promise that resolves when the intersection geometries have been computed.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Compute the intersection of geometries in 'geomA' and 'geomB' columns, storing results in 'intersectGeom'
   * await table.intersection("geomA", "geomB", "intersectGeom");
   * ```
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
   * Removes the intersection of two geometries from the first geometry, effectively computing the geometric difference.
   *
   * @param column1 - The name of the column storing the reference geometries. These geometries will have the intersection removed.
   * @param column2 - The name of the column storing the geometries used to compute the intersection. Both columns must have the same projection.
   * @param newColumn - The name of the new column where the resulting geometries (without the intersection) will be stored.
   * @returns A promise that resolves when the geometries have been processed.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Remove the intersection of 'geomB' from 'geomA', storing the result in 'geomA_minus_geomB'
   * await table.removeIntersection("geomA", "geomB", "geomA_minus_geomB");
   * ```
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
   * Fills holes in polygon geometries.
   *
   * @param column - The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.
   * @returns A promise that resolves when the holes have been filled.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Fill holes in geometries in the default geometry column
   * await table.fillHoles();
   * ```
   *
   * @example
   * ```ts
   * // Fill holes in geometries in a specific column named 'polygonGeom'
   * await table.fillHoles("polygonGeom");
   * ```
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
   * Returns `TRUE` if two geometries intersect (overlap in any way), and `FALSE` otherwise.
   *
   * @param column1 - The name of the first column storing geometries.
   * @param column2 - The name of the second column storing geometries. Both columns must have the same projection.
   * @param newColumn - The name of the new column where the boolean results (`TRUE` for intersection, `FALSE` otherwise) will be stored.
   * @returns A promise that resolves when the intersection check is complete.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Check if geometries in 'geomA' and 'geomB' intersect, storing results in 'doIntersect'
   * await table.intersect("geomA", "geomB", "doIntersect");
   * ```
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
   * Returns `TRUE` if all points of a geometry in `column1` lie inside a geometry in `column2`, and `FALSE` otherwise.
   *
   * @param column1 - The name of the column storing the geometries to be tested for containment.
   * @param column2 - The name of the column storing the geometries to be tested as containers. Both columns must have the same projection.
   * @param newColumn - The name of the new column where the boolean results (`TRUE` for inside, `FALSE` otherwise) will be stored.
   * @returns A promise that resolves when the containment check is complete.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Check if geometries in 'pointGeom' are inside 'polygonGeom', storing results in 'isInsidePolygon'
   * await table.inside("pointGeom", "polygonGeom", "isInsidePolygon");
   * ```
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
   * Computes the union of two geometries, creating a new geometry that represents the merged area of both.
   *
   * @param column1 - The name of the first column storing geometries.
   * @param column2 - The name of the second column storing geometries. Both columns must have the same projection.
   * @param newColumn - The name of the new column where the computed union geometries will be stored.
   * @returns A promise that resolves when the union geometries have been computed.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Compute the union of geometries in 'geomA' and 'geomB', storing results in 'unionGeom'
   * await table.union("geomA", "geomB", "unionGeom");
   * ```
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
   * Extracts the latitude and longitude coordinates from point geometries.
   * The input geometry is assumed to be in the EPSG:4326 coordinate system (WGS84), with `[latitude, longitude]` axis order.
   *
   * @param column - The name of the column storing the point geometries.
   * @param columnLat - The name of the new column where the extracted latitude values will be stored.
   * @param columnLon - The name of the new column where the extracted longitude values will be stored.
   * @returns A promise that resolves when the latitude and longitude have been extracted.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Extract latitude and longitude from 'geom' column into new 'lat' and 'lon' columns
   * await table.latLon("geom", "lat", "lon");
   * ```
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
   * Simplifies geometries while preserving their overall coverage. A higher tolerance results in more significant simplification.
   *
   * @param tolerance - A numeric value representing the simplification tolerance. A higher value leads to greater simplification.
   * @param options - An optional object with configuration options:
   * @param options.column - The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.
   * @param options.simplifyBoundary - If `true` (default), the boundary of the geometries will also be simplified. If `false`, only the interior of the geometries will be simplified, preserving the original boundary.
   * @returns A promise that resolves when the geometries have been simplified.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Simplify geometries in the default column with a tolerance of 0.1
   * await table.simplify(0.1);
   * ```
   *
   * @example
   * ```ts
   * // Simplify geometries in 'myGeom' column, preserving the boundary
   * await table.simplify(0.05, { column: "myGeom", simplifyBoundary: false });
   * ```
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
   * Computes the centroid of geometries.
   * The values are returned in the SRS unit of the input geometries.
   *
   * @param newColumn - The name of the new column where the computed centroid geometries will be stored.
   * @param options - An optional object with configuration options:
   * @param options.column - The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.
   * @returns A promise that resolves when the centroids have been computed.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Compute the centroid of geometries in the default column, storing results in 'centerPoint'
   * await table.centroid("centerPoint");
   * ```
   *
   * @example
   * ```ts
   * // Compute the centroid of geometries in a specific column named 'areaGeom'
   * await table.centroid("areaCentroid", { column: "areaGeom" });
   * ```
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
   * Computes the distance between geometries in two specified columns.
   * By default, the distance is calculated in the Spatial Reference System (SRS) unit of the input geometries.
   * You can optionally specify `"spheroid"` or `"haversine"` methods to get results in meters or kilometers.
   * If using `"spheroid"` or `"haversine"`, the input geometries must be in the EPSG:4326 coordinate system (WGS84), with `[latitude, longitude]` axis order.
   *
   * @param column1 - The name of the first column storing geometries.
   * @param column2 - The name of the second column storing geometries.
   * @param newColumn - The name of the new column where the computed distances will be stored.
   * @param options - An optional object with configuration options:
   * @param options.method - The method to use for distance calculations: `"srs"` (default, uses SRS unit), `"haversine"` (meters, requires EPSG:4326), or `"spheroid"` (meters, requires EPSG:4326, most accurate but slowest).
   * @param options.unit - If `method` is `"spheroid"` or `"haversine"`, you can choose between `"m"` (meters, default) or `"km"` (kilometers).
   * @param options.decimals - The number of decimal places to round the distance values. Defaults to `undefined` (no rounding).
   * @returns A promise that resolves when the distances have been computed.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Compute distance between 'geomA' and 'geomB' in SRS units, store in 'distance_srs'
   * await table.distance("geomA", "geomB", "distance_srs");
   * ```
   *
   * @example
   * ```ts
   * // Compute Haversine distance in meters between 'point1' and 'point2', store in 'distance_m'
   * // Input geometries must be in EPSG:4326.
   * await table.distance("point1", "point2", "distance_m", { method: "haversine" });
   * ```
   *
   * @example
   * ```ts
   * // Compute Haversine distance in kilometers, rounded to 2 decimal places
   * // Input geometries must be in EPSG:4326.
   * await table.distance("point1", "point2", "distance_km", { method: "haversine", unit: "km", decimals: 2 });
   * ```
   *
   * @example
   * ```ts
   * // Compute Spheroid distance in kilometers
   * // Input geometries must be in EPSG:4326.
   * await table.distance("area1", "area2", "distance_spheroid_km", { method: "spheroid", unit: "km" });
   * ```
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
   * Unnests geometries recursively, transforming multi-part geometries (e.g., MultiPolygon) into individual single-part geometries (e.g., Polygon).
   *
   * @param column - The name of the column storing the geometries to be unnested. If omitted, the method will automatically attempt to find a geometry column.
   * @returns A promise that resolves when the geometries have been unnested.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Unnest geometries in the default column
   * await table.unnestGeo();
   * ```
   *
   * @example
   * ```ts
   * // Unnest geometries in a specific column named 'multiGeom'
   * await table.unnestGeo("multiGeom");
   * ```
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
   * Aggregates geometries in a specified column based on a chosen aggregation method.
   *
   * @param method - The aggregation method to apply: `"union"` (combines all geometries into a single multi-geometry) or `"intersection"` (computes the intersection of all geometries).
   * @param options - An optional object with configuration options:
   * @param options.column - The name of the column storing the geometries to be aggregated. If omitted, the method will automatically attempt to find a geometry column.
   * @param options.categories - The column name or an array of column names that define categories for the aggregation. Aggregation will be performed independently within each category.
   * @param options.outputTable - If `true`, the results will be stored in a new table with a generated name. If a string, it will be used as the name for the new table. If `false` or omitted, the current table will be overwritten. Defaults to `false`.
   * @returns A promise that resolves to the SimpleTable instance containing the aggregated geometries (either the modified current table or a new table).
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Aggregate all geometries in the default column into a single union geometry
   * await table.aggregateGeo("union");
   * ```
   *
   * @example
   * ```ts
   * // Aggregate geometries by 'country' and compute their union
   * await table.aggregateGeo("union", { categories: "country" });
   * ```
   *
   * @example
   * ```ts
   * // Aggregate geometries in 'regions' column into their intersection, storing results in a new table
   * const intersectionTable = await table.aggregateGeo("intersection", { column: "regions", outputTable: true });
   * ```
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
   * Transforms closed linestring geometries into polygon geometries.
   *
   * @param column - The name of the column storing the linestring geometries. If omitted, the method will automatically attempt to find a geometry column.
   * @returns A promise that resolves when the transformation is complete.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Transform closed linestrings in the default geometry column into polygons
   * await table.linesToPolygons();
   * ```
   *
   * @example
   * ```ts
   * // Transform closed linestrings in a specific column named 'routeLines' into polygons
   * await table.linesToPolygons("routeLines");
   * ```
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
   * Returns the bounding box of geometries in `[minLat, minLon, maxLat, maxLon]` order.
   * By default, the method will try to find the column with the geometries. The input geometry is assumed to be in the EPSG:4326 coordinate system (WGS84), with `[latitude, longitude]` axis order.
   *
   * @param column - The name of the column storing geometries. If omitted, the method will automatically attempt to find a geometry column.
   * @returns A promise that resolves to an array `[minLat, minLon, maxLat, maxLon]` representing the bounding box.
   * @category Geospatial
   *
   * @example
   * ```ts
   * // Get the bounding box of geometries in the default column
   * const bbox = await table.getBoundingBox();
   * console.log(bbox); // e.g., [45.0, -75.0, 46.0, -73.0]
   * ```
   *
   * @example
   * ```ts
   * // Get the bounding box of geometries in a specific column named 'areaGeom'
   * const areaBbox = await table.getBoundingBox("areaGeom");
   * console.log(areaBbox);
   * ```
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
   * Returns the table's geospatial data as a GeoJSON object.
   * If the table has multiple geometry columns, you must specify which one to use.
   * If the geometry column's projection is WGS84 or EPSG:4326 (`[latitude, longitude]` axis order), the coordinates will be flipped to follow the RFC7946 standard (`[longitude, latitude]` axis order) in the output GeoJSON.
   *
   * @param column - The name of the column storing the geometries. If omitted, the method will automatically attempt to find a geometry column.
   * @param options - An optional object with configuration options:
   * @param options.rewind - If `true`, rewinds the coordinates of polygons to follow the spherical winding order (important for D3.js). Defaults to `false`.
   * @returns A promise that resolves to a GeoJSON object representing the table's geospatial data.
   * @category Getting Data
   *
   * @example
   * ```ts
   * // Get GeoJSON data from the default geometry column
   * const geojson = await table.getGeoData();
   * console.log(geojson);
   * ```
   *
   * @example
   * ```ts
   * // Get GeoJSON data from a specific geometry column named 'myGeometries'
   * const myGeomJson = await table.getGeoData("myGeometries");
   * console.log(myGeomJson);
   * ```
   *
   * @example
   * ```ts
   * // Get GeoJSON data and rewind polygon coordinates for D3.js compatibility
   * const rewoundGeojson = await table.getGeoData(undefined, { rewind: true });
   * console.log(rewoundGeojson);
   * ```
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
   * Writes the table's data to a file in various formats (CSV, JSON, Parquet, DuckDB, SQLite).
   * If the specified path does not exist, it will be created.
   *
   * @param file - The absolute path to the output file (e.g., `"./output.csv"`, `"./output.json"`).
   * @param options - An optional object with configuration options:
   * @param options.compression - A boolean indicating whether to compress the output file. If `true`, CSV and JSON files will be compressed with GZIP, while Parquet files will use ZSTD. Defaults to `false`.
   * @param options.dataAsArrays - For JSON files only. If `true`, JSON files are written as a single object with arrays for each column (e.g., `{ "col1": [v1, v2], "col2": [v3, v4] }`) instead of an array of objects. This can reduce file size for web projects. You can use the `arraysToData` function from the [journalism library](https://jsr.io/@nshiab/journalism/doc/~/arraysToData) to convert it back.
   * @param options.formatDates - For CSV and JSON files only. If `true`, date and timestamp columns will be formatted as ISO 8601 strings (e.g., `"2025-01-01T01:00:00.000Z"`). Defaults to `false`.
   * @returns A promise that resolves when the data has been written to the file.
   * @category File Operations
   *
   * @example
   * ```ts
   * // Write data to a CSV file
   * await table.writeData("./output.csv");
   * ```
   *
   * @example
   * ```ts
   * // Write data to a JSON file with GZIP compression.
   * // The output file will be named output.json.gz.
   * await table.writeData("./output.json", { compression: true });
   * ```
   *
   * @example
   * ```ts
   * // Write data to a Parquet file
   * await table.writeData("./output.parquet");
   * ```
   *
   * @example
   * ```ts
   * // Write data to a DuckDB database file
   * await table.writeData("./my_database.db");
   * ```
   *
   * @example
   * ```ts
   * // Write data to a SQLite database file
   * await table.writeData("./my_database.sqlite");
   * ```
   *
   * @example
   * ```ts
   * // Write JSON data with dates formatted as ISO strings
   * await table.writeData("./output_dates.json", { formatDates: true });
   * ```
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
   * Writes the table's geospatial data to a file in GeoJSON or GeoParquet format.
   * If the specified path does not exist, it will be created.
   *
   * For GeoJSON files (`.geojson` or `.json`), if the projection is WGS84 or EPSG:4326 (`[latitude, longitude]` axis order), the coordinates will be flipped to follow the RFC7946 standard (`[longitude, latitude]` axis order) in the output.
   *
   * @param file - The absolute path to the output file (e.g., `"./output.geojson"`, `"./output.geoparquet"`).
   * @param options - An optional object with configuration options:
   * @param options.precision - For GeoJSON, the maximum number of figures after the decimal separator to write in coordinates. Defaults to `undefined` (full precision).
   * @param options.compression - For GeoParquet, if `true`, the output will be ZSTD compressed. Defaults to `false`.
   * @param options.rewind - For GeoJSON, if `true`, rewinds the coordinates of polygons to follow the right-hand rule (RFC 7946). Defaults to `false`.
   * @param options.metadata - For GeoJSON, an object to be added as top-level metadata to the GeoJSON output.
   * @param options.formatDates - For GeoJSON, if `true`, formats date and timestamp columns to ISO 8601 strings. Defaults to `false`.
   * @returns A promise that resolves when the geospatial data has been written to the file.
   * @category File Operations
   *
   * @example
   * ```ts
   * // Write geospatial data to a GeoJSON file
   * await table.writeGeoData("./output.geojson");
   * ```
   *
   * @example
   * ```ts
   * // Write geospatial data to a compressed GeoParquet file
   * await table.writeGeoData("./output.geoparquet", { compression: true });
   * ```
   *
   * @example
   * ```ts
   * // Write GeoJSON with specific precision and metadata
   * await table.writeGeoData("./output_high_precision.geojson", {
   *   precision: 6,
   *   metadata: { source: "SimpleDataAnalysis" },
   * });
   * ```
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
   * Clears a Google Sheet and populates it with the table's data.
   * This method uses the `overwriteSheetData` function from the [journalism library](https://jsr.io/@nshiab/journalism/doc/~/overwriteSheetData). Refer to its documentation for more details.
   *
   * By default, this function looks for the API key in `GOOGLE_PRIVATE_KEY` and the service account email in `GOOGLE_SERVICE_ACCOUNT_EMAIL` environment variables. If you don't have credentials, refer to the [Google Spreadsheet authentication guide](https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication).
   *
   * @param sheetUrl - The URL pointing to a specific Google Sheet (e.g., `"https://docs.google.com/spreadsheets/d/.../edit#gid=0"`).
   * @param options - An optional object with configuration options:
   * @param options.prepend - Text to be added before the data in the sheet.
   * @param options.lastUpdate - If `true`, adds a row before the data with the date of the update.
   * @param options.timeZone - If `lastUpdate` is `true`, this option allows formatting the date to a specific time zone.
   * @param options.raw - If `true`, Google Sheets will not attempt to guess the data type and will not format or parse the values.
   * @param options.apiEmail - If your API email is stored under a different environment variable name, use this option to specify it.
   * @param options.apiKey - If your API key is stored under a different environment variable name, use this option to specify it.
   * @returns A promise that resolves when the data has been written to the Google Sheet.
   * @category Exporting Data
   *
   * @example
   * ```ts
   * // Write table data to a Google Sheet
   * await table.toSheet("https://docs.google.com/spreadsheets/d/.../edit#gid=0");
   * ```
   *
   * @example
   * ```ts
   * // Write data to a Google Sheet, prepending a message and including the last update timestamp
   * await table.toSheet("https://docs.google.com/spreadsheets/d/.../edit#gid=0", {
   *   prepend: "Report generated on:",
   *   lastUpdate: true,
   *   timeZone: "Canada/Eastern",
   * });
   * ```
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
   * Caches the results of computations in `./.sda-cache`.
   * You should add `./.sda-cache` to your `.gitignore` file.
   *
   * @param run - A function wrapping the computations to be cached. This function will be executed on the first run or if the cached data is invalid/expired.
   * @param options - An optional object with configuration options:
   * @param options.ttl - Time to live (in seconds). If the data in the cache is older than this duration, the `run` function will be executed again to refresh the cache. By default, there is no TTL, meaning the cache is only invalidated if the `run` function's content changes.
   * @returns A promise that resolves when the computations are complete or the data is loaded from cache.
   * @category Caching
   *
   * @example
   * ```ts
   * // Basic usage: computations are cached and re-run only if the function content changes
   * const sdb = new SimpleDB();
   * const table = sdb.newTable();
   *
   * await table.cache(async () => {
   *   await table.loadData("items.csv");
   *   await table.summarize({
   *     values: "price",
   *     categories: "department",
   *     summaries: ["min", "max", "mean"],
   *   });
   * });
   *
   * // It's important to call done() on the SimpleDB instance to clean up the cache.
   * // This prevents the cache from growing indefinitely.
   * await sdb.done();
   * ```
   *
   * @example
   * ```ts
   * // Cache with a Time-To-Live (TTL) of 60 seconds
   * // The computations will be re-run if the cached data is older than 1 minute or if the function content changes.
   * const sdb = new SimpleDB();
   * const table = sdb.newTable();
   *
   * await table.cache(async () => {
   *   await table.loadData("items.csv");
   *   await table.summarize({
   *     values: "price",
   *     categories: "department",
   *     summaries: ["min", "max", "mean"],
   *   });
   * }, { ttl: 60 });
   *
   * await sdb.done();
   * ```
   *
   * @example
   * ```ts
   * // Enable verbose logging for cache operations via SimpleDB instance
   * const sdb = new SimpleDB({ cacheVerbose: true });
   * const table = sdb.newTable();
   *
   * await table.cache(async () => {
   *   await table.loadData("items.csv");
   *   await table.summarize({
   *     values: "price",
   *     categories: "department",
   *     summaries: ["min", "max", "mean"],
   *   });
   * });
   *
   * await sdb.done();
   * ```
   */
  async cache(
    run: () => Promise<void>,
    options: { ttl?: number } = {},
  ): Promise<void> {
    await cache(this, run, { ...options, verbose: this.sdb.cacheVerbose });
  }

  /**
   * Creates an [Observable Plot](https://github.com/observablehq/plot) chart as an image file (.png, .jpeg, or .svg) from the table data.
   * To create maps, use the `writeMap` method.
   *
   * @param chart - A function that takes data (as an array of objects) and returns an Observable Plot chart (an `SVGSVGElement` or `HTMLElement`).
   * @param path - The absolute path where the chart image will be saved (e.g., `"./output/chart.png"`).
   * @param options - Optional object containing additional settings:
   * @param options.style - A CSS string to customize the chart's appearance. This is applied to a `<div>` element wrapping the Plot chart (which has the id `chart`). Use this if the Plot `style` option is insufficient.
   * @param options.dark - If `true`, switches the chart to dark mode. Defaults to `false`.
   * @returns A promise that resolves when the chart image has been saved.
   * @category Dataviz
   *
   * @example
   * ```ts
   * import { dot, plot } from "@observablehq/plot";
   *
   * const sdb = new SimpleDB();
   * const table = sdb.newTable();
   * const data = [{ year: 2024, value: 10 }, { year: 2025, value: 15 }];
   * await table.loadArray(data);
   *
   * const chartFunction = (plotData: unknown[]) =>
   *   plot({
   *     marks: [
   *       dot(plotData, { x: "year", y: "value" }),
   *     ],
   *   });
   *
   * const outputPath = "output/chart.png";
   *
   * await table.writeChart(chartFunction, outputPath);
   * ```
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
   * Creates an [Observable Plot](https://github.com/observablehq/plot) map as an image file (.png, .jpeg, or .svg) from the table's geospatial data.
   * To create charts from non-geospatial data, use the `writeChart` method.
   *
   * @param map - A function that takes geospatial data (in GeoJSON format) and returns an Observable Plot map (an `SVGSVGElement` or `HTMLElement`).
   * @param path - The absolute path where the map image will be saved (e.g., `"./output/map.png"`).
   * @param options - An optional object with configuration options:
   * @param options.column - The name of the column storing geometries. If there is only one geometry column, it will be used by default.
   * @param options.rewind - If `true`, rewinds the coordinates of polygons to follow the spherical winding order (important for D3.js). Defaults to `true`.
   * @param options.style - A CSS string to customize the map's appearance. This is applied to a `<div>` element wrapping the Plot map (which has the ID `chart`). Use this if the Plot `style` option is insufficient.
   * @param options.dark - If `true`, switches the map to dark mode. Defaults to `false`.
   * @returns A promise that resolves when the map image has been saved.
   * @category Dataviz
   *
   * @example
   * ```ts
   * import { geo, plot } from "@observablehq/plot";
   *
   * const sdb = new SimpleDB();
   * const table = sdb.newTable();
   * await table.loadGeoData("./CanadianProvincesAndTerritories.geojson");
   *
   * const mapFunction = (geoJsonData: { features: unknown[] }) =>
   *   plot({
   *     projection: {
   *       type: "conic-conformal",
   *       rotate: [100, -60],
   *       domain: geoJsonData,
   *     },
   *     marks: [
   *       geo(geoJsonData, { stroke: "black", fill: "lightblue" }),
   *     ],
   *   });
   *
   * const outputPath = "./output/map.png";
   *
   * await table.writeMap(mapFunction, outputPath);
   * ```
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
   * Logs a specified number of rows from the table to the console. By default, the first 10 rows are logged.
   * You can optionally log the column types and filter the data based on conditions.
   * You can also use JavaScript syntax for conditions (e.g., `&&`, `||`, `===`, `!==`).
   *
   * @param options - Either the number of rows to log (a specific number or `"all"`) or an object with configuration options:
   * @param options.nbRowsToLog - The number of rows to log. Defaults to 10 or the value set in the SimpleDB instance. Use `"all"` to log all rows.
   * @param options.types - If `true`, logs the column types along with the data. Defaults to `false`.
   * @param options.conditions - A SQL `WHERE` clause condition to filter the data before logging. Defaults to no condition.
   * @returns A promise that resolves when the table data has been logged.
   * @category Logging
   *
   * @example
   * ```ts
   * // Log the first 10 rows (default behavior)
   * await table.logTable();
   * ```
   *
   * @example
   * ```ts
   * // Log the first 50 rows
   * await table.logTable(50);
   * ```
   *
   * @example
   * ```ts
   * // Log all rows
   * await table.logTable("all");
   * ```
   *
   * @example
   * ```ts
   * // Log the first 20 rows and include column types
   * await table.logTable({ nbRowsToLog: 20, types: true });
   * ```
   *
   * @example
   * ```ts
   * // Log rows where 'status' is 'active' (using JS syntax for conditions)
   * await table.logTable({ conditions: `status === 'active'` });
   * ```
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
   * Generates and logs a line chart to the console. The data should be sorted by the x-axis values for accurate representation.
   *
   * **Data Type Requirements:**
   * - **X-axis values**: Must be `number` or `Date` objects.
   * - **Y-axis values**: Must be `number` values.
   * - All values must be non-null and defined.
   *
   * @param x - The name of the column to be used for the x-axis. Values must be numbers or Date objects.
   * @param y - The name of the column to be used for the y-axis. Values must be numbers.
   * @param options - An optional object with configuration options:
   * @param options.formatX - A function to format the x-axis values for display. It receives the raw x-value as input and should return a string. If the first data point's x value is a Date, it defaults to formatting the date as "YYYY-MM-DD".
   * @param options.formatY - A function to format the y-axis values for display. It receives the raw y-value as input and should return a string.
   * @param options.smallMultiples - The name of a column to create small multiples (also known as facets or trellis charts). Each unique value in this column will generate a separate chart.
   * @param options.fixedScales - If `true`, all small multiples will share the same y-axis scale. Defaults to `false`.
   * @param options.smallMultiplesPerRow - The number of small multiples to display per row.
   * @param options.width - The width of the chart in characters.
   * @param options.height - The height of the chart in characters.
   * @returns A promise that resolves when the chart has been logged to the console.
   * @category Dataviz
   *
   * @example
   * // Basic line chart
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
   * // Line chart with small multiples
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
      { returnDataFrom: "query", types: await this.getTypes() },
    );
    logLineChart(data as { [key: string]: unknown }[], x, y, options);
  }

  /**
   * Generates and logs a dot chart to the console. The data should be sorted by the x-axis values for accurate representation.
   *
   * **Data Type Requirements:**
   * - **X-axis values**: Must be `number` or `Date` objects.
   * - **Y-axis values**: Must be `number` values.
   * - All values must be non-null and defined.
   *
   * @param x - The name of the column to be used for the x-axis. Values must be numbers or Date objects.
   * @param y - The name of the column to be used for the y-axis. Values must be numbers.
   * @param options - An optional object with configuration options:
   * @param options.formatX - A function to format the x-axis values for display. It receives the raw x-value as input and should return a string. If the first data point's x value is a Date, it defaults to formatting the date as "YYYY-MM-DD".
   * @param options.formatY - A function to format the y-axis values for display. It receives the raw y-value as input and should return a string.
   * @param options.smallMultiples - The name of a column to create small multiples (also known as facets). Each unique value in this column will generate a separate chart.
   * @param options.fixedScales - If `true`, all small multiples will share the same y-axis scale. Defaults to `false`.
   * @param options.smallMultiplesPerRow - The number of small multiples to display per row.
   * @param options.width - The width of the chart in characters.
   * @param options.height - The height of the chart in characters.
   * @returns A promise that resolves when the chart has been logged to the console.
   * @category Dataviz
   *
   * @example
   * // Basic dot chart
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
   * // Dot chart with small multiples
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
      { returnDataFrom: "query", types: await this.getTypes() },
    );
    logDotChart(data as { [key: string]: unknown }[], x, y, options);
  }

  /**
   * Generates and logs a bar chart to the console.
   *
   * @param labels - The name of the column to be used for the labels (categories).
   * @param values - The name of the column to be used for the values.
   * @param options - An optional object with configuration options:
   * @param options.formatLabels - A function to format the labels. Defaults to converting the label to a string.
   * @param options.formatValues - A function to format the values. Defaults to converting the value to a string.
   * @param options.width - The width of the chart in characters. Defaults to 40.
   * @returns A promise that resolves when the chart has been logged to the console.
   * @category Dataviz
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
   * Generates and logs a histogram of a numeric column to the console.
   *
   * @param values - The name of the numeric column for which to generate the histogram.
   * @param options - An optional object with configuration options:
   * @param options.bins - The number of bins (intervals) to use for the histogram. Defaults to 10.
   * @param options.formatLabels - A function to format the labels for the histogram bins. It receives the lower and upper bounds of each bin as arguments.
   * @param options.compact - If `true`, the histogram will be displayed in a more compact format. Defaults to `false`.
   * @param options.width - The maximum width of the histogram bars in characters.
   * @returns A promise that resolves when the histogram has been logged to the console.
   * @category Dataviz
   *
   * @example
   * // Basic histogram of the 'temperature' column
   * ```typescript
   * await table.logHistogram("temperature")
   * ```
   *
   * @example
   * // Histogram with 20 bins and custom label formatting
   * ```typescript
   * await table.logHistogram("age", {
   *   bins: 20,
   *   formatLabels: (min, max) => `${min}-${max} years`,
   * });
   * ```
   */
  async logHistogram(
    values: string,
    options: {
      bins?: number;
      formatLabels?: (min: number, max: number) => string;
      compact?: boolean;
      width?: number;
    } = {},
  ): Promise<void> {
    await logHistogram(this, values, options);
  }

  /**
   * Logs descriptive information about the columns in the table to the console. This includes details such as data types, number of null values, and number of distinct values for each column.
   * It internally calls the `getDescription` method to retrieve the descriptive statistics.
   *
   * @returns A promise that resolves when the column description has been logged to the console.
   * @category Logging
   *
   * @example
   * ```ts
   * // Log descriptive information for all columns in the table
   * await table.logDescription();
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
   * Logs the projections of the geospatial data (if any) to the console.
   *
   * @returns A promise that resolves to the SimpleTable instance after logging the projections.
   * @category Logging
   *
   * @example
   * ```ts
   * // Log the geospatial projections of the table
   * await table.logProjections();
   * ```
   */
  async logProjections(): Promise<SimpleTable> {
    console.log(`\ntable ${this.name} projections:`);
    console.log(this.projections);
    return await this;
  }

  /**
   * Logs the types of all columns in the table to the console.
   *
   * @returns A promise that resolves to the SimpleTable instance after logging the column types.
   * @category Logging
   *
   * @example
   * ```ts
   * // Log the data types of all columns in the table
   * await table.logTypes();
   * ```
   */
  async logTypes(): Promise<SimpleTable> {
    console.log(`\ntable ${this.name} types:`);
    console.log(await this.getTypes());
    return await this;
  }

  /**
   * Logs unique values for a specified column to the console. By default, a maximum of 100 values are logged (depending on your runtime).
   * You can optionally stringify the values to see them all.
   *
   * @param column - The name of the column from which to retrieve and log unique values.
   * @param options - An optional object with configuration options:
   * @param options.stringify - If `true`, converts the unique values to a JSON string before logging. Defaults to `false`.
   * @returns A promise that resolves to the SimpleTable instance after logging the unique values.
   * @category Logging
   *
   * @example
   * ```ts
   * // Logs unique values for the column "name"
   * await table.logUniques("name");
   * ```
   *
   * @example
   * ```ts
   * // Logs unique values for the column "name" and stringifies them
   * await table.logUniques("name", { stringify: true });
   * ```
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
   * Logs the columns in the table to the console. You can optionally include their data types.
   *
   * @param options - An optional object with configuration options:
   * @param options.types - If `true`, logs the column names along with their data types. Defaults to `false`.
   * @returns A promise that resolves to the SimpleTable instance after logging the columns.
   * @category Logging
   *
   * @example
   * ```ts
   * // Log only the column names
   * await table.logColumns();
   * ```
   *
   * @example
   * ```ts
   * // Log column names along with their types
   * await table.logColumns({ types: true });
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
   * Logs the total number of rows in the table to the console.
   *
   * @returns A promise that resolves to the SimpleTable instance after logging the row count.
   * @category Logging
   *
   * @example
   * ```ts
   * // Log the total number of rows in the table
   * await table.logNbRows();
   * ```
   */
  async logNbRows(): Promise<SimpleTable> {
    const nbRows = await this.getNbRows();
    console.log(`\nTable ${this.name}: ${formatNumber(nbRows)} rows.`);
    return await this;
  }

  /**
   * Logs the bottom `n` rows of the table to the console. By default, the last row will be returned first. To preserve the original order, use the `originalOrder` option.
   *
   * @param count - The number of rows to log from the bottom of the table.
   * @returns A promise that resolves when the rows have been logged to the console.
   * @category Logging
   *
   * @example
   * ```ts
   * // Log the last 10 rows (last row first)
   * await table.logBottom(10);
   * ```
   *
   * @example
   * ```ts
   * // Log the last 5 rows in their original order
   * await table.logBottom(5, { originalOrder: true });
   * ```
   */
  async logBottom(
    count: number,
    options: { originalOrder?: boolean } = {},
  ): Promise<void> {
    console.log(`\nTable ${this.name} (${count} bottom rows):`);
    const data = await this.getBottom(count, options);
    logData(
      null,
      data,
      this.nbCharactersToLog,
    );
  }

  /**
   * Logs the extent (minimum and maximum values) of a numeric column to the console.
   *
   * @param column - The name of the numeric column for which to log the extent.
   * @returns A promise that resolves when the column extent has been logged to the console.
   * @category Logging
   *
   * @example
   * ```ts
   * // Log the extent of the 'price' column
   * await table.logExtent("price");
   * ```
   */
  async logExtent(column: string): Promise<void> {
    const extent = await this.getExtent(column);
    console.log(`\nTable ${this.name} (${column} extent):`);
    console.log(extent);
  }
}
