import stringToArray from "../helpers/stringToArray.js"

export default function rankQuery(
    table: string,
    values: string,
    newColumn: string,
    options: {
        categories?: string | string[]
        noGaps?: boolean
    } = {}
) {
    const categories = options.categories
        ? stringToArray(options.categories)
        : []

    const partition =
        categories.length === 0
            ? ""
            : `PARTITION BY ${categories.map((d) => `${d}`).join(",")} `

    const query = `CREATE OR REPLACE TABLE ${table} AS SELECT *, ${
        options.noGaps ? "dense_rank()" : "rank()"
    } OVER (${partition}ORDER BY ${values}) AS ${newColumn},
    FROM ${table}`

    return query
}
