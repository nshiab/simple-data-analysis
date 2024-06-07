export default function concatenateQuery(
    table: string,
    columns: string[],
    newColumn: string,
    options: { separator?: string }
) {
    let query = `ALTER TABLE ${table} ADD ${newColumn} VARCHAR;
    UPDATE ${table} SET ${newColumn} = `
    if (typeof options.separator === "string") {
        query += `CONCAT_WS('${options.separator}', ${columns
            .map((d) => `${d}`)
            .join(", ")})`
    } else {
        query += `CONCAT(${columns.map((d) => `${d}`).join(", ")})`
    }

    return query
}
