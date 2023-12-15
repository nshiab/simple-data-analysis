import parseValue from "../helpers/parseValue.js"

export default function replaceNullsQuery(
    table: string,
    columns: string[],
    value: number | string | Date | boolean
) {
    let query = ""
    const valueParsed = parseValue(value)
    for (const column of columns) {
        query += `UPDATE ${table} SET "${column}" = ${valueParsed} WHERE "${column}" IS NULL;`
    }

    return query
}
