import type { AsyncDuckDBConnection } from "npm:@duckdb/duckdb-wasm@1";
import type { Connection } from "npm:duckdb@1";

export default async function runQueryNode(
  query: string,
  connection: AsyncDuckDBConnection | Connection,
  returnDataFromQuery: boolean,
  options: {
    debug: boolean;
    method: string | null;
    parameters: { [key: string]: unknown } | null;
    bigIntToInt?: boolean;
  },
): Promise<
  | {
    [key: string]: number | string | Date | boolean | null;
  }[]
  | null
> {
  try {
    if (returnDataFromQuery) {
      const res = await new Promise<
        | {
          [key: string]: number | string | Date | boolean | null;
        }[]
        | null
      >((resolve, reject) => {
        (connection as Connection).all(query, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });

      if (
        Array.isArray(res) &&
        res.length > 0 &&
        options?.bigIntToInt === true
      ) {
        const keys = Object.keys(res[0]);
        for (let i = 0; i < res.length; i++) {
          for (const key of keys) {
            if (typeof res[i][key] === "bigint") {
              res[i][key] = Number(res[i][key]);
            }
          }
        }
      }

      return res;
    } else {
      await new Promise<void>((resolve, reject) => {
        (connection as Connection).exec(query, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      return null;
    }
  } catch (error) {
    console.warn(error);
    if (options.debug === false) {
      console.log("SDA: method causing error =>", options.method);
      console.log("parameters:", options.parameters);
      console.log("query:", query);
    }
    throw error;
  }
}
