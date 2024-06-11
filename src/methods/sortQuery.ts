export default function sortQuery(
    table: string,
    order: { [key: string]: "asc" | "desc" },
    options: {
        lang?: { [key: string]: string }
    } = {}
) {
    let query = `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM ${table}
    ORDER BY`

    for (const column of Object.keys(order)) {
        if (options.lang && options.lang[column]) {
            query += `\n"${column}" COLLATE ${options.lang[column]} ${order[
                column
            ].toUpperCase()},`
        } else {
            query += `\n"${column}" ${order[column].toUpperCase()},`
        }
    }

    return query.slice(0, query.length - 1)
}
