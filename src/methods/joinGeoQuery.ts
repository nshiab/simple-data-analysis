export default function joinGeoQuery(
    leftTable: string,
    columnLeftTable: string,
    method: "intersect" | "inside",
    rightTable: string,
    columnRightTable: string,
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

    if (method === "intersect") {
        query += ` ON ST_Intersects(${leftTable}."${columnLeftTable}", ${rightTable}."${columnRightTable}");`
    } else if (method === "inside") {
        // Order is important
        query += ` ON ST_Covers(${rightTable}."${columnRightTable}", ${leftTable}."${columnLeftTable}");`
    } else {
        throw new Error(`Unknown ${method} method`)
    }

    return query
}
