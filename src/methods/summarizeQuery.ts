export default function summarizeQuery(
    table: string,
    outputTable: string,
    values: string[],
    categories: string[],
    summaries: (
        | "count"
        | "min"
        | "max"
        | "avg"
        | "median"
        | "sum"
        | "skew"
        | "stdDev"
        | "var"
    )[],
    options: { decimals?: number; lang?: string } = {}
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

    if (summaries.length === 0) {
        summaries = Object.keys(aggregates) as (
            | "count"
            | "min"
            | "max"
            | "avg"
            | "median"
            | "sum"
            | "skew"
            | "stdDev"
            | "var"
        )[]
    }

    let query = `CREATE OR REPLACE TABLE ${outputTable} AS`

    let firstValue = true
    for (const value of values) {
        if (firstValue) {
            firstValue = false
        } else {
            query += "\nUNION"
        }
        query += `\nSELECT '${value}' AS 'value'${
            categories.length > 0
                ? categories.map((d) => `,\n"${d}"`).join(", ")
                : ""
        },${summaries.map(
            (d) =>
                `\nROUND(${aggregates[d]}("${value}"), ${
                    options.decimals ?? 2
                }) AS '${d}'`
        )}\nFROM ${table}`
        if (categories.length > 0) {
            query += `\nGROUP BY ${categories.map((d) => `"${d}"`).join(", ")}`
        }
    }

    query += `\nORDER BY "value" ASC${categories.map((d) => `, "${d}" ASC`)}`

    return query
}
