import type SimpleTable from "../class/SimpleTable.ts";
import getIdenticalColumns from "../helpers/getIdenticalColumns.ts";
import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import fuzzyJoinQuery from "./fuzzyJoinQuery.ts";

export default async function fuzzyJoin(
  leftTable: SimpleTable,
  leftColumn: string,
  rightTable: SimpleTable,
  rightColumn: string,
  options: {
    method?:
      | "ratio"
      | "partial_ratio"
      | "token_sort_ratio"
      | "token_set_ratio";
    threshold?: number;
    type?: "inner" | "left" | "right" | "full";
    similarityColumn?: string;
    outputTable?: string | boolean;
    prefixBlockingSize?: number;
  } = {},
) {
  const method = options.method ?? "ratio";
  const threshold = options.threshold ?? 80;
  const joinType = options.type ?? "left";
  const similarityColumn = options.similarityColumn;
  const prefixBlockingSize = options.prefixBlockingSize || 0;
  const outputTableName = typeof options.outputTable === "string"
    ? options.outputTable
    : leftTable.name;

  const leftCols = await leftTable.getColumns();
  const rightCols = await rightTable.getColumns();

  const identicalColumns = getIdenticalColumns(leftCols, rightCols);
  if (identicalColumns.length > 0) {
    if (identicalColumns.length === 1) {
      throw new Error(
        `The tables have columns with identical names. Rename or remove "${
          identicalColumns[0]
        }" in one of the two tables before doing the fuzzy join.`,
      );
    } else {
      throw new Error(
        `The tables have columns with identical names. Rename or remove ${
          identicalColumns.map((d) => `"${d}"`).join(", ")
        } in one of the two tables before doing the fuzzy join.`,
      );
    }
  }

  let sql: string;

  if (prefixBlockingSize > 0) {
    // Two-phase blocking join.
    //
    // Phase 1: candidate pairs where the first N characters match (case-insensitive).
    // Phase 2: for left and right values that had no phase-1 partner, run an
    //   unbounded scan so cross-prefix pairs are never silently dropped.
    //
    // All pairs from both phases are collected in _sda_pairs, then the
    // actual table rows are joined using those pairs according to the
    // requested join type.
    const ltn = leftTable.name;
    const rtn = rightTable.name;
    const fn =
      `ROUND(rapidfuzz_${method}("${ltn}"."${leftColumn}", "${rtn}"."${rightColumn}"), 2)`;
    const scorePart = similarityColumn
      ? `, ${fn} AS "${similarityColumn}"`
      : "";
    const order =
      `ORDER BY "${ltn}"."${leftColumn}", "${rtn}"."${rightColumn}"`;

    const cte =
      `WITH _sda_ul  AS (SELECT DISTINCT "${leftColumn}"  AS v FROM "${ltn}" WHERE "${leftColumn}"  IS NOT NULL),
          _sda_ur  AS (SELECT DISTINCT "${rightColumn}" AS v FROM "${rtn}" WHERE "${rightColumn}" IS NOT NULL),
          _sda_p1  AS (
            SELECT l.v AS lv, r.v AS rv
            FROM _sda_ul l JOIN _sda_ur r
              ON LEFT(LOWER(l.v), ${prefixBlockingSize}) = LEFT(LOWER(r.v), ${prefixBlockingSize})
             AND rapidfuzz_${method}(l.v, r.v) >= ${threshold}
          ),
          _sda_ul2 AS (SELECT v FROM _sda_ul WHERE v NOT IN (SELECT lv FROM _sda_p1)),
          _sda_ur2 AS (SELECT v FROM _sda_ur WHERE v NOT IN (SELECT rv FROM _sda_p1)),
          _sda_p2  AS (
            SELECT l.v AS lv, r.v AS rv
            FROM _sda_ul2 l JOIN _sda_ur2 r
              ON rapidfuzz_${method}(l.v, r.v) >= ${threshold}
          ),
          _sda_pairs AS (
            SELECT lv, rv FROM _sda_p1
            UNION ALL
            SELECT lv, rv FROM _sda_p2
          )`;

    let body: string;
    if (joinType === "inner") {
      body = `SELECT "${ltn}".*, "${rtn}".*${scorePart}
         FROM "${ltn}"
         JOIN _sda_pairs ON "${ltn}"."${leftColumn}" = _sda_pairs.lv
         JOIN "${rtn}"   ON "${rtn}"."${rightColumn}" = _sda_pairs.rv
         ${order}`;
    } else if (joinType === "left") {
      body = `SELECT "${ltn}".*, "${rtn}".*${scorePart}
         FROM "${ltn}"
         LEFT JOIN _sda_pairs ON "${ltn}"."${leftColumn}" = _sda_pairs.lv
         LEFT JOIN "${rtn}"   ON "${rtn}"."${rightColumn}" = _sda_pairs.rv
         ${order}`;
    } else if (joinType === "right") {
      // Drive from the right table so all right rows are preserved.
      // SELECT list still puts left columns first for API consistency.
      body = `SELECT "${ltn}".*, "${rtn}".*${scorePart}
         FROM "${rtn}"
         LEFT JOIN _sda_pairs ON "${rtn}"."${rightColumn}" = _sda_pairs.rv
         LEFT JOIN "${ltn}"   ON "${ltn}"."${leftColumn}"  = _sda_pairs.lv
         ${order}`;
    } else {
      // full — left join + unmatched right rows via UNION ALL
      const nullLeftCols = leftCols.map((c) => `NULL AS "${c}"`).join(", ");
      const nullScore = similarityColumn
        ? `, NULL AS "${similarityColumn}"`
        : "";
      body = `SELECT * FROM (
           SELECT "${ltn}".*, "${rtn}".*${scorePart}
           FROM "${ltn}"
           LEFT JOIN _sda_pairs ON "${ltn}"."${leftColumn}" = _sda_pairs.lv
           LEFT JOIN "${rtn}"   ON "${rtn}"."${rightColumn}" = _sda_pairs.rv
           UNION ALL
           SELECT ${nullLeftCols}, "${rtn}".*${nullScore}
           FROM "${rtn}"
           WHERE "${rightColumn}" NOT IN (SELECT rv FROM _sda_pairs WHERE rv IS NOT NULL)
         ) ORDER BY "${leftColumn}", "${rightColumn}"`;
    }

    sql = `INSTALL rapidfuzz FROM community; LOAD rapidfuzz;
CREATE OR REPLACE TABLE "${outputTableName}" AS
${cte}
${body};
`;
  } else {
    sql = `INSTALL rapidfuzz FROM community; LOAD rapidfuzz;\n` +
      fuzzyJoinQuery(
        leftTable.name,
        leftColumn,
        rightTable.name,
        rightColumn,
        method,
        threshold,
        joinType,
        outputTableName,
        similarityColumn,
      );
  }

  await queryDB(
    leftTable,
    sql,
    mergeOptions(leftTable, {
      table: outputTableName,
      method: "fuzzyJoin()",
      parameters: {
        leftColumn,
        rightTable: rightTable.name,
        rightColumn,
        options,
      },
    }),
  );

  const allProjections = {
    ...leftTable.projections,
    ...rightTable.projections,
  };

  if (typeof options.outputTable === "string") {
    const newTable = leftTable.sdb.newTable(
      options.outputTable,
      allProjections,
    );
    return newTable;
  } else {
    leftTable.projections = allProjections;
    return leftTable;
  }
}
