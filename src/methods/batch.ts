import SimpleNodeDB from "../class/SimpleNodeDB"

export default async function batch(
    simpleDB: SimpleNodeDB,
    run: (
        simpleDB: SimpleNodeDB,
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
    simpleDB.debug && console.log("\nbatch()")
    options.batchSize = options.batchSize ?? 10
    simpleDB.debug &&
        console.log("parameters:", {
            run,
            originalTable,
            options,
        })

    let start
    if (simpleDB.debug || options.logBatchNumber) {
        start = Date.now()
    }

    const batchSize = options.batchSize
    const originalTableLength = await simpleDB.getLength(originalTable)

    let firstRun = true
    let hasBatchOuputTableTemp = false
    for (let i = 0; i < originalTableLength; i += batchSize) {
        await simpleDB.selectRows(originalTable, batchSize, {
            offset: i,
            outputTable: "batchOriginalTableTemp",
        })

        await run(simpleDB, "batchOriginalTableTemp", "batchOuputTableTemp")

        if (firstRun) {
            hasBatchOuputTableTemp = await simpleDB.hasTable(
                "batchOuputTableTemp"
            )
            if (hasBatchOuputTableTemp) {
                await simpleDB.cloneTable(
                    "batchOuputTableTemp",
                    "batchFinalTable"
                )
            } else {
                await simpleDB.cloneTable(
                    "batchOriginalTableTemp",
                    "batchFinalTable"
                )
            }
            firstRun = false
        } else {
            if (hasBatchOuputTableTemp) {
                await simpleDB.insertTables(
                    "batchFinalTable",
                    "batchOuputTableTemp"
                )
            } else {
                await simpleDB.insertTables(
                    "batchFinalTable",
                    "batchOriginalTableTemp"
                )
            }
        }

        if (start) {
            const now = Date.now()
            console.log(
                `batch => ${i}-${
                    i + batchSize
                } out of ${originalTableLength} / Done in ${now - start} ms`
            )
        }
    }

    if (hasBatchOuputTableTemp) {
        await simpleDB.removeTables([
            "batchOriginalTableTemp",
            "batchOuputTableTemp",
        ])
    } else {
        await simpleDB.removeTables(["batchOriginalTableTemp"])
    }
    if (options.outputTable) {
        await simpleDB.customQuery(
            `ALTER TABLE batchFinalTable RENAME TO ${options.outputTable}`
        )
    } else {
        await simpleDB.removeTables(originalTable)
        await simpleDB.customQuery(
            `ALTER TABLE batchFinalTable RENAME TO ${originalTable}`
        )
    }

    if (start) {
        const end = Date.now()
        console.log(`\nBatch done in ${end - start} ms`)
    }
}
