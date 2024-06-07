import stringToArray from "../helpers/stringToArray.js"

export default function proportionsVerticalQuery(
    table: string,
    column: string,
    newColumn: string,
    options: {
        categories?: string | string[]
        decimals?: number
    } = {}
) {
    const categories = options.categories
        ? stringToArray(options.categories)
        : []

    const partition =
        categories.length === 0
            ? ""
            : `PARTITION BY ${categories.map((d) => `${d}`).join(",")}`

    let query = ""
    if (typeof options.decimals === "number") {
        query = `CREATE OR REPLACE TABLE ${table} AS SELECT *, ROUND(${column} / sum(${column}) OVER(${partition}), ${options.decimals}) AS ${newColumn} FROM ${table}`
    } else {
        query = `CREATE OR REPLACE TABLE ${table} AS SELECT *, ${column} / sum(${column}) OVER(${partition}) AS ${newColumn} FROM ${table}`
    }

    return query
}
