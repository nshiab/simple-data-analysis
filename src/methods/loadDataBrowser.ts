import {
    AsyncDuckDB,
    AsyncDuckDBConnection,
    DuckDBDataProtocol,
} from "@duckdb/duckdb-wasm"
import getExtension from "../helpers/getExtension.js"
import SimpleWebDB from "../class/SimpleWebDB.js"
import mergeOptions from "../helpers/mergeOptions.js"
import formatDuration from "../helpers/formatDuration.js"

export default async function loadDataBrowser(
    SimpleWebDB: SimpleWebDB,
    table: string,
    url: string,
    options: {
        fileType?: "csv" | "dsv" | "json" | "parquet"
        autoDetect?: boolean
        // csv options
        header?: boolean
        delim?: string
        skip?: number
    } = {}
) {
    SimpleWebDB.debug && console.log("\nloadData()")
    SimpleWebDB.debug && console.log("parameters:", { table, url, options })

    let start
    if (SimpleWebDB.debug) {
        start = Date.now()
    }

    if (await SimpleWebDB.hasTable(table)) {
        await SimpleWebDB.removeTables(table)
    }

    const fileExtension = getExtension(url)
    const filename = url.split("/")[url.split("/").length - 1]

    if (
        options.fileType === "csv" ||
        fileExtension === "csv" ||
        options.fileType === "dsv" ||
        typeof options.delim === "string"
    ) {
        await (SimpleWebDB.db as AsyncDuckDB).registerFileURL(
            filename,
            url,
            DuckDBDataProtocol.HTTP,
            false
        )

        await (
            SimpleWebDB.connection as AsyncDuckDBConnection
        ).insertCSVFromPath(filename, {
            name: table,
            detect: options.autoDetect ?? true,
            header: options.header ?? true,
            delimiter: options.delim ?? ",",
            skip: options.skip,
        })
    } else if (options.fileType === "json" || fileExtension === "json") {
        const res = await fetch(url)
        await (SimpleWebDB.db as AsyncDuckDB).registerFileText(
            filename,
            await res.text()
        )
        await (
            SimpleWebDB.connection as AsyncDuckDBConnection
        ).insertJSONFromPath(filename, {
            name: table,
        })
    } else if (options.fileType === "parquet" || fileExtension === "parquet") {
        await (SimpleWebDB.db as AsyncDuckDB).registerFileURL(
            filename,
            url,
            DuckDBDataProtocol.HTTP,
            false
        )
        await SimpleWebDB.runQuery(
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM parquet_scan('${filename}')`,
            SimpleWebDB.connection,
            false,
            mergeOptions(SimpleWebDB, {
                table: null,
                method: null,
                parameters: null,
            })
        )
    } else {
        throw new Error(
            `Unknown options.fileType ${options.fileType} or fileExtension ${fileExtension}`
        )
    }

    if (start) {
        const end = Date.now()
        console.log(`Done in ${formatDuration(start, end)}`)
    }

    if (SimpleWebDB.debug) {
        await SimpleWebDB.logTable(table)
    }
}
