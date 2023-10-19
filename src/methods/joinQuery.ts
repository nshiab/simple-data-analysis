export default function joinQuery(
    leftTable: string,
    rightTable: string,
    commonColumn: string,
    outputTable: string,
    join: "inner" | "left" | "right" | "full"
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

    query += ` ON (${leftTable}."${commonColumn}" = ${rightTable}."${commonColumn}");\n`
    query += `ALTER TABLE ${outputTable} DROP COLUMN "${commonColumn}:1";`
    return query
}
