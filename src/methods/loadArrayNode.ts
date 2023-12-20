import { tableFromJSON, tableToIPC } from "apache-arrow"
import SimpleNodeDB from "../class/SimpleNodeDB"
import { Connection } from "duckdb"

export default async function loadArrayNode(
    simpleNodeDB: SimpleNodeDB,
    table: string,
    arrayOfObjects: { [key: string]: unknown }[]
) {
    simpleNodeDB.debug && console.log("\nloadArray()")
    simpleNodeDB.debug && console.log("parameters:", { table, arrayOfObjects })

    let start
    if (simpleNodeDB.debug) {
        start = Date.now()
    }

    if (simpleNodeDB.connection === undefined) {
        await simpleNodeDB.start()
    }

    const c = simpleNodeDB.connection as Connection

    await loadArrowTable(c, arrayOfObjects, table)

    if (simpleNodeDB.debug) {
        await simpleNodeDB.logTable(table)
    }

    if (start) {
        const end = Date.now()
        console.log(`Done in ${end - start} ms`)
    }
}

async function loadArrowTable(
    c: Connection,
    arrayOfObjects: { [key: string]: unknown }[],
    table: string
) {
    return new Promise((resolve) => {
        // note; doesn't work on Windows yet
        c.exec(`INSTALL arrow; LOAD arrow;`, (err) => {
            if (err) {
                throw err
            }

            const arrowTable = tableFromJSON(arrayOfObjects)
            c.register_buffer(
                table,
                [tableToIPC(arrowTable)],
                true,
                (err, res) => {
                    if (err) {
                        throw err
                    }
                    // `SELECT * FROM jsonDataTable` would return the entries in `jsonData`
                    resolve(res)
                }
            )
        })
    })
}
