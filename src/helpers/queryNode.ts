import { Connection } from "duckdb"

export default async function queryNode(
    query: string,
    connection: Connection,
    verbose = false,
    nbRowsToLog = 10,
    options: {
        returnData?: boolean
        resParser?: (
            res: { [key: string]: unknown }[]
        ) => { [key: string]: unknown }[]
    } = {
        returnData: false,
    }
) {
    if (verbose) {
        console.log(query)
        if (options.resParser) {
            console.log("extraData:", options.resParser)
        }
    }

    return new Promise((resolve) => {
        if (options.returnData || verbose) {
            connection.all(query, (err, res) => {
                if (err) {
                    throw err
                }
                if (options.resParser) {
                    res = options.resParser(res)
                }
                if (verbose) {
                    if (res.length <= nbRowsToLog) {
                        console.table(res)
                    } else {
                        console.table(res.slice(0, nbRowsToLog))
                        console.log(
                            `Total rows: ${res.length} (nbRowsToLog: ${nbRowsToLog})`
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
