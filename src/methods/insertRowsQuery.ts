import parseValue from "../helpers/parseValue.js"

export default function insertRowsQuery(
    table: string,
    rows: { [key: string]: unknown }[]
) {
    const columns = Object.keys(rows[0])

    let query = `INSERT INTO ${table} (${columns.map((d) => `${d}`).join(", ")})
        VALUES`

    for (const row of rows) {
        const values = Object.values(row)
        query += `\n(${values.map((d) => parseValue(d)).join(", ")}),`
    }

    return query.slice(0, query.length - 1)
}
