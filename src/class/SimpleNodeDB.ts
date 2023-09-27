import duckdb, { Connection, Database } from "duckdb"
import { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"
import { readdirSync } from "fs"
import SimpleDB from "./SimpleDB.js"

import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"

import loadDataQuery from "../methods/importing/loadDataQuery.js"
import writeDataQuery from "../methods/exporting/writeDataQuery.js"

export default class SimpleNodeDB extends SimpleDB {
    constructor() {
        super()
        this.runQuery = function (
            query: string,
            connection: AsyncDuckDBConnection | Connection,
            returnDataFromQuery: boolean
        ) {
            return new Promise((resolve) => {
                if (returnDataFromQuery) {
                    ;(connection as Connection).all(query, (err, res) => {
                        if (err) {
                            throw err
                        }
                        resolve(res)
                    })
                } else {
                    ;(connection as Connection).exec(query, (err) => {
                        if (err) {
                            throw err
                        }
                        resolve("No error")
                    })
                }
            })
        }
    }

    async start() {
        ;(this.verbose || this.debug) && console.log("\nstart()")
        this.db = new duckdb.Database(":memory:")
        this.db.exec("INSTALL httpfs")
        this.connection = this.db.connect()
        return this
    }

    async loadDataFromDirectory(
        table: string,
        directory: string,
        options: {
            fileType?: "csv" | "dsv" | "json" | "parquet"
            autoDetect?: boolean
            fileName?: boolean
            unifyColumns?: boolean
            columns?: { [key: string]: string }
            // csv options
            header?: boolean
            delim?: string
            skip?: number
            // json options
            format?: "unstructured" | "newlineDelimited" | "array"
            records?: boolean
            // others
            verbose?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nloadDataFromDirectory()")
        const files = readdirSync(directory).map(
            (file) => `${directory}${file}`
        )
        queryDB(
            this.connection,
            this.runQuery,
            loadDataQuery(table, files, options),
            mergeOptions(this, { ...options, table })
        )
    }

    async writeData(
        file: string,
        table: string,
        options: {
            compression?: boolean
            verbose?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nwriteData()")
        await queryDB(
            this.connection,
            this.runQuery,
            writeDataQuery(file, table, options),
            mergeOptions(this, { ...options, table })
        )
    }

    async done() {
        ;(this.db as Database).close()
    }
}
