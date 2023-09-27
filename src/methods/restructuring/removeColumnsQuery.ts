export default function removeColumnsQuery(table: string, columns: string[]) {
    let query = `ALTER TABLE ${table}`
    for (const column of columns) {
        query += `\nDROP COLUMN "${column}"`
    }
    return query
}
