import duckdb, { Database, Connection } from "duckdb"

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
                        console.table(res.slice(0, this.nbRowsToLog))
                    }
                    resolve(res)
                })
            } else {
                this.connection.exec(query, (err) => {
                    if (err) {
                        throw err
                    }
                    Promise.resolve()
                })
            }
        })
    }

    async loadCSV(
        tableName: string,
        path: string,
        options: {
            header?: boolean
            columns?: { [key: string]: string }
            delim?: string
            autoDetect?: boolean
            skip?: number
        } = {}
    ) {
        await this.query(
            `CREATE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${path}', auto_detect=${
                options.autoDetect ?? true
            }, header=${options.header ?? true}, delim='${
                options.delim ?? ","
            }', skip=${options.skip ?? 0}${
                options.columns
                    ? `, columns=${JSON.stringify(options.columns)}`
                    : ""
            })`
        )
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
