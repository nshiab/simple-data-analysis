import stringToArray from "../helpers/stringToArray.js"

export default function zScoreQuery(
    table: string,
    column: string,
    newColumn: string,
    options: {
        categories?: string | string[]
        decimals?: number
    } = {}
) {
    const categories = options.categories
        ? stringToArray(options.categories)
        : []
    const partition =
        categories.length > 0
            ? `PARTITION BY ${categories.map((d) => `"${d}"`).join(", ")}`
            : ""

    const query = `
    CREATE OR REPLACE TABLE ${table} AS
    SELECT *, (
        ROUND(
        ("${column}"-AVG("${column}") OVER(${partition}))
        /
        STDDEV("${column}") OVER(${partition}),
        ${options.decimals ?? 2})
        ) AS "${newColumn}",
    FROM ${table}
    ${
        categories.length > 0
            ? `ORDER BY ${categories
                  .map((d) => `${d} ASC`)
                  .join(", ")}, "${newColumn}" ASC, "${column}" ASC`
            : `ORDER BY "${newColumn}" ASC, "${column}" ASC`
    }
    `

    return query
}
