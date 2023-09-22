import { Connection } from "duckdb"

export default async function queryNode(
    query: string,
    connection: Connection,
    verbose = false,
    nbRowsToLog = 10,
    options = { returnData: false }
) {
    if (verbose) {
        console.log(query)
    }

    return new Promise((resolve) => {
        if (options.returnData || verbose) {
            connection.all(query, (err, res) => {
                if (err) {
                    throw err
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
