import duckdb, { Database, Connection } from "duckdb"

export default class SimpleNodeDB {
    ready!: boolean
    protected db!: Database
    protected connection!: Connection

    constructor() {}

    start() {
        this.db = new duckdb.Database(":memory:")
        this.connection = this.db.connect()
        return this
    }

    loadCSV(
        tableName: string,
        path: string,
        options = { header: true, delim: "," }
    ) {
        this.connection.exec(
            `CREATE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${path}', header=${options.header}, delim='${options.delim}')`,
            (err) => {
                if (err) {
                    throw err
                }
            }
        )
        return this
    }

    getData(tableName: string) {
        return new Promise((resolve) => {
            this.connection.all(`SELECT * from ${tableName}`, (err, res) => {
                if (err) {
                    throw err
                }
                resolve(res)
            })
        })
    }

    getDB() {
        return this.db
    }
}
