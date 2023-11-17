import {
    AsyncDuckDB,
    AsyncDuckDBConnection,
    DuckDBDataProtocol,
} from "@duckdb/duckdb-wasm"
import getExtension from "../helpers/getExtension.js"
import { SimpleDB } from "../indexWeb.js"

export default async function loadDataBrowser(
    simpleDB: SimpleDB,
    table: string,
    url: string,
    options: {
        fileType?: "csv" | "dsv" | "json" | "parquet"
        autoDetect?: boolean
        // csv options
        header?: boolean
        delim?: string
        skip?: number
        // others
        debug?: boolean
        returnDataFrom?: "table" | "query" | "none"
        nbRowsToLog?: number
    } = {}
) {
    ;(options.debug || simpleDB.debug) && console.log("\nloadData()")

    if (simpleDB.db === undefined) {
        throw new Error(
            "No db. Have you run the start method? => await sdb.start()"
        )
    }

    let start
    if (options.debug || simpleDB.debug) {
        start = Date.now()
    }

    const fileExtension = getExtension(url)
    const filename = url.split("/")[url.split("/").length - 1]

    if (
        options.fileType === "csv" ||
        fileExtension === "csv" ||
        options.fileType === "dsv" ||
        typeof options.delim === "string"
    ) {
        await (simpleDB.db as AsyncDuckDB).registerFileURL(
            filename,
            url,
            DuckDBDataProtocol.HTTP,
            false
        )
        await (simpleDB.connection as AsyncDuckDBConnection).insertCSVFromPath(
            filename,
            {
                name: table,
                detect: options.autoDetect ?? true,
                header: options.header ?? true,
                delimiter: options.delim ?? ",",
                skip: options.skip,
            }
        )
    } else if (options.fileType === "json" || fileExtension === "json") {
        const res = await fetch(url)
        await (simpleDB.db as AsyncDuckDB).registerFileText(
            filename,
            await res.text()
        )
        await (simpleDB.connection as AsyncDuckDBConnection).insertJSONFromPath(
            filename,
            {
                name: table,
            }
        )
    } else if (options.fileType === "parquet" || fileExtension === "parquet") {
        await (simpleDB.db as AsyncDuckDB).registerFileURL(
            filename,
            url,
            DuckDBDataProtocol.HTTP,
            false
        )
        await simpleDB.runQuery(
            `CREATE TABLE ${table} AS SELECT * FROM parquet_scan('${filename}')`,
            simpleDB.connection,
            false
        )
    } else {
        throw new Error(
            `Unknown options.fileType ${options.fileType} or fileExtension ${fileExtension}`
        )
    }

    if (start) {
        const end = Date.now()
        console.log(`Done in ${end - start} ms`)
    }

    if (
        options.returnDataFrom === "table" ||
        options.returnDataFrom === "query"
    ) {
        return await simpleDB.runQuery(
            `SELECT * FROM ${table}`,
            simpleDB.connection,
            true
        )
    } else {
        return null
    }
}
