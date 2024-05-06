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
        | "countUnique"
        | "countNull"
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
        count: "count", // specific implementation
        countUnique: "COUNT(DISTINCT",
        countNull: "countNull", // Specific implementation
        min: "MIN(",
        max: "MAX(",
        mean: "AVG(",
        median: "MEDIAN(",
        sum: "SUM(",
        skew: "SKEWNESS(",
        stdDev: "STDDEV(",
        var: "VARIANCE(",
    }

    if (summaries.length === 0) {
        summaries = Object.keys(aggregates) as (
            | "count"
            | "countUnique"
            | "countNull"
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
                types[value] === "VARCHAR" &&
                [
                    "MIN(",
                    "MAX(",
                    "AVG(",
                    "MEDIAN(",
                    "SUM(",
                    "SKEWNESS(",
                    "STDDEV(",
                    "VARIANCE(",
                ].includes(aggregates[summary])
            ) {
                return `\nNULL AS '${summary}'`
            } else if (
                [
                    "DATE",
                    "TIME",
                    "TIMESTAMP",
                    "TIMESTAMP_MS",
                    "TIMESTAMP WITH TIME ZONE",
                ].includes(types[value]) &&
                ["AVG(", "SUM(", "SKEWNESS(", "STDDEV(", "VARIANCE("].includes(
                    aggregates[summary]
                )
            ) {
                return `\nNULL AS '${summary}'`
            } else if (summary === "count") {
                return `COUNT(*) as count`
            } else if (summary === "countNull") {
                return `COUNT(CASE WHEN "${value}" IS NULL THEN 1 END) as countNull`
            } else {
                return typeof options.decimals === "number" &&
                    ![
                        "VARCHAR",
                        "DATE",
                        "TIME",
                        "TIMESTAMP",
                        "TIMESTAMP WITH TIME ZONE",
                    ].includes(types[value])
                    ? `\nROUND(${aggregates[summary]}"${value}"), ${options.decimals}) AS '${summary}'`
                    : `\n${aggregates[summary]}"${value}") AS '${summary}'`
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
