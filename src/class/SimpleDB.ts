import { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"
import { Database, Connection } from "duckdb"

import getDuckDB from "../helpers/getDuckDB.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import stringToArray from "../helpers/stringToArray.js"

import loadDataQuery from "../methods/importing/loadDataQuery.js"
import logDescriptionQuery from "../methods/cleaning/logDescriptionQuery.js"
import removeMissingQuery from "../methods/cleaning/removeMissingQuery.js"
import renameColumnQuery from "../methods/restructuring/renameColumnQuery.js"
import replaceTextQuery from "../methods/cleaning/replaceStringQuery.js"
import convertQuery from "../methods/cleaning/convertQuery.js"
import roundQuery from "../methods/cleaning/round.js"
import joinQuery from "../methods/restructuring/joinQuery.js"
import insertRowsQuery from "../methods/importing/insertRowsQuery.js"

export default class SimpleDB {
    debug: boolean
    verbose: boolean
    nbRowsToLog: number
    db!: AsyncDuckDB | Database
    connection!: AsyncDuckDBConnection | Connection
    worker!: Worker | null
    runQuery!: (
        query: string,
        connection: AsyncDuckDBConnection | Connection,
        returnDataFromQuery: boolean
    ) => Promise<unknown>

    constructor(
        options: {
            verbose?: boolean
            nbRowsToLog?: number
            debug?: boolean
        } = {}
    ) {
        this.verbose = options.verbose ?? false
        this.nbRowsToLog = options.nbRowsToLog ?? 10
        this.debug = options.debug ?? false
        this.worker = null
        this.runQuery = async function (
            query: string,
            connection: AsyncDuckDBConnection | Connection,
            returnDataFromQuery: boolean
        ) {
            // Specific type for web
            const data = await (connection as AsyncDuckDBConnection).query(
                query
            )
            // No difference on the Web. But different with NodeJS.
            if (returnDataFromQuery) {
                return data as unknown
            } else {
                return data as unknown
            }
        }
    }

    async start() {
        ;(this.verbose || this.debug) && console.log("\nstart()")
        const duckDB = await getDuckDB()
        this.db = duckDB.db
        this.connection = await this.db.connect()
        if (typeof window !== "undefined") {
            this.connection.query("INSTALL httpfs")
        } else {
            console.log("No window. Not running 'INSTALL httpfs'")
        }

        this.worker = duckDB.worker
        return this
    }

    async customQuery(
        query: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            verbose?: boolean
            table?: string
            nbRowsToLog?: number
            returnedDataModifier?: (
                rows: {
                    [key: string]: unknown
                }[]
            ) => unknown
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ncustomQuery()")
        return await queryDB(
            this.connection,
            this.runQuery,
            query,
            mergeOptions(this, options)
        )
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
            verbose?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nloadData()")
        await queryDB(
            this.connection,
            this.runQuery,
            loadDataQuery(table, stringToArray(files), options),
            mergeOptions(this, { ...options, table })
        )
    }

    async insertRows(
        table: string,
        rows: { [key: string]: unknown }[],
        options: {
            returnDataFrom?: "query" | "table" | "none"
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ninsertRows()")
        return await queryDB(
            this.connection,
            this.runQuery,
            insertRowsQuery(table, rows),
            mergeOptions(this, { ...options, table })
        )
    }

    async insertTable(
        table: string,
        tableToInsert: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ninsertTable()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `INSERT INTO ${table} SELECT * FROM ${tableToInsert}`,
            mergeOptions(this, { ...options, table })
        )
    }

    async logSchema(
        table: string,
        options: {
            verbose?: boolean
        } = {}
    ) {
        options.verbose = options.verbose ?? true
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nlogSchema()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `DESCRIBE ${table}`,
            mergeOptions(this, {
                ...options,
                table,
                nbRowsToLog: Infinity,
                returnDataFrom: "query",
            })
        )
    }

    async logDescription(
        table: string,
        options: {
            verbose?: boolean
        } = {}
    ) {
        const types = await this.getTypes(table)

        options.verbose = options.verbose ?? true
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nlogDescription()")
        const { query, returnedDataModifier } = logDescriptionQuery(
            table,
            types
        )
        return await queryDB(
            this.connection,
            this.runQuery,
            query,
            mergeOptions(this, {
                ...options,
                table,
                returnedDataModifier,
                nbRowsToLog: Infinity,
                returnDataFrom: "query",
            })
        )
    }

    async cloneTable(
        originalTable: string,
        newTable: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ncloneTable")
        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${newTable} AS SELECT * FROM ${originalTable}`,
            mergeOptions(this, { ...options, table: newTable })
        )
    }

    async selectColumns(
        table: string,
        columns: string | string[],
        options: {
            returnDataFrom?: "query" | "table" | "none"
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nselectColumns")

        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT ${stringToArray(columns)
                .map((d) => `"${d}"`)
                .join(", ")} FROM ${table}`,
            mergeOptions(this, { ...options, table })
        )
    }

    async sample(
        table: string,
        numberRows: number,
        options: {
            seed?: number
            returnDataFrom?: "query" | "table" | "none"
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nsample")

        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM ${table} USING SAMPLE reservoir(${numberRows} ROWS)${
                typeof options.seed === "number"
                    ? ` REPEATABLE(${options.seed})`
                    : ""
            }`,
            mergeOptions(this, { ...options, table })
        )
    }

    async removeDuplicates(
        table: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nremoveDuplicates()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT DISTINCT * FROM ${table}`,
            mergeOptions(this, { ...options, table })
        )
    }

    async renameColumns(
        table: string,
        names: { [key: string]: string },
        options: {
            returnDataFrom?: "query" | "table" | "none"
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nrenameColumns()")

        let start
        if (options.verbose || this.debug) {
            start = Date.now()
        }

        const oldColumns = Object.keys(names)
        const newColumns = Object.values(names)

        let data
        for (let i = 0; i < oldColumns.length; i++) {
            if (i === oldColumns.length - 1) {
                data = await queryDB(
                    this.connection,
                    this.runQuery,
                    renameColumnQuery(table, oldColumns[i], newColumns[i]),
                    mergeOptions(this, { ...options, table })
                )
            } else {
                await queryDB(
                    this.connection,
                    this.runQuery,
                    renameColumnQuery(table, oldColumns[i], newColumns[i]),
                    {
                        table,
                        returnDataFrom: "none",
                        verbose: false,
                        nbRowsToLog: 0,
                        returnedDataModifier: undefined,
                        debug: false,
                        noTiming: true,
                        justQuery: true,
                    }
                )
            }
        }

        if (start) {
            const end = Date.now()
            console.log(`Done in ${end - start} ms`)
        }

        return data
    }

    async removeMissing(
        table: string,
        columns: string | string[] = [],
        options: {
            invert?: boolean
            returnDataFrom?: "query" | "table" | "none"
            verbose?: boolean
            nbRowsToLog?: number
            otherMissingValues?: (string | number)[]
        } = {
            otherMissingValues: ["undefined", "NaN", "null", ""],
        }
    ) {
        const types = await this.getTypes(table)
        const allColumns = Object.keys(types)

        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nremoveMissing()")

        options.otherMissingValues = options.otherMissingValues ?? [
            "undefined",
            "NaN",
            "null",
            "",
        ]

        columns = stringToArray(columns)

        return await queryDB(
            this.connection,
            this.runQuery,
            removeMissingQuery(
                table,
                allColumns,
                types,
                columns.length === 0 ? allColumns : columns,
                options
            ),
            mergeOptions(this, { ...options, table })
        )
    }

    async replaceStrings(
        table: string,
        columns: string | string[],
        strings: { [key: string]: string },
        options: {
            verbose?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nreplaceText()")

        let start
        if (options.verbose || this.debug) {
            start = Date.now()
        }

        columns = stringToArray(columns)
        const oldText = Object.keys(strings)
        const newText = Object.values(strings)

        const lastColumn = columns[columns.length - 1]
        const lastOldText = oldText[oldText.length - 1]

        let data
        for (const column of columns) {
            for (let i = 0; i < oldText.length; i++) {
                if (column === lastColumn && oldText[i] === lastOldText) {
                    data = await queryDB(
                        this.connection,
                        this.runQuery,
                        replaceTextQuery(table, column, oldText[i], newText[i]),
                        mergeOptions(this, {
                            ...options,
                            table,
                            noTiming: true,
                        })
                    )
                } else {
                    await queryDB(
                        this.connection,
                        this.runQuery,
                        replaceTextQuery(table, column, oldText[i], newText[i]),
                        mergeOptions(this, {
                            ...options,
                            table,
                            returnDataFrom: "none",
                            noTiming: true,
                            justQuery: true,
                        })
                    )
                }
            }
        }

        if (start) {
            const end = Date.now()
            console.log(`Done in ${end - start} ms`)
        }

        return data
    }

    async convert(
        table: string,
        types: {
            [key: string]:
                | "integer"
                | "float"
                | "string"
                | "date"
                | "time"
                | "datetime"
                | "datetimeTz"
        },
        options: {
            verbose?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
            datetimeFormat?: string
            try?: boolean
        } = {}
    ) {
        const allTypes = await this.getTypes(table)
        const allColumns = Object.keys(allTypes)

        const columns = Object.keys(types)
        const columnsTypes = Object.values(types)

        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nconvert()")

        return await queryDB(
            this.connection,
            this.runQuery,
            convertQuery(
                table,
                columns,
                columnsTypes,
                allColumns,
                allTypes,
                options
            ),
            mergeOptions(this, { ...options, table })
        )
    }

    async round(
        table: string,
        columns: string | string[],
        options: {
            verbose?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
            decimals?: number
            method?: "round" | "ceiling" | "floor"
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nround()")

        if (
            (options.method === "ceiling" || options.method === "floor") &&
            typeof options.decimals === "number"
        ) {
            console.log(
                "Ceiling and floor methods round to the nearest integer. Your option decimals has no effect."
            )
        }

        return await queryDB(
            this.connection,
            this.runQuery,
            roundQuery(table, stringToArray(columns), options),
            mergeOptions(this, { ...options, table })
        )
    }

    async removeTables(
        tables: string | string[],
        options: {
            verbose?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nremoveTables()")

        let start
        if (options.verbose || this.debug) {
            start = Date.now()
        }

        tables = stringToArray(tables)
        const lastTable = tables[tables.length - 1]
        let data
        for (const table of tables) {
            if (table === lastTable) {
                data = await queryDB(
                    this.connection,
                    this.runQuery,
                    `DROP TABLE ${table}`,
                    mergeOptions(this, { ...options, table, noTiming: true })
                )
            } else {
                await queryDB(
                    this.connection,
                    this.runQuery,
                    `DROP TABLE ${table}`,
                    mergeOptions(this, {
                        ...options,
                        table,
                        returnDataFrom: "none",
                        noTiming: true,
                        justQuery: true,
                    })
                )
            }
        }

        if (start) {
            const end = Date.now()
            console.log(`Done in ${end - start} ms`)
        }

        return data
    }

    async removeColumns(
        table: string,
        columns: string | string[],
        options: {
            verbose?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
            noTiming?: boolean
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\nremoveColumns()")

        let start
        if ((options.verbose || this.debug) && options.noTiming === false) {
            start = Date.now()
        }

        columns = stringToArray(columns)
        const lastColumn = columns[columns.length - 1]
        let data
        for (const column of columns) {
            if (column === lastColumn) {
                data = await queryDB(
                    this.connection,
                    this.runQuery,
                    `ALTER TABLE ${table} DROP "${column}"`,
                    mergeOptions(this, { ...options, table, noTiming: true })
                )
            } else {
                await queryDB(
                    this.connection,
                    this.runQuery,
                    `ALTER TABLE ${table} DROP "${column}"`,
                    mergeOptions(this, {
                        ...options,
                        table,
                        returnDataFrom: "none",
                        noTiming: true,
                        justQuery: true,
                    })
                )
            }
        }

        if (start) {
            const end = Date.now()
            console.log(`Done in ${end - start} ms`)
        }

        return data
    }

    async join(
        leftTable: string,
        rightTable: string,
        commonColumn: string,
        outputTable: string,
        join: "inner" | "left" | "right" | "full",
        options: {
            verbose?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\njoin()")

        let start
        if (options.verbose || this.debug) {
            start = Date.now()
        }

        await queryDB(
            this.connection,
            this.runQuery,
            joinQuery(leftTable, rightTable, commonColumn, outputTable, join),
            mergeOptions(this, {
                ...options,
                table: outputTable,
                returnDataFrom: "none",
                noTiming: true,
            })
        )

        const data = await this.removeColumns(
            outputTable,
            `${commonColumn}:1`,
            mergeOptions(this, {
                ...options,
                table: outputTable,
                noTiming: true,
            })
        )

        if (start) {
            const end = Date.now()
            console.log(`Done in ${end - start} ms`)
        }

        return data
    }

    async getTables(
        options: {
            verbose?: boolean
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ngetTables()")
        return (await queryDB(
            this.connection,
            this.runQuery,
            `SHOW TABLES`,
            mergeOptions(this, {
                ...options,
                returnDataFrom: "query",
                returnedDataModifier: (rows) => rows.map((d) => d.name),
            })
        )) as unknown as string[]
    }

    async getColumns(
        table: string,
        options: {
            verbose?: boolean
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ngetColumns()")
        return (await queryDB(
            this.connection,
            this.runQuery,
            `DESCRIBE ${table}`,
            mergeOptions(this, {
                ...options,
                table,
                returnDataFrom: "query",
                returnedDataModifier: (rows) => rows.map((d) => d.column_name),
            })
        )) as unknown as string[]
    }

    async getTypes(
        table: string,
        options: {
            verbose?: boolean
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ngetTypes()")

        const types = await queryDB(
            this.connection,
            this.runQuery,
            `DESCRIBE ${table}`,
            mergeOptions(this, {
                ...options,
                table,
                returnDataFrom: "query",
                returnedDataModifier: (rows: { [key: string]: unknown }[]) => {
                    const types: { [key: string]: unknown } = {}
                    for (const row of rows) {
                        types[row.column_name as string] = row.column_type
                    }
                    return types
                },
            })
        )

        return types as unknown as { [key: string]: string }
    }

    async getValues(
        table: string,
        column: string,
        options: {
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ngetValues()")

        return await queryDB(
            this.connection,
            this.runQuery,
            `SELECT ${column} FROM ${table}`,
            mergeOptions(this, {
                ...options,
                returnDataFrom: "query",
                returnedDataModifier: (rows) => rows.map((d) => d[column]),
            })
        )
    }

    async getUniques(
        table: string,
        column: string,
        options: {
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ngetUniques()")

        return await queryDB(
            this.connection,
            this.runQuery,
            `SELECT DISTINCT ${column} FROM ${table}`,
            mergeOptions(this, {
                ...options,
                returnDataFrom: "query",
                returnedDataModifier: (rows) => rows.map((d) => d[column]),
            })
        )
    }

    async getData(
        table: string,
        options: {
            verbose?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.verbose || this.verbose || this.debug) &&
            console.log("\ngetData()")

        return await queryDB(
            this.connection,
            this.runQuery,
            `SELECT * from ${table}`,
            mergeOptions(this, { ...options, returnDataFrom: "query" })
        )
    }

    async logTable(
        table: string,
        options: {
            verbose?: boolean
            returnData?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        options.verbose = options.verbose ?? true
        options.nbRowsToLog = options.nbRowsToLog ?? this.nbRowsToLog
        ;(options.verbose || options.verbose || this.verbose || this.debug) &&
            console.log("\nlogTable()")

        return await queryDB(
            this.connection,
            this.runQuery,
            `SELECT * FROM ${table} LIMIT ${options.nbRowsToLog}`,
            mergeOptions(this, { ...options, returnDataFrom: "table" })
        )
    }

    async done() {
        await (this.connection as AsyncDuckDBConnection)?.close()
        await (this.db as AsyncDuckDB)?.terminate()
        this.worker?.terminate()
    }
}
