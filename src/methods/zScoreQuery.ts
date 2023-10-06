export default function zScoreQuery(
    table: string,
    column: string,
    options: {
        newColumn?: string
        decimals?: number
    } = {}
) {
    return `
    CREATE OR REPLACE TABLE ${table} AS
    SELECT *, (
        ROUND(
        ("${column}"-AVG("${column}") Over())
        /
        STDDEV("${column}") Over(),
        ${options.decimals ?? 2})
        ) AS "${options.newColumn ?? "zScore"}",
    FROM ${table}`
}
