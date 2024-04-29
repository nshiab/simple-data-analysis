import { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"
import { Connection } from "duckdb"

export default async function runQueryNode(
    query: string,
    connection: AsyncDuckDBConnection | Connection,
    returnDataFromQuery: boolean,
    options: {
        debug: boolean
        method: string | null
        parameters: { [key: string]: unknown } | null
        bigIntToInt?: boolean
    }
): Promise<
    | {
          [key: string]: number | string | Date | boolean | null
      }[]
    | null
> {
    return new Promise((resolve) => {
        if (returnDataFromQuery) {
            ;(connection as Connection).all(query, (err, res) => {
                if (err) {
                    if (options.debug === false) {
                        console.log(
                            "SDA: method causing error =>",
                            options.method
                        )
                        console.log("parameters:", options.parameters)
                        console.log("query:", query)
                    }

                    throw err
                }

                if (options?.bigIntToInt === true && res.length > 0) {
                    // Converting bigint to int. Maybe an option instead of doing it all the time.
                    const keys = Object.keys(res[0])
                    for (let i = 0; i < res.length; i++) {
                        for (const key of keys) {
                            if (typeof res[i][key] === "bigint") {
                                res[i][key] = Number(res[i][key])
                            }
                        }
                    }
                }

                resolve(
                    res as {
                        [key: string]: number | string | Date | boolean | null
                    }[]
                )
            })
        } else {
            ;(connection as Connection).exec(query, (err) => {
                if (err) {
                    if (options.debug === false) {
                        console.log(
                            "SDA: method causing error =>",
                            options.method
                        )
                        console.log("parameters:", options.parameters)
                        console.log("query:", query)
                    }
                    throw err
                }
                resolve(null)
            })
        }
    })
}
