import {
    AsyncDuckDB,
    AsyncDuckDBConnection,
    DuckDBDataProtocol,
} from "@duckdb/duckdb-wasm"
import getExtension from "../helpers/getExtension.js"
import SimpleDB from "../class/SimpleDB.js"
import mergeOptions from "../helpers/mergeOptions.js"

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
    } = {}
) {
    simpleDB.debug && console.log("\nloadData()")
    simpleDB.debug && console.log("parameters:", { table, url, options })

    let start
    if (simpleDB.debug) {
        start = Date.now()
    }

    if (await simpleDB.hasTable(table)) {
        await simpleDB.removeTables(table)
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
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM parquet_scan('${filename}')`,
            simpleDB.connection,
            false,
            mergeOptions(simpleDB, {
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
        console.log(`Done in ${end - start} ms`)
    }

    if (simpleDB.debug) {
        await simpleDB.logTable(table)
    }
}
