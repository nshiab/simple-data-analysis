export default function summarizeQuery(
    table: string,
    types: {
        [key: string]: string
    },
    outputTable: string,
    values: string[],
    categories: string[],
    summaries: (
        | "count"
        | "min"
        | "max"
        | "mean"
        | "median"
        | "sum"
        | "skew"
        | "stdDev"
        | "var"
    )[],
    options: { decimals?: number } = {}
) {
    const aggregates: { [key: string]: string } = {
        count: "COUNT",
        min: "MIN",
        max: "MAX",
        mean: "AVG",
        median: "MEDIAN",
        sum: "SUM",
        skew: "SKEWNESS",
        stdDev: "STDDEV",
        var: "VARIANCE",
    }

    if (summaries.length === 0) {
        summaries = Object.keys(aggregates) as (
            | "count"
            | "min"
            | "max"
            | "mean"
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
                ? `, ${categories.map((d) => `"${d}"`).join(", ")}`
                : ""
        },${summaries.map((summary) => {
            if (
                [
                    "DATE",
                    "TIME",
                    "TIMESTAMP",
                    "TIMESTAMP WITH TIME ZONE",
                ].includes(types[value]) &&
                ["AVG", "SUM", "SKEWNESS", "STDDEV", "VARIANCE"].includes(
                    aggregates[summary]
                )
            ) {
                return `\nNULL AS '${summary}'`
            } else {
                return typeof options.decimals === "number"
                    ? `\nROUND(${aggregates[summary]}("${value}"), ${options.decimals}) AS '${summary}'`
                    : `\n${aggregates[summary]}("${value}") AS '${summary}'`
            }
        })}\nFROM ${table}`
        if (categories.length > 0) {
            query += `\nGROUP BY ${categories.map((d) => `"${d}"`).join(", ")}`
        }
    }

    query += `\nORDER BY ${["value", ...categories]
        .map((d) => `"${d}" ASC`)
        .join(", ")}`

    return query
}
