export default function replaceTextQuery(
    table: string,
    column: string,
    oldText: string,
    newText: string
) {
    return `UPDATE ${table} SET "${column}" = REPLACE("${column}", '${oldText}', '${newText}')`
}
