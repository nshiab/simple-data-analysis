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
        const tempQuery = `"${col}" / (${columns
            .map((d) => `"${d}"`)
            .join(" + ")})`
        if (typeof options.decimals === "number") {
            query += ` ROUND(${tempQuery}, ${options.decimals})`
        } else {
            query += ` ${tempQuery}`
        }
        query += ` AS "${col}${options.suffix ?? "Perc"}",`
    }

    query += `FROM ${table}`

    return query
}
