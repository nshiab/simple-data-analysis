export default function trimQuery(
    table: string,
    columns: string[],
    options: { character?: string; method?: "leftTrim" | "rightTrim" | "trim" }
) {
    let query = ``

    const method = options.method ?? "trim"

    const specialCharacter =
        typeof options.character === "string" ? `, '${options.character}'` : ""

    if (method === "trim") {
        for (const column of columns) {
            query += `\nUPDATE ${table} SET ${column} = TRIM(${column}${specialCharacter});`
        }
    } else if (method === "leftTrim") {
        for (const column of columns) {
            query += `\nUPDATE ${table} SET ${column} = LTRIM(${column}${specialCharacter});`
        }
    } else if (method === "rightTrim") {
        for (const column of columns) {
            query += `\nUPDATE ${table} SET ${column} = RTRIM(${column}${specialCharacter});`
        }
    } else {
        throw new Error(`Unknown method ${options.method}`)
    }

    return query
}
