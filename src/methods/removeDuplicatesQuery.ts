import stringToArray from "../helpers/stringToArray.js"

export default function removeDuplicatesQuery(
    table: string,
    options: {
        on?: string | string[]
        order?: { [key: string]: "asc" | "desc" }
    } = {}
) {
    let order = ``
    if (options.order) {
        order += "ORDER BY "
        order += Object.keys(options.order)
            .map(
                (column) =>
                    `"${column}" ${(
                        options.order as { [key: string]: "asc" | "desc" }
                    )[column].toUpperCase()}`
            )
            .join(", ")
    } else {
        order = "ORDER BY ALL"
    }

    const columnsOn = options.on ? stringToArray(options.on) : null
    let distinct
    if (columnsOn) {
        distinct = `DISTINCT ON(${columnsOn.join(",")}) *`
    } else {
        distinct = "DISTINCT *"
    }

    return `CREATE OR REPLACE TABLE ${table} AS SELECT ${distinct} FROM ${table} ${order};`
}
