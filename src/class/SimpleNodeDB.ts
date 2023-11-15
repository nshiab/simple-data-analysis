import duckdb, { Connection, Database } from "duckdb"
import { AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"
import { readdirSync } from "fs"
import SimpleDB from "./SimpleDB.js"

import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"

import loadDataQuery from "../methods/loadDataQuery.js"
import writeDataQuery from "../methods/writeDataQuery.js"
import stringToArray from "../helpers/stringToArray.js"

export default class SimpleNodeDB extends SimpleDB {
    constructor(
        options: {
            nbRowsToLog?: number
            debug?: boolean
        } = {}
    ) {
        super(options)
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
                        resolve(
                            res as {
                                [key: string]:
                                    | number
                                    | string
                                    | Date
                                    | boolean
                                    | null
                            }[]
                        )
                    })
                } else {
                    ;(connection as Connection).exec(query, (err) => {
                        if (err) {
                            throw err
                        }
                        resolve(null)
                    })
                }
            })
        }
    }

    async start() {
        this.debug && console.log("\nstart()")
        this.db = new duckdb.Database(":memory:")
        this.db.exec("INSTALL httpfs")
        this.connection = this.db.connect()
        return this
    }

    async loadData(
        table: string,
        files: string | string[],
        options: {
            fileType?: "csv" | "dsv" | "json" | "parquet"
            autoDetect?: boolean
            fileName?: boolean
            unifyColumns?: boolean
            columns?: { [key: string]: string }
            // csv options
            header?: boolean
            allText?: boolean
            delim?: string
            skip?: number
            // json options
            format?: "unstructured" | "newlineDelimited" | "array"
            records?: boolean
            // others
            debug?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ): Promise<
        | {
              [key: string]: string | number | boolean | Date | null
          }[]
        | null
    > {
        ;(options.debug || this.debug) && console.log("\nloadData()")
        return await queryDB(
            this.connection,
            this.runQuery,
            loadDataQuery(table, stringToArray(files), options),
            mergeOptions(this, { ...options, table })
        )
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
            debug?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) &&
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
        table: string,
        file: string,
        options: {
            compression?: boolean
            debug?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nwriteData()")
        await queryDB(
            this.connection,
            this.runQuery,
            writeDataQuery(table, file, options),
            mergeOptions(this, { ...options, table })
        )
    }

    async done() {
        ;(this.db as Database).close()
    }
}
