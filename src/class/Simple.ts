import type { DuckDBConnection, DuckDBInstance } from "@duckdb/node-api";

/**
 * An abstract base class providing common properties for SimpleDB and SimpleTable. This class is not intended for direct instantiation.
 */
export default class Simple {
  /**
   * A flag indicating whether to log debugging information.
   *
   * @defaultValue `false`
   */
  debug: boolean;
  /**
   * The number of rows to display when logging a table.
   *
   * @defaultValue `10`
   */
  nbRowsToLog: number;
  /**
   * A flag indicating whether to include data types when logging a table.
   *
   * @defaultValue `false`
   */
  types: boolean;
  /**
   * The maximum number of characters to display for text-based cells. If undefined, the entire text is shown.
   *
   * @defaultValue `undefined`
   */
  nbCharactersToLog: number | undefined;
  /**
   * A DuckDB database instance.
   */
  db!: DuckDBInstance;
  /**
   * A connection to a DuckDB database.
   */
  connection!: DuckDBConnection;
  /**
   * A flag indicating if the table name was assigned by default.
   *
   * @defaultValue `false`
   */
  defaultTableName: boolean;
  /**
   * A function for running SQL queries. This is for internal use only. To run a custom SQL query, use the SimpleDB.customQuery method.
   */
  runQuery!: (
    query: string,
    connection: DuckDBConnection,
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
    options: {
      debug?: boolean;
      nbRowsToLog?: number;
      nbCharactersToLog?: number;
      types?: boolean;
    } = {},
  ) {
    this.nbRowsToLog = options.nbRowsToLog ?? 10;
    this.nbCharactersToLog = options.nbCharactersToLog;
    this.types = options.types ?? false;
    this.debug = options.debug ?? false;
    this.defaultTableName = false;
  }
}
