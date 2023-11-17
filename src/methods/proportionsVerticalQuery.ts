import stringToArray from "../helpers/stringToArray.js"

export default function proportionsVerticalQuery(
    table: string,
    column: string,
    options: {
        categories?: string | string[]
        suffix?: string
        decimals?: number
    } = {}
) {
    const categories = options.categories
        ? stringToArray(options.categories)
        : []

    const partition =
        categories.length === 0
            ? ""
            : `PARTITION BY ${categories.map((d) => `"${d}"`).join(",")}`

    let query = `CREATE OR REPLACE TABLE ${table} AS SELECT *, ROUND("${column}" / sum("${column}") OVER(${partition}), ${
        options.decimals ?? 2
    }) AS "${column}${options.suffix ?? "Perc"}" FROM ${table}`

    if (categories.length > 0) {
        query += ` ORDER BY ${categories
            .map((d) => `"${d}"`)
            .join(",")}, "${column}";`
    } else {
        query += ";"
    }

    return query
}
