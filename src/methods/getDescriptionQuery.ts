export default function getDescription(
    table: string,
    types: { [key: string]: string }
) {
    const extraData: { [key: string]: unknown } = { _: "type" }
    const typeKeys = Object.keys(types)
    const typeValues = Object.values(types)
    const columnsNullQuery = []
    const columnsCountQuery = []
    const columnsCountAllQuery = []
    const columnsDistinctQuery = []
    for (let i = 0; i < typeKeys.length; i++) {
        columnsNullQuery.push(
            `SUM(CASE WHEN "${typeKeys[i]}" IS NULL THEN 1 ELSE 0 END) AS "${typeKeys[i]}"`
        )
        columnsCountQuery.push(`COUNT("${typeKeys[i]}") AS "${typeKeys[i]}"`)
        columnsCountAllQuery.push(`COUNT(*) AS "${typeKeys[i]}"`)
        columnsDistinctQuery.push(
            `COUNT(DISTINCT "${typeKeys[i]}") AS "${typeKeys[i]}"`
        )
        extraData[typeKeys[i]] = typeValues[i]
    }

    const query = `SELECT ${columnsNullQuery.join(
        ", "
    )}, '0-Null' as "_" FROM ${table},
        UNION
        SELECT ${columnsCountQuery.join(
            ", "
        )}, '1-Not null' as "_" FROM ${table}
        UNION
        SELECT ${columnsDistinctQuery.join(", ")}, '2-Distinct' FROM ${table}
        UNION
        SELECT ${columnsCountAllQuery.join(", ")}, '3-Total' FROM ${table};`

    return {
        query,
        extraData,
    }
}
