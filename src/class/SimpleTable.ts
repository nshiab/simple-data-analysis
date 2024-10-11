import { readdirSync } from "node:fs";
import { tableFromJSON, tableToIPC } from "npm:apache-arrow@17";
import SimpleWebTable from "./SimpleWebTable.ts";
import type { Connection } from "npm:duckdb@1";
import stringToArray from "../helpers/stringToArray.ts";
import loadDataNodeQuery from "../methods/loadDataNodeQuery.ts";
import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import writeDataQuery from "../methods/writeDataQuery.ts";
import writeGeoDataQuery from "../methods/writeGeoDataQuery.ts";
import type SimpleDB from "./SimpleDB.ts";
import runQueryNode from "../helpers/runQueryNode.ts";
import aggregateGeoQuery from "../methods/aggregateGeoQuery.ts";
import selectRowsQuery from "../methods/selectRowsQuery.ts";
import crossJoinQuery from "../methods/crossJoinQuery.ts";
import join from "../methods/join.ts";
import summarize from "../methods/summarize.ts";
import correlations from "../methods/correlations.ts";
import linearRegressions from "../methods/linearRegressions.ts";
import joinGeo from "../methods/joinGeo.ts";
import cloneQuery from "../methods/cloneQuery.ts";
import shouldFlipBeforeExport from "../helpers/shouldFlipBeforeExport.ts";
import findGeoColumn from "../helpers/findGeoColumn.ts";
import getProjection from "../helpers/getProjection.ts";
import getExtension from "../helpers/getExtension.ts";
import cache from "../methods/cache.ts";
import getIdenticalColumns from "../helpers/getIdenticalColumns.ts";
import {
  createDirectory,
  logBarChart,
  logDotChart,
  logLineChart,
} from "jsr:@nshiab/journalism@1";
import writeDataAsArrays from "../helpers/writeDataAsArrays.ts";
import logHistogram from "../methods/logHistogram.ts";

/**
 * SimpleTable is a class representing a table in a SimpleDB. It can handle tabular and geospatial data. To create one, it's best to instantiate a SimpleDB first.
 *
 * @example
 * Basic usage
 * ```ts
 * // Creating a database first.
 * const sdb = new SimpleDB()
 *
 * // Making a new table. This returns a SimpleTable.
 * const employees = sdb.newTable()
 *
 * // You can now invoke methods on the table.
 * await employees.loadData("./employees.csv")
 * await employees.logTable()
 *
 * // Removing the DB to free up memory.
 * await sdb.done()
 * ```
 *
 * @example
 * Geospatial data
 * ```ts
 * // To load geospatial data, use .loadGeoData instead of .loadData
 * const boundaries = sdb.newTable()
 * await boundaries.loadGeoData("./boundaries.geojson")
 * ```
 *
 * @param name - The name of the table.
 * @param projections - The projections of columns with geospatial data.
 * @param simpleDB - The SimpleDB instance tied to this table.
 * @param options - An optional object with configuration options:
 *   @param options.debug - A boolean indicating whether to enable debug mode.
 *   @param options.nbRowsToLog - Number of rows to log when displaying table data.
 *   @param options.nbCharactersToLog - Maximum number of characters to log for strings. Useful to avoid logging large text content.
 *   @param options.bigIntToInt - A boolean indicating whether to convert BigInt to Int. Defaults to true.
 */

export default class SimpleTable extends SimpleWebTable {
  /** The SimpleDB that created this table. @category Properties */
  declare sdb: SimpleDB;

  constructor(
    name: string,
    projections: { [key: string]: string },
    simpleDB: SimpleDB,
    options: {
      debug?: boolean;
      nbRowsToLog?: number;
      nbCharactersToLog?: number;
      bigIntToInt?: boolean;
    } = {},
  ) {
    super(name, projections, simpleDB, options);
    this.sdb = simpleDB;
    this.bigIntToInt = options.bigIntToInt ?? true;
    this.runQuery = runQueryNode;
  }

