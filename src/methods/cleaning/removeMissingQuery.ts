export default function removeMissingQuery(
    table: string,
    allColumns: string[],
    columns: string[],
    options: {
        invert?: boolean
    } = {}
) {
    let query = `CREATE OR REPLACE TABLE ${table} AS SELECT ${allColumns
        .map((d) => `"${d}"`)
        .join(", ")} FROM ${table}
        WHERE`

    if (options.invert) {
        for (let i = 0; i < columns.length; i++) {
            query += `\n"${columns[i]}" IS NULL OR`
        }
    } else {
        for (let i = 0; i < columns.length; i++) {
            query += `\n"${columns[i]}" IS NOT NULL AND`
        }
    }

    return options.invert
        ? query.slice(0, query.length - 3)
        : query.slice(0, query.length - 4)
}
