export default function convertToQuery(
    table: string,
    columns: string[],
    types: ("integer" | "float" | "string")[],
    allColumns: string[]
) {
    let query = `CREATE OR REPLACE TABLE ${table} AS SELECT`
    for (const column of allColumns) {
        const indexOf = columns.indexOf(column)
        if (indexOf === -1) {
            query += ` "${column}",`
        } else {
            query += ` CAST("${columns[indexOf]}" AS ${parseType(
                types[indexOf]
            )}) AS "${columns[indexOf]}",`
        }
    }

    query += ` FROM ${table}`

    return query
}

function parseType(type: "integer" | "float" | "string") {
    if (type === "integer") {
        return "BIGINT"
    } else if (type === "float") {
        return "DOUBLE"
    } else if (type === "string") {
        return "VARCHAR"
    } else {
        throw new Error(`Unknown type ${type}`)
    }
}