  // TO RETURN THE RIGHT TYPES
  override async cloneTable(
    options: {
      outputTable?: string;
      condition?: string;
    } = {},
  ): Promise<SimpleTable> {
    let clonedTable: SimpleTable;
    if (typeof options.outputTable === "string") {
      clonedTable = this.sdb.newTable(
        options.outputTable,
        this.projections,
      );
    } else {
      clonedTable = this.sdb.newTable(
        `table${this.tableIncrement}`,
        this.projections,
      );
      this.tableIncrement += 1;
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

    return clonedTable;
  }
  override async selectRows(
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
  override async crossJoin(
    rightTable: SimpleTable,
    options: {
      outputTable?: string | boolean;
    } = {},
  ): Promise<SimpleTable> {
    const identicalColumns = await getIdenticalColumns(
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

  override async summarize(
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
        )[];
      decimals?: number;
      outputTable?: string | boolean;
      toMs?: boolean;
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
  override async join(
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
  override async correlations(
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
  override async linearRegressions(
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
  override async joinGeo(
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
  override async aggregateGeo(
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
   * Loads an array of objects into the table.
   *
   * @example
   * Basic usage
   * ```ts
   * const data = [{ letter: "a", number: 1 }, { letter: "b", number: 2 }]
   * await table.loadArray(data)
   * ```
   *
   * @param arrayOfObjects - An array of objects representing the data.
   *
   * @category Importing data
   */
  override async loadArray(
    arrayOfObjects: { [key: string]: unknown }[],
  ): Promise<this> {
    this.debug && console.log("\nloadArray()");
    this.debug &&
      console.log("parameters:", {
        table: this.name,
        arrayOfObjects: arrayOfObjects.length > 5
          ? `${
            JSON.stringify(arrayOfObjects.slice(0, 2))
          } (just showing the first 5 items)`
          : arrayOfObjects,
      });

    const arrowTable = tableFromJSON(arrayOfObjects);

    await this.sdb.customQuery("INSTALL arrow; LOAD arrow;");
    this.connection = this.sdb.connection;
    (this.connection as Connection).register_buffer(
      `tableAsView`,
      [tableToIPC(arrowTable)],
      true,
      (err) => {
        if (err) {
          throw err;
        }
      },
    );

    await this.sdb.customQuery(
      `CREATE OR REPLACE TABLE ${this.name} AS SELECT * FROM tableAsView;
            DROP VIEW tableAsView;`,
    );

    this.debug && (await this.logTable());

    return this;
  }

  /**
   * This method is just for the web. For NodeJS and other runtimes, use loadData.
   *
   * @category Importing data
   */
  override fetchData(): Promise<this> {
    throw new Error(
      "This method is just for the web. For NodeJS and other runtimes, use loadData.",
    );
  }

  /**
   * Loads data from local or remote file(s) into it. CSV, JSON and PARQUET files are accepted.
   *
   * @example
   * Basic usage
   * ```ts
   * // Load data from a local file
   * await table.loadData("./some-data.csv")
   *
   * // Load data from a remote file
   * await table.loadData("https://some-website.com/some-data.parquet")
   * ```
   *
   * @example
   * Multiple files
   * ```
   * // Load data from multiple local files.
   * await table.loadData([ "./some-data1.json", "./some-data2.json", "./some-data3.json" ])
   *
   * // Load data from multiple remote files
   * await table.loadData([ "https://some-website.com/some-data1.parquet", "https://some-website.com/some-data2.parquet", "https://some-website.com/some-data3.parquet" ])
   * ```
   *
   * @param files - The path(s) or url(s) of file(s) containing the data to be loaded. CSV, JSON, and PARQUET files are accepted.
   * @param options - An optional object with configuration options:
   *   @param options.fileType - The type of file to load ("csv", "dsv", "json", "parquet"). Defaults to the first file extension.
   *   @param options.autoDetect - A boolean indicating whether to automatically detect the data format. Defaults to true.
   *   @param options.limit - A number indicating the number of rows to load. Defaults to all rows.
   *   @param options.fileName - A boolean indicating whether to include the file name as a column in the loaded data. Defaults to false.
   *   @param options.unifyColumns - A boolean indicating whether to unify columns across multiple files, when the files structure is not the same. Defaults to false.
   *   @param options.columnTypes - An object mapping the column names with their expected types. By default, the types are inferred.
   *   @param options.header - A boolean indicating whether the file has a header. Applicable to CSV files. Defaults to true.
   *   @param options.allText - A boolean indicating whether all columns should be treated as text. Applicable to CSV files. Defaults to false.
   *   @param options.delim - The delimiter used in the file. Applicable to CSV and DSV files. By default, the delimiter is inferred.
   *   @param options.skip - The number of lines to skip at the beginning of the file. Applicable to CSV files. Defaults to 0.
   *   @param options.nullPadding - If this option is enabled, when a row lacks columns, it will pad the remaining columns on the right with null values.
   *   @param options.ignoreErrors - Option to ignore any parsing errors encountered and instead ignore rows with errors.
   *   @param options.compression - The compression type. Applicable to CSV files. Defaults to none.
   *   @param options.jsonFormat - The format of JSON files ("unstructured", "newlineDelimited", "array"). By default, the format is inferred.
   *   @param options.records - A boolean indicating whether each line in a newline-delimited JSON file represents a record. Applicable to JSON files. By default, it's inferred.
   *   @param options.sheet - A string indicating a specific sheet to import. Applicable to Excel files. By default, the first sheet is imported.
   *
   * @category Importing data
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
      // json options
      jsonFormat?: "unstructured" | "newlineDelimited" | "array";
      records?: boolean;
      // excel options
      sheet?: string;
    } = {},
  ): Promise<SimpleTable> {
    await queryDB(
      this,
      loadDataNodeQuery(this.name, stringToArray(files), options),
      mergeOptions(this, {
        table: this.name,
        method: "loadData()",
        parameters: { files, options },
      }),
    );

    return this;
  }

  /**
   * Loads data from all files in a local directory. CSV, JSON, and PARQUET files are accepted.
   *
   * @example
   * Basic usage
   * ```ts
   * await table.loadDataFromDirectory("./data/")
   * ```
   *
   * @param directory - The path of the directory containing the data files to be loaded. CSV, JSON, and PARQUET files are accepted.
   * @param options - An optional object with configuration options:
   *   @param options.fileType - The type of file to load ("csv", "dsv", "json", "parquet"). Defaults to the first file extension.
   *   @param options.autoDetect - A boolean indicating whether to automatically detect the data format. Defaults to true.
   *   @param options.limit - A number indicating the number of rows to load. Defaults to all rows.
   *   @param options.fileName - A boolean indicating whether to include the file name as a column in the loaded data. Defaults to false.
   *   @param options.unifyColumns - A boolean indicating whether to unify columns across multiple files, when the files structure is not the same. Defaults to false.
   *   @param options.columnTypes - An object mapping the column names with their expected types. By default, the types are inferred.
   *   @param options.header - A boolean indicating whether the file has a header. Applicable to CSV files. Defaults to true.
   *   @param options.allText - A boolean indicating whether all columns should be treated as text. Applicable to CSV files. Defaults to false.
   *   @param options.delim - The delimiter used in the file. Applicable to CSV and DSV files. By default, the delimiter is inferred.
   *   @param options.skip - The number of lines to skip at the beginning of the file. Applicable to CSV files. Defaults to 0.
   *   @param options.nullPadding - If this option is enabled, when a row lacks columns, it will pad the remaining columns on the right with null values.
   *   @param options.ignoreErrors - Option to ignore any parsing errors encountered and instead ignore rows with errors.
   *   @param options.compression - The compression type. Applicable to CSV files. Defaults to none.
   *   @param options.jsonFormat - The format of JSON files ("unstructured", "newlineDelimited", "array"). By default, the format is inferred.
   *   @param options.records - A boolean indicating whether each line in a newline-delimited JSON file represents a record. Applicable to JSON files. By default, it's inferred.
   *   @param options.sheet - A string indicating a specific sheet to import. Applicable to Excel files. By default, the first sheet is imported.
   *
   * @category Importing data
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
      loadDataNodeQuery(this.name, files, options),
      mergeOptions(this, {
        table: this.name,
        method: "loadDataFromDirectory",
        parameters: { directory, options },
      }),
    );

    return this;
  }

  /**
   * This method is just for the web. For NodeJS and other runtimes, use loadGeoData.
   *
   * @category Importing data
   */
  override fetchGeoData(): Promise<this> {
    throw new Error(
      "This method is just for the web. For NodeJS and other runtimes, use loadGeoData.",
    );
  }

  /**
   * Loads geospatial data from an external file. The coordinates of files or urls ending with .json or .geojson are automatically flipped to [latitude, longitude] axis order.
   *
   * @example
   * Basic usage with URL
   * ```ts
   * await table.loadGeoData("https://some-website.com/some-data.geojson")
   * ```
   *
   * @example
   * Basic usage with local file
   * ```ts
   * await table.loadGeoData("./some-data.geojson")
   * ```
   *
   * @example
   * Reprojecting to WGS84 with [latitude, longitude] axis order
   * ```ts
   * await table.loadGeoData("./some-data.geojson", { toWGS84: true })
   * ```
   *
   * @param file - The URL or path to the external file containing the geospatial data.
   * @param options - An optional object with configuration options:
   *   @param options.toWGS84 - If true, the method will look for the original projections in the file and convert the data to the WGS84 projections with [latitude, longitude] axis order. If the file or the url ends by .json or .geojson, the coordinates are automatically flipped and this option has no effect.
   *   @param options.from - An option to pass the original projections, if the method is not able to find it.
   *
   * @category Geospatial
   */
  async loadGeoData(
    file: string,
    options: { toWGS84?: boolean; from?: string } = {},
  ): Promise<SimpleTable> {
    await queryDB(
      this,
      `INSTALL spatial; LOAD spatial;${
        file.toLowerCase().includes("http") ? " INSTALL https; LOAD https;" : ""
      }
            CREATE OR REPLACE TABLE ${this.name} AS SELECT * FROM ST_Read('${file}');`,
      mergeOptions(this, {
        table: this.name,
        method: "loadGeoData()",
        parameters: { file },
      }),
    );

    // column storing geometries is geom by default
    this.projections["geom"] = (await getProjection(this.sdb, file)).proj4;

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

    return this;
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
   * @param file - The path to the file to which data will be written.
   * @param options - An optional object with configuration options:
   *   @param options.compression - A boolean indicating whether to compress the output file. Defaults to false. If true, CSV and JSON files will be compressed with GZIP while PARQUET files will use ZSTD.
   *   @param options.dataAsArrays - A boolean for JSON files. If true, JSON files are written as one object with arrays instead of an array of objects. Convenient to reduce the size of JSON files for web projects. You can use the function arraysToData from the journalism library to bring back the data to its original state.
   *
   * @category Exporting data
   */
  async writeData(
    file: string,
    options: {
      compression?: boolean;
      dataAsArrays?: boolean;
    } = {},
  ) {
    createDirectory(file);

    if (options.dataAsArrays) {
      await writeDataAsArrays(this, file);
    } else {
      await queryDB(
        this,
        writeDataQuery(this.name, file, options),
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
   * Basic usage
   * ```ts
   * await table.writeGeoata("output/data.geojson");
   * ```
   *
   * @param file - The path to the file to which data will be written.
   * @param options - An optional object with configuration options:
   *   @param options.precision - Maximum number of figures after decimal separator to write in coordinates.
   *
   * * @category Exporting data
   */
  async writeGeoData(file: string, options: { precision?: number } = {}) {
    createDirectory(file);
    const geoColumn = await findGeoColumn(this);
    const flip = shouldFlipBeforeExport(this.projections[geoColumn]);
    if (flip) {
      await this.flipCoordinates(geoColumn);
      await queryDB(
        this,
        writeGeoDataQuery(this.name, file, options),
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
        writeGeoDataQuery(this.name, file, options),
        mergeOptions(this, {
          table: this.name,
          method: "writeGeoData()",
          parameters: { file, options },
        }),
      );
    }
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
  async cache(run: () => Promise<void>, options: { ttl?: number } = {}) {
    await cache(this, run, { ...options, verbose: this.sdb.cacheVerbose });
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
  ) {
    const data = await this.sdb.customQuery(
      `SELECT "${x}", "${y}"${
        typeof options.smallMultiples === "string"
          ? `, "${options.smallMultiples}"`
          : ""
      } FROM ${this.name}`,
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
  ) {
    const data = await this.sdb.customQuery(
      `SELECT "${x}", "${y}"${
        typeof options.smallMultiples === "string"
          ? `, "${options.smallMultiples}"`
          : ""
      } FROM ${this.name}`,
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
  ) {
    const data = await this.sdb.customQuery(
      `SELECT "${labels}", "${values}" FROM ${this.name}`,
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
  ) {
    await logHistogram(this, values, options);
  }
}
