import { Connection } from "duckdb"

export default async function queryNode(
    query: string,
    connection: Connection,
    options: {
        verbose: boolean
        nbRowsToLog: number
        returnData: boolean
        rowsModifier?: (
            res: { [key: string]: unknown }[]
        ) => { [key: string]: unknown }[]
    }
) {
    if (options.verbose) {
        console.log(query)
        if (options.rowsModifier) {
            console.log("rowsModifier:", options.rowsModifier)
        }
    }

    return new Promise((resolve) => {
        if (options.returnData || options.verbose) {
            connection.all(query, (err, res) => {
                if (err) {
                    throw err
                }
                if (options.rowsModifier) {
                    res = options.rowsModifier(res)
                }
                if (options.verbose) {
                    if (res.length <= options.nbRowsToLog) {
                        console.table(res)
                    } else {
                        console.table(res.slice(0, options.nbRowsToLog))
                        console.log(
                            `Total rows: ${res.length} (nbRowsToLog: ${options.nbRowsToLog})`
                        )
                    }
                }

                resolve(res)
            })
        } else {
            connection.exec(query, (err) => {
                if (err) {
                    throw err
                }
                resolve(true)
            })
        }
    })
}
