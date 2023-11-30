export default function proportionsHorizontalQuery(
    table: string,
    columns: string[],
    options: {
        suffix?: string
        decimals?: number
    } = {}
) {
    let query = `CREATE OR REPLACE TABLE ${table} AS SELECT *,`

    for (const col of columns) {
        query += ` ROUND("${col}" / (${columns
            .map((d) => `"${d}"`)
            .join(" + ")}), ${options.decimals ?? 2}) AS "${col}${
            options.suffix ?? "Perc"
        }",`
    }

    query += `FROM ${table}`

    return query
}
