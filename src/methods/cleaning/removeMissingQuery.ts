export default function removeMissingQuery(
    table: string,
    columns: string[],
    options: {
        otherMissingValues?: string[]
        invert?: boolean
    } = {}
) {
    let otherMissingQuery = `CREATE OR REPLACE TABLE ${table} AS SELECT ${columns
        .map((d) => `"${d}"`)
        .join(", ")} FROM ${table}
        WHERE`

    for (let i = 0; i < columns.length; i++) {
        otherMissingQuery += `\n"${columns[i]}" IS NOT NULL AND`

        if (options?.otherMissingValues) {
            for (const missing of options.otherMissingValues) {
            }
        }
    }

    return otherMissingQuery.slice(0, otherMissingQuery.length - 4)
}
