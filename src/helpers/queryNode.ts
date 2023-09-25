import { Connection } from "duckdb"

export default async function queryNode(
    query: string,
    connection: Connection,
    options: {
        verbose: boolean
        nbRowsToLog: number
        returnData: boolean
        resParser?: (
            res: { [key: string]: unknown }[]
        ) => { [key: string]: unknown }[]
    }
) {
    if (options.verbose) {
        console.log(query)
        if (options.resParser) {
            console.log("extraData:", options.resParser)
        }
    }

    return new Promise((resolve) => {
        if (options.returnData || options.verbose) {
            connection.all(query, (err, res) => {
                if (err) {
                    throw err
                }
                if (options.resParser) {
                    res = options.resParser(res)
                }
                if (options.verbose) {
                    if (res.length <= (options.nbRowsToLog ?? 10)) {
                        console.table(res)
                    } else {
                        console.table(res.slice(0, options.nbRowsToLog ?? 10))
                        console.log(
                            `Total rows: ${res.length} (nbRowsToLog: ${
                                options.nbRowsToLog ?? 10
                            })`
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
