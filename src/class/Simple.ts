import type {
  AsyncDuckDB,
  AsyncDuckDBConnection,
} from "npm:@duckdb/duckdb-wasm@1";
import type { DuckDBConnection, DuckDBInstance } from "@duckdb/node-api";

export default class Simple {
  /** A flag indicating whether debugging information should be logged. Defaults to false. @category Properties */
  debug: boolean;
  /** The number of rows to log. Defaults to 10. @category Properties */
  nbRowsToLog: number;
  /** A flag indicating whether types should be logged along tables. Defaults to false. @category Properties */
  logTypes: boolean;
  /** The number of characters to log for text cells. By default, the whole text is logged. @category Properties */
  nbCharactersToLog: number | undefined;
  /** A DuckDB database. @category Properties */
  db!: AsyncDuckDB | DuckDBInstance;
  /** A connection to a DuckDB database. @category Properties */
  connection!: AsyncDuckDBConnection | DuckDBConnection;
  /** A worker to make DuckDB WASM work. @category Properties */
  worker!: Worker | null;
  /** A flag to know if the name of the table has been attributed by default. @category Properties */
  defaultTableName: boolean;
  /**
   * For internal use only. If you want to run a SQL query, use the customQuery method. @category Properties
   */
  runQuery!: (
    query: string,
    connection: AsyncDuckDBConnection | DuckDBConnection,
    returnDataFromQuery: boolean,
    options: {
      debug: boolean;
      method: string | null;
      parameters: { [key: string]: unknown } | null;
      types?: { [key: string]: string };
    },
  ) => Promise<
    | {
      [key: string]: number | string | Date | boolean | null;
    }[]
    | null
  >;

  constructor(
    runQuery: (
      query: string,
      connection: AsyncDuckDBConnection | DuckDBConnection,
      returnDataFromQuery: boolean,
      options: {
        debug: boolean;
        method: string | null;
        parameters: { [key: string]: unknown } | null;
      },
    ) => Promise<
      | {
        [key: string]: number | string | Date | boolean | null;
      }[]
      | null
    >,
    options: {
      debug?: boolean;
      nbRowsToLog?: number;
      nbCharactersToLog?: number;
      logTypes?: boolean;
    } = {},
  ) {
    this.nbRowsToLog = options.nbRowsToLog ?? 10;
    this.nbCharactersToLog = options.nbCharactersToLog;
    this.logTypes = options.logTypes ?? false;
    this.debug = options.debug ?? false;
    this.worker = null;
    this.defaultTableName = false;
    this.runQuery = runQuery;
  }
}
