export default function linearRegressionQuery(
    table: string,
    outputTable: string,
    permutations: [string, string][],
    options: {
        decimals?: number
    }
) {
    let query = `CREATE OR REPLACE TABLE ${outputTable} AS`

    let firstValue = true
    for (const perm of permutations) {
        if (firstValue) {
            firstValue = false
        } else {
            query += "\nUNION"
        }
        query += `\nSELECT '${perm[0]}' AS x, '${
            perm[1]
        }' AS y, ROUND(REGR_SLOPE("${perm[1]}", "${perm[0]}"), ${
            options.decimals ?? 2
        }) AS slope, ROUND(REGR_INTERCEPT("${perm[1]}", "${perm[0]}"), ${
            options.decimals ?? 2
        }) AS intercept, ROUND(REGR_R2("${perm[1]}", "${perm[0]}"), ${
            options.decimals ?? 2
        }) as r2
        FROM ${table}`
    }

    query += `\nORDER BY r2 DESC, x ASC, y ASC`

    return query
}
