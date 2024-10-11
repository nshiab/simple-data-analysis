import * as duckdb from "npm:@duckdb/duckdb-wasm@1";
import type { AsyncDuckDB } from "npm:@duckdb/duckdb-wasm@1";

export default async function getDuckDB(): Promise<{
  db: AsyncDuckDB;
  worker: Worker;
}> {
  const bundle = await duckdb.selectBundle(duckdb.getJsDelivrBundles());
  const worker_url = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker!}");`], {
      type: "text/javascript",
    }),
  );
  const worker = new Worker(worker_url);
  // const logger = new duckdb.ConsoleLogger()
  const SilentLogger = { log: () => {} };
  const db = new duckdb.AsyncDuckDB(SilentLogger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(worker_url);
  await db.open({
    path: ":memory:",
    query: {
      castBigIntToDouble: true,
    },
  });
  return { db, worker };
}
