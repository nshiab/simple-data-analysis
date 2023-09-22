import { Connection } from "duckdb"

export default async function queryNode(
    q: { query: string; extraData?: unknown },
    connection: Connection,
    verbose = false,
    nbRowsToLog = 10,
    options: { returnData?: boolean } = { returnData: false }
) {
    if (verbose) {
        console.log(q.query)
        if (q.extraData) {
            console.log("extraData:", q.extraData)
        }
    }

    return new Promise((resolve) => {
        if (options.returnData || verbose) {
            connection.all(q.query, (err, res) => {
                if (err) {
                    throw err
                }
                if (q.extraData) {
                    res = [q.extraData].concat(res)
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
            connection.exec(q.query, (err) => {
                if (err) {
                    throw err
                }
                resolve(true)
            })
        }
    })
}
