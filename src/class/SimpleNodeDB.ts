import duckdb, { Database, Connection } from "duckdb"
import loadDataQuery from "../methods/importing/loadDataQuery.js"
import { readdirSync } from "fs"

export default class SimpleNodeDB {
    protected verbose: boolean
    protected nbRowsToLog: number
    protected db!: Database
    protected connection!: Connection

    constructor(
        options: { verbose?: boolean; nbRowsToLog?: number } = {
            verbose: false,
            nbRowsToLog: 10,
        }
    ) {
        this.verbose = options.verbose ?? false
        this.nbRowsToLog = options.nbRowsToLog ?? 10
    }

    start() {
        this.db = new duckdb.Database(":memory:")
        this.db.exec("INSTALL httpfs")
        this.connection = this.db.connect()
        return this
    }

    async query(query: string, options = { returnData: false }) {
        if (this.verbose) {
            console.log(query)
        }

        return new Promise((resolve) => {
            if (options.returnData || this.verbose) {
                this.connection.all(query, (err, res) => {
                    if (err) {
                        throw err
                    }
                    if (this.verbose) {
                        if (res.length <= this.nbRowsToLog) {
                            console.table(res)
                        } else {
                            console.table(res.slice(0, this.nbRowsToLog))
                            console.log(
                                `Total rows: ${res.length} (nbRowsToLog: ${this.nbRowsToLog})`
                            )
                        }
                    }
                    resolve(res)
                })
            } else {
                this.connection.exec(query, (err) => {
                    if (err) {
                        throw err
                    }
                    resolve(true)
                })
            }
        })
    }

    async loadData(
        tableName: string,
        files: string[],
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
        } = {}
    ) {
        await this.query(loadDataQuery(tableName, files, options))
    }

    async loadDataFromDirectory(
        tableName: string,
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
        } = {}
    ) {
        const files = readdirSync(directory).map(
            (file) => `${directory}${file}`
        )
        this.query(loadDataQuery(tableName, files, options))
    }

    async getData(tableName: string) {
        return await this.query(`SELECT * from ${tableName}`, {
            returnData: true,
        })
    }

    getDB() {
        return this.db
    }

    done() {
        this.db.close()
    }
}
