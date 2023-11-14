export default function loadArrayQuery(
    table: string,
    arrayOfObjects: { [key: string]: unknown }[]
) {
    let query = `CREATE TABLE ${table}`

    const columns = Object.keys(arrayOfObjects[0])
    const values = Object.values(arrayOfObjects[0])
    const columnsWithTypes = []

    for (let i = 0; i < columns.length; i++) {
        columnsWithTypes.push(`${columns[i]} ${getType(values[i])}`)
    }

    query += `(${columnsWithTypes.join(", ")});\nINSERT INTO ${table} VALUES`

    for (const object of arrayOfObjects) {
        query += `\n(${Object.values(object)
            .map((d) => parseValue(d))
            .join(", ")}),`
    }

    return query
}

function getType(value: unknown) {
    if (value instanceof Date) {
        return "TIMESTAMP"
    } else if (typeof value === "bigint" || Number.isInteger(value)) {
        return "BIGINT"
    } else if (typeof value === "number") {
        return "DOUBLE"
    } else if (typeof value === "string") {
        return "VARCHAR"
    } else if (typeof value === "boolean") {
        return "BOOLEAN"
    } else {
        throw new Error(
            `Unkown type ${typeof value} for ${value}. Using first item in array to set the column types.`
        )
    }
}

function parseValue(value: unknown) {
    if (Number.isNaN(value) || value === undefined || value === null) {
        return "NULL"
    } else if (value instanceof Date) {
        return `'${value.toISOString()}'`
    } else if (typeof value === "string") {
        return `'${value}'`
    } else if (typeof value === "boolean") {
        return value
    } else if (typeof value === "number") {
        return value
    } else {
        throw new Error(`Unkown type ${typeof value} of ${value}`)
    }
}
