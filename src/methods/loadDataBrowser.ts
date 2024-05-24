import {
    AsyncDuckDB,
    AsyncDuckDBConnection,
    DuckDBDataProtocol,
} from "@duckdb/duckdb-wasm"
import getExtension from "../helpers/getExtension.js"
import mergeOptions from "../helpers/mergeOptions.js"
import formatDuration from "../helpers/formatDuration.js"
import SimpleWebTable from "../class/SimpleWebTable.js"

export default async function loadDataBrowser(
    simpleWebTable: SimpleWebTable,
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
    simpleWebTable.debug && console.log("\nloadData()")
    simpleWebTable.debug && console.log("parameters:", { table, url, options })

    let start
    if (simpleWebTable.debug) {
        start = Date.now()
    }

    if (await simpleWebTable.sdb.hasTable(table)) {
        await simpleWebTable.sdb.removeTable(table)
    }

    const fileExtension = getExtension(url)
    const filename = url.split("/")[url.split("/").length - 1]

    if (
        options.fileType === "csv" ||
        fileExtension === "csv" ||
        options.fileType === "dsv" ||
        typeof options.delim === "string"
    ) {
        await (simpleWebTable.db as AsyncDuckDB).registerFileURL(
            filename,
            url,
            DuckDBDataProtocol.HTTP,
            false
        )

        await (
            simpleWebTable.connection as AsyncDuckDBConnection
        ).insertCSVFromPath(filename, {
            name: table,
            detect: options.autoDetect ?? true,
            header: options.header ?? true,
            delimiter: options.delim ?? ",",
            skip: options.skip,
        })
    } else if (options.fileType === "json" || fileExtension === "json") {
        const res = await fetch(url)
        await (simpleWebTable.db as AsyncDuckDB).registerFileText(
            filename,
            await res.text()
        )
        await (
            simpleWebTable.connection as AsyncDuckDBConnection
        ).insertJSONFromPath(filename, {
            name: table,
        })
    } else if (options.fileType === "parquet" || fileExtension === "parquet") {
        await (simpleWebTable.db as AsyncDuckDB).registerFileURL(
            filename,
            url,
            DuckDBDataProtocol.HTTP,
            false
        )
        await simpleWebTable.runQuery(
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM parquet_scan('${filename}')`,
            simpleWebTable.connection,
            false,
            mergeOptions(simpleWebTable, {
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

    if (simpleWebTable.debug) {
        await simpleWebTable.logTable()
    }
}
