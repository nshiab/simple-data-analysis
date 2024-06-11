import getFirstNonNullOrUndefinedValues from "../helpers/getFirstNonNullOrUndefinedValues.js"
import parseValue from "../helpers/parseValue.js"
import getType from "./getType.js"

export default function loadArrayQueryWeb(
    table: string,
    arrayOfObjects: { [key: string]: unknown }[]
) {
    let query = `CREATE OR REPLACE TABLE ${table}`

    const columns = Object.keys(arrayOfObjects[0])
    const values = getFirstNonNullOrUndefinedValues(arrayOfObjects)
    const columnsWithTypes = []

    for (let i = 0; i < columns.length; i++) {
        columnsWithTypes.push(`"${columns[i]}" ${getType(values[i])}`)
    }

    query += `(${columnsWithTypes.join(", ")});\nINSERT INTO ${table} VALUES`

    for (const object of arrayOfObjects) {
        query += `\n(${Object.values(object)
            .map((d) => parseValue(d))
            .join(", ")}),`
    }

    return query
}
