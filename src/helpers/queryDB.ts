import SimpleTable from "../class/SimpleTable.ts";
import SimpleDB from "../class/SimpleDB.ts";
import cleanSQL from "./cleanSQL.ts";

export default async function queryDB(
  simple: SimpleTable | SimpleDB,
  query: string,
  options: {
    table: string | null;
    method: string | null;
    parameters: { [key: string]: unknown } | null;
    nbRowsToLog: number;
    nbCharactersToLog: number | undefined;
    returnDataFrom: "query" | "none";
    debug: boolean;
    types?: { [key: string]: string };
  },
): Promise<
  | {
    [key: string]: string | number | boolean | Date | null;
  }[]
  | null
> {
  if (simple instanceof SimpleDB && simple.connection === undefined) {
    await simple.start();
  } else if (
    simple instanceof SimpleTable &&
    simple.connection === undefined
  ) {
    await simple.sdb.start();
    simple.db = simple.sdb.db;
    simple.connection = simple.sdb.connection;
  }
  if (simple.connection === undefined) {
    throw new Error("simple.connection is undefined");
  }

  query = cleanSQL(query);

  if (options.debug) {
    // We beautify it a little bit
    if (query.at(-1) !== ";") {
      query += ";";
    }
    if (query.includes("\n")) {
      query = query
        .trim()
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "" && line !== ";")
        .join("\n");
    }
    console.log(query);
  }

  let data = null;

  if (options.returnDataFrom === "none") {
    await simple.runQuery(query, simple.connection, false, options);
  } else if (options.returnDataFrom === "query") {
    data = await simple.runQuery(query, simple.connection, true, {
      ...options,
      // To convert dates and bigInts to numbers
      types: options.method !== "getTypes()"
        ? options.types
          ? options.types
          : simple instanceof SimpleTable
          ? await simple.getTypes()
          : undefined
        : undefined,
    });
  } else {
    throw new Error(
      `Unknown ${options.returnDataFrom} options.returnDataFrom`,
    );
  }

  if (options.returnDataFrom === "query") {
    if (data === null) {
      throw new Error("data is null");
    }
    return data;
  } else {
    return null;
  }
}
