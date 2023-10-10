export default function replaceStringQuery(
    table: string,
    column: string,
    oldText: string,
    newText: string,
    options: { entireString?: boolean } = {}
) {
    let query = ""
    if (options.entireString) {
        query += `UPDATE ${table} SET "${column}" = 
        CASE
            WHEN "${column}" = '${oldText}' THEN '${newText}'
            ELSE "${column}"
        END`
    } else {
        query += `UPDATE ${table} SET "${column}" = REPLACE("${column}", '${oldText}', '${newText}')`
    }

    return query
}
