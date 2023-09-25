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
        debug: boolean
    }
) {
    const start = Date.now()
    if (options.debug) {
        console.log(query)
        if (options.rowsModifier) {
            console.log("rowsModifier:", options.rowsModifier)
        }
    }

    return new Promise((resolve) => {
        if (options.returnData || options.verbose || options.debug) {
            connection.all(query, (err, res) => {
                if (err) {
                    throw err
                }
                if (options.rowsModifier) {
                    res = options.rowsModifier(res)
                }
                if (options.verbose || options.debug) {
                    console.table(res.slice(0, options.nbRowsToLog))
                    console.log(
                        `Total rows: ${res.length} (nbRowsToLog: ${options.nbRowsToLog})`
                    )
                }

                if (options.verbose || options.debug) {
                    const end = Date.now()
                    console.log(`Done in ${end - start} ms`)
                }

                resolve(res)
            })
        } else {
            connection.exec(query, (err) => {
                if (err) {
                    throw err
                }

                if (options.verbose || options.debug) {
                    const end = Date.now()
                    console.log(`Done in ${end - start} ms`)
                }
                resolve(true)
            })
        }
    })
}
