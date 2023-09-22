// From https://github.com/ryan-williams/next-duckdb-parquet-demo/blob/main/src/parquet.ts

import * as duckdb from "@duckdb/duckdb-wasm"
import { AsyncDuckDB, DuckDBBundle } from "@duckdb/duckdb-wasm"

const SilentLogger = { log: () => {} }

type WorkerBundle = { bundle: DuckDBBundle; worker: Worker }

async function browserWorkerBundle(): Promise<WorkerBundle> {
    const allBundles = duckdb.getJsDelivrBundles()
    const bundle = await duckdb.selectBundle(allBundles)
    const mainWorker = bundle.mainWorker
    if (mainWorker) {
        const worker = await duckdb.createWorker(mainWorker)
        return { bundle, worker }
    } else {
        throw Error(`No mainWorker: ${mainWorker}`)
    }
}

export default async function getDuckDB(
    verbose: boolean
): Promise<{ db: AsyncDuckDB; worker: Worker }> {
    if (typeof window === "undefined") {
        throw new Error("If you are not using a browser, use SimpleNodeDB.")
    }

    const { worker, bundle } = await browserWorkerBundle()
    const logger = verbose ? new duckdb.ConsoleLogger() : SilentLogger
    const db = new AsyncDuckDB(logger, worker)
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker)
    await db.open({
        path: ":memory:",
        query: {
            castBigIntToDouble: true,
        },
    })
    return { db, worker }
}
