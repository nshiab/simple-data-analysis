import { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"
import { Database, Connection } from "duckdb"
import getDuckDB from "../helpers/getDuckDB.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import stringToArray from "../helpers/stringToArray.js"

import getDescription from "../methods/getDescription.js"
import renameColumnQuery from "../methods/renameColumnQuery.js"
import replaceStringsQuery from "../methods/replaceStringsQuery.js"
import convertQuery from "../methods/convertQuery.js"
import roundQuery from "../methods/roundQuery.js"
import joinQuery from "../methods/joinQuery.js"
import insertRowsQuery from "../methods/insertRowsQuery.js"
import sortQuery from "../methods/sortQuery.js"
import loadArrayQuery from "../methods/loadArrayQuery.js"
import outliersIQRQuery from "../methods/outliersIQRQuery.js"
import zScoreQuery from "../methods/zScoreQuery.js"
import tableToArrayOfObjects from "../helpers/arraysToData.js"
import parseType from "../helpers/parseTypes.js"
import concatenateQuery from "../methods/concatenateQuery.js"
import loadDataBrowser from "../methods/loadDataBrowser.js"
import removeMissing from "../methods/removeMissing.js"
import summarize from "../methods/summarize.js"
import correlations from "../methods/correlations.js"
import linearRegressions from "../methods/linearRegressions.js"
import getTables from "../methods/getTables.js"
import getColumns from "../methods/getColumns.js"
import getLength from "../methods/getLength.js"
import getTypes from "../methods/getTypes.js"
import getValues from "../methods/getValues.js"
import getUniques from "../methods/getUniques.js"

export default class SimpleDB {
    debug: boolean
    nbRowsToLog: number
    db!: AsyncDuckDB | Database
    connection!: AsyncDuckDBConnection | Connection
    worker!: Worker | null
    runQuery!: (
        query: string,
        connection: AsyncDuckDBConnection | Connection,
        returnDataFromQuery: boolean
    ) => Promise<
        | {
              [key: string]: number | string | Date | boolean | null
          }[]
        | undefined
    >

    constructor(
        options: {
            nbRowsToLog?: number
            debug?: boolean
        } = {}
    ) {
        this.nbRowsToLog = options.nbRowsToLog ?? 10
        this.debug = options.debug ?? false
        this.worker = null
        this.runQuery = async function (
            query: string,
            connection: AsyncDuckDBConnection | Connection,
            returnDataFromQuery: boolean
        ) {
            if (returnDataFromQuery) {
                const data = await (connection as AsyncDuckDBConnection).query(
                    query
                )
                return tableToArrayOfObjects(data)
            } else {
                await (connection as AsyncDuckDBConnection).query(query)
            }
        }
    }

    async start() {
        this.debug && console.log("\nstart()")
        const duckDB = await getDuckDB()
        this.db = duckDB.db
        this.connection = await this.db.connect()

        this.worker = duckDB.worker
        return this
    }

    async loadArray(
        table: string,
        arrayOfObjects: { [key: string]: unknown }[],
        options: {
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nloadArray()")

        return await queryDB(
            this.connection,
            this.runQuery,
            loadArrayQuery(table, arrayOfObjects),
            mergeOptions(this, { ...options, table })
        )
    }

    async loadData(
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
    ): Promise<
        | {
              [key: string]: string | number | boolean | Date | null
          }[]
        | undefined
        | null
    > {
        return await loadDataBrowser(this, table, url, options)
    }

    async insertRows(
        table: string,
        rows: { [key: string]: unknown }[],
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ninsertRows()")

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
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ninsertTable()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `INSERT INTO ${table} SELECT * FROM ${tableToInsert}`,
            mergeOptions(this, { ...options, table })
        )
    }

    async cloneTable(
        originalTable: string,
        newTable: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ncloneTable")
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
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nselectColumns")

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
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nsample")

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

    async renameColumns(
        table: string,
        names: { [key: string]: string },
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nrenameColumns()")

        return await queryDB(
            this.connection,
            this.runQuery,
            renameColumnQuery(table, Object.keys(names), Object.values(names)),
            mergeOptions(this, { ...options, table })
        )
    }

    async stack(
        table: string,
        columns: string[],
        columnsTo: string,
        valuesTo: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nstack()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM (UNPIVOT ${table}
        ON ${columns.map((d) => `"${d}"`).join(", ")}
        INTO
            NAME ${columnsTo}
            VALUE ${valuesTo})`,
            mergeOptions(this, { ...options, table })
        )
    }

    async expand(
        table: string,
        columnsFrom: string,
        valuesFrom: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nexpand()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM (PIVOT ${table} ON "${columnsFrom}" USING FIRST("${valuesFrom}"))`,
            mergeOptions(this, { ...options, table })
        )
    }

    async removeDuplicates(
        table: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nremoveDuplicates()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT DISTINCT * FROM ${table}`,
            mergeOptions(this, { ...options, table })
        )
    }

    async removeMissing(
        table: string,
        columns: string | string[] = [],
        options: {
            otherMissingValues?: (string | number)[]
            invert?: boolean
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {
            otherMissingValues: ["undefined", "NaN", "null", ""],
        }
    ) {
        return await removeMissing(this, table, columns, options)
    }

    async replaceStrings(
        table: string,
        columns: string | string[],
        strings: { [key: string]: string },
        options: {
            entireString?: boolean
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nreplaceStrings")
        options.entireString = options.entireString ?? false
        return await queryDB(
            this.connection,
            this.runQuery,
            replaceStringsQuery(
                table,
                stringToArray(columns),
                Object.keys(strings),
                Object.values(strings),
                options
            ),
            mergeOptions(this, {
                ...options,
                table,
            })
        )
    }

    async concatenate(
        table: string,
        columns: string[],
        newColumn: string,
        options: {
            separator?: string
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nfilter()")
        return await queryDB(
            this.connection,
            this.runQuery,
            concatenateQuery(table, columns, newColumn, options),
            mergeOptions(this, { ...options, table })
        )
    }

    async filter(
        table: string,
        conditions: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nfilter()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT *
            FROM ${table}
            WHERE ${conditions}`,
            mergeOptions(this, { ...options, table })
        )
    }

    async round(
        table: string,
        columns: string | string[],
        options: {
            decimals?: number
            method?: "round" | "ceiling" | "floor"
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nround()")
        return await queryDB(
            this.connection,
            this.runQuery,
            roundQuery(table, stringToArray(columns), options),
            mergeOptions(this, { ...options, table })
        )
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
                | "bigint"
                | "double"
                | "varchar"
                | "timestamp"
                | "timestamp with time zone"
        },
        options: {
            try?: boolean
            datetimeFormat?: string
            debug?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nconvert()")

        const allTypes = await this.getTypes(table)
        const allColumns = Object.keys(allTypes)

        return await queryDB(
            this.connection,
            this.runQuery,
            convertQuery(
                table,
                Object.keys(types),
                Object.values(types),
                allColumns,
                allTypes,
                options
            ),
            mergeOptions(this, { ...options, table })
        )
    }

    async removeTables(
        tables: string | string[],
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nremoveTables()")

        return await queryDB(
            this.connection,
            this.runQuery,
            stringToArray(tables)
                .map((d) => `DROP TABLE ${d};`)
                .join("\n"),
            mergeOptions(this, { ...options, table: null })
        )
    }

    async removeColumns(
        table: string,
        columns: string | string[],
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nremoveColumns()")

        return await queryDB(
            this.connection,
            this.runQuery,
            stringToArray(columns)
                .map((d) => `ALTER TABLE ${table} DROP "${d}";`)
                .join("\n"),
            mergeOptions(this, { ...options, table })
        )
    }

    async addColumn(
        table: string,
        column: string,
        type:
            | "integer"
            | "float"
            | "string"
            | "date"
            | "time"
            | "datetime"
            | "datetimeTz"
            | "bigint"
            | "double"
            | "varchar"
            | "timestamp"
            | "timestamp with time zone",
        definition: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\naddColumn")
        return await queryDB(
            this.connection,
            this.runQuery,
            `ALTER TABLE ${table} ADD "${column}" ${parseType(type)};
            UPDATE ${table} SET "${column}" = ${definition}`,
            mergeOptions(this, { ...options, table })
        )
    }

    async sort(
        table: string,
        order: { [key: string]: "asc" | "desc" },
        options: {
            lang?: { [key: string]: string }
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nsort")
        return await queryDB(
            this.connection,
            this.runQuery,
            sortQuery(table, order, options),
            mergeOptions(this, { ...options, table })
        )
    }

    async join(
        leftTable: string,
        rightTable: string,
        commonColumn: string,
        outputTable: string,
        join: "inner" | "left" | "right" | "full",
        options: {
            debug?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\njoin()")

        return await queryDB(
            this.connection,
            this.runQuery,
            joinQuery(leftTable, rightTable, commonColumn, outputTable, join),
            mergeOptions(this, {
                ...options,
                table: outputTable,
            })
        )
    }

    async summarize(
        table: string,
        outputTable: string,
        options: {
            values?: string | string[]
            categories?: string | string[]
            summaries?:
                | (
                      | "count"
                      | "min"
                      | "max"
                      | "avg"
                      | "median"
                      | "sum"
                      | "skew"
                      | "stdDev"
                      | "var"
                  )
                | (
                      | "count"
                      | "min"
                      | "max"
                      | "avg"
                      | "median"
                      | "sum"
                      | "skew"
                      | "stdDev"
                      | "var"
                  )[]
            decimals?: number
            debug?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        return await summarize(this, table, outputTable, options)
    }

    async correlations(
        table: string,
        outputTable: string,
        options: {
            x?: string
            y?: string
            decimals?: number
            order?: "asc" | "desc"
            debug?: boolean
            nbRowsToLog?: number
            returnDataFrom?: "query" | "table" | "none"
        } = {}
    ) {
        return await correlations(this, table, outputTable, options)
    }

    async linearRegressions(
        table: string,
        outputTable: string,
        options: {
            x?: string
            y?: string
            decimals?: number
            debug?: boolean
            nbRowsToLog?: number
            returnDataFrom?: "query" | "table" | "none"
        } = {}
    ) {
        return await linearRegressions(this, table, outputTable, options)
    }

    async outliersIQR(
        table: string,
        column: string,
        options: {
            newColumn?: string
            debug?: boolean
            nbRowsToLog?: number
            returnDataFrom?: "query" | "table" | "none"
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\noutliersIQR()")
        options.newColumn = options.newColumn ?? "outliers"
        return await queryDB(
            this.connection,
            this.runQuery,
            outliersIQRQuery(
                table,
                column,
                (await this.getLength(table)) % 2 === 0 ? "even" : "odd",
                options
            ),
            mergeOptions(this, { ...options, table })
        )
    }

    async zScore(
        table: string,
        column: string,
        options: {
            newColumn?: string
            decimals?: number
            debug?: boolean
            nbRowsToLog?: number
            returnDataFrom?: "query" | "table" | "none"
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nzScore()")
        options.newColumn = options.newColumn ?? "zScore"
        options.decimals = options.decimals ?? 2
        return await queryDB(
            this.connection,
            this.runQuery,
            zScoreQuery(table, column, options),
            mergeOptions(this, { ...options, table })
        )
    }

    async customQuery(
        query: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            table?: string
            returnedDataModifier?: (
                rows: {
                    [key: string]: number | string | Date | boolean | null
                }[]
            ) => {
                [key: string]: number | string | Date | boolean | null
            }[]
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ncustomQuery()")
        return await queryDB(
            this.connection,
            this.runQuery,
            query,
            mergeOptions(this, { ...options, table: options.table ?? null })
        )
    }

    async updateWithJS(
        table: string,
        dataModifier: (
            rows: {
                [key: string]: number | string | Date | boolean | null
            }[]
        ) => {
            [key: string]: number | string | Date | boolean | null
        }[],
        options: {
            debug?: boolean
            returnDataFrom?: "query" | "table" | "none"
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nupdateWithJS()")
        const oldData = await this.getData(
            table,
            mergeOptions(this, { ...options, table })
        )
        if (!oldData) {
            throw new Error("No data from getData.")
        }
        const newData = dataModifier(oldData)
        const updatedData = await queryDB(
            this.connection,
            this.runQuery,
            loadArrayQuery(table, newData),
            mergeOptions(this, { ...options, table })
        )

        return updatedData
    }

    async createTable(
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
                | "bigint"
                | "double"
                | "varchar"
                | "timestamp"
                | "timestamp with time zone"
        },
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ncreateTable()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE TABLE ${table} (${Object.keys(types)
                .map((d) => `"${d}" ${parseType(types[d])}`)
                .join(", ")});`,
            mergeOptions(this, { ...options, table })
        )
    }

    async getSchema(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ngetSchema()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `DESCRIBE ${table}`,
            mergeOptions(this, {
                ...options,
                returnDataFrom: "query",
                nbRowsToLog: Infinity,
                table,
            })
        )
    }

    async getDescription(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        return await getDescription(this, table, options)
    }

    async hasTable(table: string, options: { debug?: boolean } = {}) {
        ;(options.debug || this.debug) && console.log("\nhasTable()")
        return (await this.getTables(options)).includes(table)
    }

    async getTables(
        options: {
            debug?: boolean
        } = {}
    ) {
        return getTables(this, options)
    }

    async getColumns(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        return await getColumns(this, table, options)
    }

    async getWidth(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ngetWidth()")
        return (await getColumns(this, table, options)).length
    }

    async getLength(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        return await getLength(this, table, options)
    }

    async dataPoints(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ndataPoints()")
        return (
            (await this.getWidth(table, options)) *
            (await this.getLength(table, options))
        )
    }

    async getTypes(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        return await getTypes(this, table, options)
    }

    async getValues(
        table: string,
        column: string,
        options: {
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        return await getValues(this, table, column, options)
    }

    async getUniques(
        table: string,
        column: string,
        options: {
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        return await getUniques(this, table, column, options)
    }

    async getFirstRow(
        table: string,
        options: {
            condition?: string
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ngetFirstRow()")
        const queryResult = await queryDB(
            this.connection,
            this.runQuery,
            `SELECT * FROM ${table}${
                options.condition ? ` WHERE ${options.condition}` : ""
            } LIMIT 1`,
            mergeOptions(this, { ...options, table, returnDataFrom: "query" })
        )
        return Array.isArray(queryResult) ? queryResult[0] : queryResult
    }

    async getLastRow(
        table: string,
        options: {
            condition?: string
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ngetLastRow()")
        const queryResult = await queryDB(
            this.connection,
            this.runQuery,
            `WITH numberedRowsForGetLastRow AS (
                SELECT *, row_number() OVER () as rowNumberForGetLastRow FROM ${table}${
                    options.condition ? ` WHERE ${options.condition}` : ""
                }
            )
            SELECT * FROM numberedRowsForGetLastRow ORDER BY rowNumberForGetLastRow DESC LIMIT 1;`,
            mergeOptions(this, { ...options, table, returnDataFrom: "query" })
        )
        if (!queryResult) {
            throw new Error("No queryResult")
        }
        delete queryResult[0].rowNumberForGetLastRow
        return queryResult[0]
    }

    async getData(
        table: string,
        options: {
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ngetData()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `SELECT * from ${table}`,
            mergeOptions(this, { ...options, returnDataFrom: "query", table })
        )
    }

    async logTable(
        table: string,
        options: {
            debug?: boolean
            returnData?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nlogTable()")
        options.debug = options.debug ?? true
        options.nbRowsToLog = options.nbRowsToLog ?? this.nbRowsToLog
        return await queryDB(
            this.connection,
            this.runQuery,
            `SELECT * FROM ${table} LIMIT ${options.nbRowsToLog}`,
            mergeOptions(this, { ...options, table })
        )
    }

    async done() {
        await (this.connection as AsyncDuckDBConnection)?.close()
        await (this.db as AsyncDuckDB)?.terminate()
        this.worker?.terminate()
    }
}
