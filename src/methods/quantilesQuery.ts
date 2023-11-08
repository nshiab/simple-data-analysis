import stringToArray from "../helpers/stringToArray.js"

export default function quantilesQuery(
    table: string,
    values: string,
    nbQuantiles: number,
    newColumn: string,
    options: {
        categories?: string | string[]
    } = {}
) {
    const categories = options.categories
        ? stringToArray(options.categories)
        : []

    const partition =
        categories.length === 0
            ? ""
            : `PARTITION BY ${categories.map((d) => `"${d}"`).join(",")} `

    const query = `CREATE OR REPLACE TABLE ${table} AS SELECT *, ntile(${nbQuantiles}) OVER (${partition}ORDER BY "${values}") AS "${newColumn}",
    FROM ${table};`

    return query
}
