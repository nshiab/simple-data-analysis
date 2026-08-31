import type SimpleDB from "../src/class/SimpleDB.ts";
import type SimpleTable from "../src/class/SimpleTable.ts";

export const queryProfileEnvironment = "BENCHMARK_QUERY_PROFILE";

export type QueryTiming = {
  sequence: number;
  label: string;
  table: string | null;
  milliseconds: number;
  query: string;
};

export type QueryProfile = {
  totalMilliseconds: number;
  queries: QueryTiming[];
};

type QueryRunner = SimpleDB["runQuery"];

function queryLabel(query: string): string {
  const statement = query.trim().match(/^[A-Za-z]+/)?.[0]?.toUpperCase();
  return statement === undefined ? "query" : statement;
}

/**
 * Records every query issued by an SDA benchmark, including queries from
 * tables created after instrumentation starts.
 */
export function observeSdaQueries(sdb: SimpleDB): {
  queries: QueryTiming[];
  restore: () => void;
} {
  const queries: QueryTiming[] = [];
  const restorers: (() => void)[] = [];
  let sequence = 0;

  function observe(simple: SimpleDB | SimpleTable): void {
    const original: QueryRunner = simple.runQuery;
    simple.runQuery = async (...args) => {
      const [query, _connection, _returnData, options] = args;
      const currentSequence = ++sequence;
      const start = performance.now();
      try {
        return await original(...args);
      } finally {
        queries.push({
          sequence: currentSequence,
          label: options.method ?? queryLabel(query),
          table: options.table ?? null,
          milliseconds: performance.now() - start,
          query,
        });
      }
    };
    restorers.push(() => {
      simple.runQuery = original;
    });
  }

  observe(sdb);
  const originalNewTable = sdb.newTable;
  sdb.newTable = ((name?: string) => {
    const table = originalNewTable.call(sdb, name);
    observe(table);
    return table;
  }) as typeof sdb.newTable;
  restorers.push(() => {
    sdb.newTable = originalNewTable;
  });

  return {
    queries,
    restore: () => {
      for (const restore of restorers.reverse()) restore();
    },
  };
}

export async function recordQuery<T>(
  queries: QueryTiming[],
  label: string,
  query: string,
  execute: () => Promise<T>,
): Promise<T> {
  const sequence = queries.length + 1;
  const start = performance.now();
  try {
    return await execute();
  } finally {
    queries.push({
      sequence,
      label,
      table: null,
      milliseconds: performance.now() - start,
      query,
    });
  }
}

export async function writeQueryProfile(
  path: string,
  profile: QueryProfile,
): Promise<void> {
  await Deno.writeTextFile(path, `${JSON.stringify(profile, null, 2)}\n`);
}

export async function readQueryProfile(path: string): Promise<QueryProfile> {
  return JSON.parse(await Deno.readTextFile(path)) as QueryProfile;
}
