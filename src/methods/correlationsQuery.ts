export default function correlationsQuery(
    table: string,
    outputTable: string,
    combinations: [string, string][],
    options: {
        decimals?: number
        order?: "asc" | "desc"
    }
) {
    let query = `CREATE OR REPLACE TABLE ${outputTable} AS`

    let firstValue = true
    for (const comb of combinations) {
        if (firstValue) {
            firstValue = false
        } else {
            query += "\nUNION"
        }
        query += `\nSELECT '${comb[0]}' AS x, '${comb[1]}' AS y, ROUND(corr("${
            comb[0]
        }", "${comb[1]}"), ${options.decimals ?? 2}) as corr FROM ${table}`
    }

    query += `\nORDER BY corr ${
        options.order?.toUpperCase() ?? "DESC"
    }, "x" ASC, "y" DESC`

    return query
}
