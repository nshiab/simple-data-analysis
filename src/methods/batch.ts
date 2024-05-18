import SimpleDB from "../class/SimpleDB"
import formatDuration from "../helpers/formatDuration.js"

export default async function batch(
    SimpleWebDB: SimpleDB,
    run: (
        SimpleWebDB: SimpleDB,
        originalTable: string,
        outputTable?: string
    ) => Promise<void>,
    originalTable: string,
    options: {
        outputTable?: string
        batchSize?: number
        logBatchNumber?: boolean
    } = {}
) {
    SimpleWebDB.debug && console.log("\nbatch()")
    options.batchSize = options.batchSize ?? 10
    SimpleWebDB.debug &&
        console.log("parameters:", {
            run,
            originalTable,
            options,
        })

    let start
    if (SimpleWebDB.debug || options.logBatchNumber) {
        start = Date.now()
    }

    const batchSize = options.batchSize
    const originalTableLength = await SimpleWebDB.getLength(originalTable)

    let firstRun = true
    let hasBatchOuputTableTemp = false
    for (let i = 0; i < originalTableLength; i += batchSize) {
        let startBatch
        if (SimpleWebDB.debug || options.logBatchNumber) {
            startBatch = Date.now()
        }
        await SimpleWebDB.selectRows(originalTable, batchSize, {
            offset: i,
            outputTable: "batchOriginalTableTemp",
        })

        await run(SimpleWebDB, "batchOriginalTableTemp", "batchOuputTableTemp")

        if (firstRun) {
            hasBatchOuputTableTemp = await SimpleWebDB.hasTable(
                "batchOuputTableTemp"
            )
            if (hasBatchOuputTableTemp) {
                await SimpleWebDB.cloneTable(
                    "batchOuputTableTemp",
                    "batchFinalTable"
                )
            } else {
                await SimpleWebDB.cloneTable(
                    "batchOriginalTableTemp",
                    "batchFinalTable"
                )
            }
            firstRun = false
        } else {
            if (hasBatchOuputTableTemp) {
                await SimpleWebDB.insertTables(
                    "batchFinalTable",
                    "batchOuputTableTemp"
                )
            } else {
                await SimpleWebDB.insertTables(
                    "batchFinalTable",
                    "batchOriginalTableTemp"
                )
            }
        }

        if (startBatch) {
            const now = Date.now()
            console.log(
                `batch => ${i}-${
                    i + batchSize
                } out of ${originalTableLength} / Done in ${formatDuration(startBatch, now)}`
            )
        }
    }

    if (hasBatchOuputTableTemp) {
        await SimpleWebDB.removeTables([
            "batchOriginalTableTemp",
            "batchOuputTableTemp",
        ])
    } else {
        await SimpleWebDB.removeTables(["batchOriginalTableTemp"])
    }
    if (options.outputTable) {
        await SimpleWebDB.customQuery(
            `ALTER TABLE batchFinalTable RENAME TO ${options.outputTable}`
        )
    } else {
        await SimpleWebDB.removeTables(originalTable)
        await SimpleWebDB.customQuery(
            `ALTER TABLE batchFinalTable RENAME TO ${originalTable}`
        )
    }

    if (start) {
        const end = Date.now()
        console.log(`\nBatch done in ${formatDuration(start, end)}`)
    }
}
