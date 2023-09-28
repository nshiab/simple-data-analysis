export default function sortQuery(
    table: string,
    columns: { [key: string]: "asc" | "desc" },
    options: {
        lang?: { [key: string]: string }
    }
) {
    let query = `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM ${table}
    ORDER BY`

    for (const column of Object.keys(columns)) {
        if (options.lang && options.lang[column]) {
            query += `\n"${column}" COLLATE ${options.lang[column]} ${columns[
                column
            ].toUpperCase()},`
        } else {
            query += `\n"${column}" ${columns[column].toUpperCase()},`
        }
    }

    return query.slice(0, query.length - 1)
}
