import { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"

export default async function loadData(
    db: AsyncDuckDB,
    connection: AsyncDuckDBConnection,
    tableName: string,
    data: {
        [key: string]: string | number | Date | undefined | null | boolean
    }[]
) {
    const encoder = new TextEncoder()
    const buffer = encoder.encode(JSON.stringify(data))
    await db.registerFileBuffer(tableName, buffer)
    await connection.insertJSONFromPath(tableName, {
        name: tableName,
    })
}
