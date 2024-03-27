import stringToArray from "../helpers/stringToArray.js"

export default function rollingQuery(
    table: string,
    column: string,
    newColumn: string,
    summary: "count" | "min" | "max" | "mean" | "median" | "sum",
    preceding: number,
    following: number,
    options: {
        categories?: string | string[]
        decimals?: number
    } = {}
) {
    const aggregates: { [key: string]: string } = {
        count: "COUNT",
        min: "MIN",
        max: "MAX",
        mean: "AVG",
        median: "MEDIAN",
        sum: "SUM",
    }

    const categories = options.categories
        ? stringToArray(options.categories)
        : []
    const partition =
        categories.length > 0
            ? `PARTITION BY ${categories.map((d) => `"${d}"`).join(", ")}`
            : ""

    const query = `CREATE OR REPLACE TABLE ${table} AS SELECT *,
    ROUND(${aggregates[summary]}(${column}) OVER (${partition}
        ROWS BETWEEN ${preceding} PRECEDING AND ${following} FOLLOWING), ${options.decimals}) AS ${newColumn},
        COUNT(${column}) OVER (${partition}
            ROWS BETWEEN ${preceding} PRECEDING AND ${following} FOLLOWING) as tempCountForRolling
        FROM ${table};
        UPDATE ${table} SET "${newColumn}" = CASE
            WHEN tempCountForRolling != ${preceding + following + 1} THEN NULL
            ELSE "${newColumn}"
        END;
        ALTER TABLE ${table} DROP COLUMN tempCountForRolling;
        `

    return query
}
