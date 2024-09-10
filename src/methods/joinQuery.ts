export default function joinQuery(
    leftTable: string,
    rightTable: string,
    commonColumn: string[],
    join: "inner" | "left" | "right" | "full",
    outputTable: string
) {
    let query = `CREATE OR REPLACE TABLE ${outputTable} AS SELECT *`

    if (join === "inner") {
        query += ` FROM ${leftTable} JOIN ${rightTable}`
    } else if (join === "left") {
        query += ` FROM ${leftTable} LEFT JOIN ${rightTable}`
    } else if (join === "right") {
        query += ` FROM ${leftTable} RIGHT JOIN ${rightTable}`
    } else if (join === "full") {
        query += ` FROM ${leftTable} FULL JOIN ${rightTable}`
    } else {
        throw new Error(`Unknown ${join} join.`)
    }

    query += ` ON (${commonColumn.map((d) => `${leftTable}."${d}" = ${rightTable}."${d}"`).join(" AND ")});\n`

    return query
}
