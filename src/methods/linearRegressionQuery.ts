import stringToArray from "../helpers/stringToArray.js"

export default function linearRegressionQuery(
    table: string,
    outputTable: string,
    permutations: [string, string][],
    options: {
        categories?: string | string[]
        decimals?: number
    }
) {
    let query = `CREATE OR REPLACE TABLE ${outputTable} AS`

    const categories = options.categories
        ? stringToArray(options.categories)
        : []

    const groupBy =
        categories.length === 0
            ? ""
            : ` GROUP BY ${categories.map((d) => `"${d}"`).join(",")}`

    let firstValue = true
    for (const perm of permutations) {
        if (firstValue) {
            firstValue = false
        } else {
            query += "\nUNION"
        }
        query += `\nSELECT ${
            categories.length > 0
                ? `${categories.map((d) => `"${d}"`).join(",")}, `
                : ""
        }'${perm[0]}' AS x, '${perm[1]}' AS y, ROUND(REGR_SLOPE("${
            perm[1]
        }", "${perm[0]}"), ${
            options.decimals ?? 2
        }) AS slope, ROUND(REGR_INTERCEPT("${perm[1]}", "${perm[0]}"), ${
            options.decimals ?? 2
        }) AS yIntercept, ROUND(REGR_R2("${perm[1]}", "${perm[0]}"), ${
            options.decimals ?? 2
        }) as r2
        FROM ${table}${groupBy}`
    }

    query += `\nORDER BY  ${
        categories.length > 0
            ? `${categories.map((d) => `"${d}" ASC`).join(",")}, `
            : ""
    }r2 DESC, x ASC, y ASC`

    return query
}
