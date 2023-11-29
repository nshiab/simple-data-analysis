import stringToArray from "../helpers/stringToArray.js"

export default function removeDuplicatesQuery(
    table: string,
    options: {
        on?: string | string[]
    } = {}
) {
    const columnsOn = options.on ? stringToArray(options.on) : null
    let distinct
    if (columnsOn) {
        distinct = `DISTINCT ON(${columnsOn.join(",")}) *`
    } else {
        distinct = "DISTINCT *"
    }

    return `CREATE OR REPLACE TABLE ${table} AS SELECT ${distinct} FROM ${table};`
}
