export default function replaceStringsQuery(
    table: string,
    columns: string[],
    oldTexts: string[],
    newTexts: string[],
    options: { entireString?: boolean } = {}
) {
    let query = ""

    for (const column of columns) {
        for (let i = 0; i < oldTexts.length; i++) {
            if (options.entireString) {
                query += `UPDATE ${table} SET "${column}" = 
                CASE
                    WHEN "${column}" = '${oldTexts[i]}' THEN '${newTexts[i]}'
                    ELSE "${column}"
                END;\n`
            } else {
                query += `UPDATE ${table} SET "${column}" = REPLACE("${column}", '${oldTexts[i]}', '${newTexts[i]}');\n`
            }
        }
    }

    return query
}
