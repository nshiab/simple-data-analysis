export default function cloneQuery(
    table: string,
    columns: string[],
    newTable: string,
    options: {
        condition?: string
    } = {}
) {
    return `CREATE OR REPLACE TABLE ${newTable} AS SELECT ${columns.map((d) => `"${d}"`).join(", ")} FROM ${table}${
        options.condition ? ` WHERE ${options.condition}` : ""
    }`
}
