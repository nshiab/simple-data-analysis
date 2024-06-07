export default function upperQuery(table: string, columns: string[]) {
    let query = ""

    for (const column of columns) {
        query += `\nUPDATE ${table} SET ${column} = UPPER(${column});`
    }

    return query
}
