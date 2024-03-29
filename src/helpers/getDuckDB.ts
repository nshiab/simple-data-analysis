import * as duckdb from "@duckdb/duckdb-wasm"
import { AsyncDuckDB, DuckDBBundle } from "@duckdb/duckdb-wasm"
import Worker from "web-worker"
import path from "path"

const SilentLogger = { log: () => {} }

type WorkerBundle = { bundle: DuckDBBundle; worker: Worker }

async function nodeWorkerBundle(): Promise<WorkerBundle> {
    const DUCKDB_DIST = `node_modules/@duckdb/duckdb-wasm/dist`
    const bundle = await duckdb.selectBundle({
        mvp: {
            mainModule: path.resolve(DUCKDB_DIST, "./duckdb-mvp.wasm"),
            mainWorker: path.resolve(
                DUCKDB_DIST,
                "./duckdb-node-mvp.worker.cjs"
            ),
        },
        eh: {
            mainModule: path.resolve(DUCKDB_DIST, "./duckdb-eh.wasm"),
            mainWorker: path.resolve(
                DUCKDB_DIST,
                "./duckdb-node-eh.worker.cjs"
            ),
        },
    })
    const mainWorker = bundle.mainWorker
    if (mainWorker) {
        const worker = new Worker(mainWorker)
        return { bundle, worker }
    } else {
        throw Error(`No mainWorker: ${mainWorker}`)
    }
}

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

export default async function getDuckDB(): Promise<{
    db: AsyncDuckDB
    worker: Worker
}> {
    if (typeof window === "undefined") {
        console.log(
            "\x1b[41m",
            "If you are not on a web browser, please use SimpleNodeDB.",
            "\x1b[0m"
        )
    }

    const { worker, bundle } = await (typeof window === "undefined"
        ? nodeWorkerBundle()
        : browserWorkerBundle())
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
