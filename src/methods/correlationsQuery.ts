import stringToArray from "../helpers/stringToArray.js"

export default function correlationsQuery(
    table: string,
    outputTable: string,
    combinations: [string, string][],
    options: {
        categories?: string | string[]
        decimals?: number
        order?: "asc" | "desc"
    }
) {
    const categories = options.categories
        ? stringToArray(options.categories)
        : []

    const groupBy =
        categories.length === 0
            ? ""
            : ` GROUP BY ${categories.map((d) => `"${d}"`).join(",")}`

    let query = `CREATE OR REPLACE TABLE ${outputTable} AS`

    let firstValue = true
    for (const comb of combinations) {
        if (firstValue) {
            firstValue = false
        } else {
            query += "\nUNION"
        }
        query += `\nSELECT ${
            categories.length > 0
                ? `${categories.map((d) => `"${d}"`).join(",")}, `
                : ""
        }'${comb[0]}' AS x, '${comb[1]}' AS y, ROUND(corr("${comb[0]}", "${
            comb[1]
        }"), ${options.decimals ?? 2}) as corr FROM ${table}${groupBy}`
    }

    query += `\nORDER BY ${
        categories.length > 0
            ? `${categories.map((d) => `"${d}" ASC`).join(",")}, `
            : ""
    }corr ${options.order?.toUpperCase() ?? "DESC"}, "x" ASC, "y" ASC`

    return query
}
