import * as duckdb from "@duckdb/duckdb-wasm"
import { AsyncDuckDB } from "@duckdb/duckdb-wasm"

export default async function getDuckDB(): Promise<{
    db: AsyncDuckDB
    worker: Worker
}> {
    const bundle = await duckdb.selectBundle(duckdb.getJsDelivrBundles())
    const worker_url = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker!}");`], {
            type: "text/javascript",
        })
    )
    const worker = new Worker(worker_url)
    // const logger = new duckdb.ConsoleLogger()
    const SilentLogger = { log: () => {} }
    const db = new duckdb.AsyncDuckDB(SilentLogger, worker)
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker)
    URL.revokeObjectURL(worker_url)
    await db.open({
        path: ":memory:",
        query: {
            castBigIntToDouble: true,
        },
    })
    return { db, worker }
}
