import { prettyDuration } from "jsr:@nshiab/journalism@1/web";
import SimpleWebTable from "../class/SimpleWebTable.ts";
import SimpleWebDB from "../class/SimpleWebDB.ts";
import cleanSQL from "./cleanSQL.ts";

export default async function queryDB(
  simple: SimpleWebTable | SimpleWebDB,
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
  if (simple instanceof SimpleWebDB && simple.connection === undefined) {
    await simple.start();
  } else if (
    simple instanceof SimpleWebTable &&
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

  let start;
  let end;
  if (options.debug) {
    console.log("\n" + options.method);
    console.log("parameters:", options.parameters);
    console.log(query);
    start = Date.now();
  }

  let data = null;

  if (options.debug) {
    const queryResult = await simple.runQuery(
      query,
      simple.connection,
      true,
      options,
    );
    if (options.returnDataFrom === "query") {
      data = queryResult;
    }
    if (Array.isArray(queryResult)) {
      if (queryResult.length > 10) {
        console.table(queryResult.slice(0, 10));
      } else {
        console.table(queryResult);
      }
    }
    end = Date.now();
  } else if (options.returnDataFrom === "none") {
    await simple.runQuery(query, simple.connection, false, options);
  } else if (options.returnDataFrom === "query") {
    data = await simple.runQuery(query, simple.connection, true, {
      ...options,
      // To convert dates and bigInts to numbers
      types: simple instanceof SimpleWebTable && options.method !== "getTypes()"
        ? options.types ? options.types : await simple.getTypes()
        : undefined,
    });
  } else {
    throw new Error(
      `Unknown ${options.returnDataFrom} options.returnDataFrom`,
    );
  }

  if (options.debug) {
    if (start) {
      console.log(
        `${options.method} - Done in ${prettyDuration(start, { end })}`,
      );
    }
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
