import parseValue from "../helpers/parseValue.js"

export default function removeQuery(
    table: string,
    columnsAndValues: { [key: string]: unknown[] }
) {
    let query = `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM ${table} WHERE\n`
    const columns = Object.keys(columnsAndValues)

    const conditions = []
    for (const column of columns) {
        conditions.push(
            ` ${column} NOT IN (${columnsAndValues[column].map((d) => parseValue(d)).join(", ")})`
        )
    }

    query += conditions.join("\nAND ")

    return query
}
