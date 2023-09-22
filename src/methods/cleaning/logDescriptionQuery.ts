export default function logDescriptionQuery(
    tableName: string,
    types: { [key: string]: string }
) {
    const extraData: { [key: string]: string } = { _: "type" }
    const typeKeys = Object.keys(types)
    const typeValues = Object.values(types)
    const columnsSumQuery = []
    const columnsCountQuery = []
    const columnsCountAllQuery = []
    for (let i = 0; i < typeKeys.length; i++) {
        columnsSumQuery.push(
            `SUM(CASE WHEN "${typeKeys[i]}" IS NULL THEN 1 ELSE 0 END) AS '${typeKeys[i]}'`
        )
        columnsCountQuery.push(`COUNT("${typeKeys[i]}") AS '${typeKeys[i]}'`)
        columnsCountAllQuery.push(`COUNT(*) AS '${typeKeys[i]}'`)
        extraData[typeKeys[i]] = typeValues[i]
    }

    return {
        query: `SELECT ${columnsSumQuery.join(
            ", "
        )}, 'null count' AS '_', FROM ${tableName}
        UNION
        SELECT ${columnsCountQuery.join(
            ", "
        )}, 'non null count' AS '_', FROM ${tableName}
        UNION
        SELECT ${columnsCountAllQuery.join(
            ", "
        )}, 'total count' AS '_', FROM ${tableName}`,
        extraData,
    }
}
