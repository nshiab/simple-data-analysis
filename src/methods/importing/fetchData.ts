import { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"

export default async function fetchData(
    connection: AsyncDuckDBConnection,
    tableName: string,
    url: string
) {
    await connection.query(
        `INSTALL httpfs;
        LOAD httpfs;
        CREATE TABLE ${tableName} AS SELECT * FROM "${url}";`
    )
}
