export default function summarizeQuery(
    table: string,
    values: string[],
    category: string[],
    summary: string[],
    options: { decimals?: number } = {}
) {
    const aggregates: { [key: string]: string } = {
        count: "COUNT",
        min: "MIN",
        max: "MAX",
        avg: "AVG",
        median: "MEDIAN",
        sum: "SUM",
        skew: "SKEWNESS",
        stdDev: "STDDEV",
        var: "var_samp",
    }
    const aggs = Object.keys(aggregates)

    let query = `CREATE OR REPLACE TABLE ${table} AS`

    let firstValue = true
    for (const value of values) {
        if (category.length === 0 && summary.length === 0) {
            if (firstValue) {
                firstValue = false
            } else {
                query += "\nUNION"
            }
            query += `\nSELECT '${value}' AS 'value',${aggs.map(
                (d) =>
                    `\nROUND(${aggregates[d]}("${value}"), ${
                        options.decimals ?? 2
                    }) AS '${d}'`
            )}
            FROM ${table}`
        } else {
            throw new Error("Don't know what to do.")
        }
    }

    query += `\nORDER BY "value" ASC`

    return query
}
