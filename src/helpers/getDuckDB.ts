import * as duckdb from "@duckdb/duckdb-wasm"
import { AsyncDuckDB } from "@duckdb/duckdb-wasm"

const SilentLogger = { log: () => {} }

async function browserWorkerBundle() {
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

export default async function getDuckDB(): Promise<{
    db: AsyncDuckDB
    worker: Worker
}> {
    const { worker, bundle } = await browserWorkerBundle()
    const logger = SilentLogger
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
