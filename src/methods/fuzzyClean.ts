import type SimpleTable from "../class/SimpleTable.ts";
import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";

export default async function fuzzyClean(
  table: SimpleTable,
  column: string,
  newColumn: string,
  options: {
    method?:
      | "ratio"
      | "partial_ratio"
      | "token_sort_ratio"
      | "token_set_ratio";
    threshold?: number;
    keep?:
      | "mostCommon"
      | "longestString"
      | "shortestString"
      | "mostCentral"
      | "maxScore";
    prefixBlockingSize?: number;
  } = {},
): Promise<void> {
  const method = options.method ?? "ratio";
  const threshold = options.threshold ?? 80;
  const keep = options.keep ?? "mostCommon";
  const prefixBlockingSize = options.prefixBlockingSize || 0;

  // Single round trip: compute fuzzy pairs and embed counts for both sides.
  // Only values that appear in at least one pair above the threshold can be
  // normalized — singletons need no processing at all.
  const blockingCondition = prefixBlockingSize > 0
    ? `LEFT(LOWER(a.value), ${prefixBlockingSize}) = LEFT(LOWER(b.value), ${prefixBlockingSize}) AND\n       `
    : "";

  const pairsData = await queryDB(
    table,
    `INSTALL rapidfuzz FROM community; LOAD rapidfuzz;
     WITH uniques AS (
       SELECT "${column}" AS value, COUNT(*) AS cnt
       FROM "${table.name}"
       WHERE "${column}" IS NOT NULL
       GROUP BY "${column}"
     )
     SELECT
       a.value AS left_value,
       b.value AS right_value,
       a.cnt   AS left_cnt,
       b.cnt   AS right_cnt,
       rapidfuzz_${method}(a.value, b.value) AS score
     FROM uniques a
     JOIN uniques b
       ON ${blockingCondition}rapidfuzz_${method}(a.value, b.value) >= ${threshold}
       AND a.value < b.value`,
    mergeOptions(table, {
      table: table.name,
      method: "fuzzyClean()",
      parameters: { column, newColumn, options },
      returnDataFrom: "query",
    }),
  ) as
    | Array<{
      left_value: string;
      right_value: string;
      left_cnt: number;
      right_cnt: number;
      score: number;
    }>
    | null;

  const pairs = pairsData ?? [];
  if (pairs.length === 0) return; // Nothing to normalize.

  // Build count map from the pairs — no separate query needed.
  const countMap = new Map<string, number>();
  for (const { left_value, left_cnt, right_value, right_cnt } of pairs) {
    countMap.set(left_value, Number(left_cnt));
    countMap.set(right_value, Number(right_cnt));
  }

  // Union-Find — only over values that actually participate in a pair.
  const parent = new Map<string, string>();

  const find = (x: string): string => {
    if (!parent.has(x)) parent.set(x, x);
    if (parent.get(x) !== x) parent.set(x, find(parent.get(x)!));
    return parent.get(x)!;
  };

  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  for (const v of countMap.keys()) find(v);
  for (const { left_value, right_value } of pairs) {
    union(left_value, right_value);
  }

  // Group values by their cluster root.
  const clusters = new Map<string, string[]>();
  for (const v of countMap.keys()) {
    const root = find(v);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root)!.push(v);
  }

  // Pick the canonical value for each cluster.
  const replacement = new Map<string, string>();

  for (const members of clusters.values()) {
    if (members.length === 1) continue; // All pairs are already canonical — skip.

    // Score sums and per-member max scores are computed lazily — only when
    // actually needed as a primary criterion or tie-breaker.
    //
    // scoreSum: total similarity to all other cluster members (used by
    //   "mostCentral" as primary, and as tie-breaker for all strategies).
    // scoreMax: highest single pairwise score (used by "maxScore" as primary).
    let scoreSum: Map<string, number> | null = null;
    const getScoreSum = (): Map<string, number> => {
      if (scoreSum === null) {
        scoreSum = new Map<string, number>(members.map((m) => [m, 0]));
        for (const { left_value, right_value, score } of pairs) {
          if (scoreSum.has(left_value) && scoreSum.has(right_value)) {
            scoreSum.set(left_value, (scoreSum.get(left_value) ?? 0) + score);
            scoreSum.set(right_value, (scoreSum.get(right_value) ?? 0) + score);
          }
        }
      }
      return scoreSum;
    };

    let scoreMax: Map<string, number> | null = null;
    const getScoreMax = (): Map<string, number> => {
      if (scoreMax === null) {
        scoreMax = new Map<string, number>(members.map((m) => [m, 0]));
        for (const { left_value, right_value, score } of pairs) {
          if (scoreMax.has(left_value) && scoreMax.has(right_value)) {
            scoreMax.set(
              left_value,
              Math.max(scoreMax.get(left_value) ?? 0, score),
            );
            scoreMax.set(
              right_value,
              Math.max(scoreMax.get(right_value) ?? 0, score),
            );
          }
        }
      }
      return scoreMax;
    };

    // Sum-based comparator: highest total similarity, then alphabetical.
    const byScore = (a: string, b: string): string => {
      const sum = getScoreSum();
      const sa = sum.get(a) ?? 0;
      const sb = sum.get(b) ?? 0;
      if (sa !== sb) return sa > sb ? a : b;
      return a <= b ? a : b; // alphabetical tie-break
    };

    // Max-based comparator: highest single-pair score, then sum, then alphabetical.
    const byMaxScore = (a: string, b: string): string => {
      const mx = getScoreMax();
      const ma = mx.get(a) ?? 0;
      const mb = mx.get(b) ?? 0;
      if (ma !== mb) return ma > mb ? a : b;
      return byScore(a, b); // sum then alphabetical tie-break
    };

    let canonical: string;
    if (keep === "longestString") {
      canonical = members.reduce((a, b) => {
        if (a.length !== b.length) return a.length > b.length ? a : b;
        return byScore(a, b);
      });
    } else if (keep === "shortestString") {
      canonical = members.reduce((a, b) => {
        if (a.length !== b.length) return a.length < b.length ? a : b;
        return byScore(a, b);
      });
    } else if (keep === "mostCommon") {
      canonical = members.reduce((a, b) => {
        const ca = countMap.get(a) ?? 0;
        const cb = countMap.get(b) ?? 0;
        if (ca !== cb) return ca > cb ? a : b;
        return byScore(a, b);
      });
    } else if (keep === "mostCentral") {
      // Most central string — highest total similarity to all other cluster members.
      canonical = members.reduce((a, b) => byScore(a, b));
    } else {
      // "maxScore": the string participating in the single highest-scoring pair.
      canonical = members.reduce((a, b) => byMaxScore(a, b));
    }

    for (const m of members) {
      if (m !== canonical) replacement.set(m, canonical);
    }
  }

  if (replacement.size === 0) return;

  // Use a VALUES-based CTE for the UPDATE so DuckDB can use a hash join
  // instead of evaluating a potentially huge CASE WHEN expression.
  const escape = (s: string) => s.replace(/'/g, "''");
  const valuesList = [...replacement.entries()]
    .map(([from, to]) => `('${escape(from)}', '${escape(to)}')`)
    .join(",\n     ");

  if (newColumn !== column) {
    await queryDB(
      table,
      `ALTER TABLE "${table.name}" ADD "${newColumn}" VARCHAR;
       UPDATE "${table.name}"
         SET "${newColumn}" = "${column}";
       WITH mapping(original, canonical) AS (VALUES ${valuesList})
       UPDATE "${table.name}"
         SET "${newColumn}" = m.canonical
         FROM mapping m
         WHERE "${table.name}"."${newColumn}" = m.original`,
      mergeOptions(table, {
        table: table.name,
        method: "fuzzyClean()",
        parameters: { column, newColumn, options },
      }),
    );
  } else {
    await queryDB(
      table,
      `WITH mapping(original, canonical) AS (VALUES ${valuesList})
       UPDATE "${table.name}"
         SET "${column}" = m.canonical
         FROM mapping m
         WHERE "${table.name}"."${column}" = m.original`,
      mergeOptions(table, {
        table: table.name,
        method: "fuzzyClean()",
        parameters: { column, newColumn, options },
      }),
    );
  }
}
