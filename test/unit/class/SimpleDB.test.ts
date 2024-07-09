import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"
import pkg from "duckdb"
const { Database, Connection } = pkg

describe("SimpleDB", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })

    it("should instantiate a SimpleDB class", () => {
        assert.deepStrictEqual(sdb instanceof SimpleDB, true)
    })
    it("should start and instantiate a db", async () => {
        await sdb.start()
        assert.deepStrictEqual(sdb.db instanceof Database, true)
    })
    it("should start and return an instance of SimpleDB", async () => {
        const returned = await sdb.start()
        assert.deepStrictEqual(returned instanceof SimpleDB, true)
    })
    it("should start and instantiate a connection", async () => {
        await sdb.start()
        assert.deepStrictEqual(sdb.connection instanceof Connection, true)
    })
    it("should run a custom query and return the result", async () => {
        const result = await sdb.customQuery(`select 42 as result`, {
            returnDataFrom: "query",
        })
        assert.deepStrictEqual(result, [{ result: 42 }])
    })
    it("should create tables without names", async () => {
        const table1 = sdb.newTable()
        await table1.loadData(["test/data/files/data.json"])
        const table2 = sdb.newTable()
        await table2.loadData(["test/data/files/data.json"])

        const tables = await sdb.getTables()

        assert.deepStrictEqual(
            tables.sort((a, b) => (a > b ? 1 : -1)),
            ["table1", "table2"]
        )
    })
    it("should create multiple tables without names before loading data", async () => {
        const sdb = new SimpleDB()

        const table1 = sdb.newTable()
        const table2 = sdb.newTable()

        await table1.loadData(["test/data/files/data.json"])
        await table2.loadData(["test/data/files/data.json"])

        const tables = await sdb.getTables()

        assert.deepStrictEqual(
            tables.sort((a, b) => (a > b ? 1 : -1)),
            ["table1", "table2"]
        )
    })
    it("should create tables with names", async () => {
        const table = sdb.newTable("tableWithName")
        await table.loadData(["test/data/files/data.json"])

        const tables = await sdb.getTables()

        assert.deepStrictEqual(
            tables.sort((a, b) => (a > b ? 1 : -1)),
            ["table1", "table2", "tableWithName"]
        )
    })
    it("should remove one table", async () => {
        // Overwriting tables above to have them stored in variables
        const table1 = sdb.newTable("table1")
        await table1.loadData(["test/data/files/data.json"])

        await sdb.removeTables(table1)

        const tables = await sdb.getTables()

        assert.deepStrictEqual(
            tables.sort((a, b) => (a > b ? 1 : -1)),
            ["table2", "tableWithName"]
        )
    })
    it("should remove multiple tables", async () => {
        // Overwriting tables above to have them stored in variables
        const table2 = sdb.newTable("table2")
        await table2.loadData(["test/data/files/data.json"])
        const tableWithName = sdb.newTable("tableWithName")
        await tableWithName.loadData(["test/data/files/data.json"])

        await sdb.removeTables([table2, tableWithName])

        const tables = await sdb.getTables()

        assert.deepStrictEqual(tables, [])
    })
    it("should return tables", async () => {
        const tableJSON = sdb.newTable("tableJSON")
        await tableJSON.loadData(["test/data/files/data.json"])
        const tableCSV = sdb.newTable("tableCSV")
        await tableCSV.loadData(["test/data/files/data.csv"])

        const tables = await sdb.getTables()

        assert.deepStrictEqual(
            tables.sort((a, b) => (a > b ? 1 : -1)),
            ["tableCSV", "tableJSON"]
        )
    })
    it("should check a return true when a table exists", async () => {
        const tableJSON = sdb.newTable("tableJSON")
        await tableJSON.loadData(["test/data/files/data.json"])

        assert.deepStrictEqual(await sdb.hasTable("tableJSON"), true)
    })
    it("should check a return false when a table doesn't exist", async () => {
        const tableJSON = sdb.newTable("tableJSON")
        await tableJSON.loadData(["test/data/files/data.json"])

        assert.deepStrictEqual(await sdb.hasTable("tableX"), false)
    })
    it("should return the DuckDB extensions", async () => {
        await sdb.getExtensions()
        // Not sure how to test. Different depending on the environment?
    })
    it("should close the db", async () => {
        await sdb.done()
        // How to test?
    })
    it("should log debugging information when debug is true", async () => {
        const sdb = new SimpleDB({ debug: true })
        await sdb.newTable("test").loadData("test/data/files/cities.csv")
        // How to test?
        await sdb.done()
    })
    it("should log a specific number of rows", async () => {
        const sdb = new SimpleDB({ nbRowsToLog: 2 })
        const test = sdb.newTable("test")
        await test.loadData("test/data/files/cities.csv")
        await test.logTable()
        // How to test?
        await sdb.done()
    })
    it("should log a specific number of characters", async () => {
        const sdb = new SimpleDB({ nbCharactersToLog: 5 })
        const test = sdb.newTable("test")
        await test.loadData("test/data/files/cities.csv")
        await test.logTable()
        // How to test?
        await sdb.done()
    })
    it("should log the total duration", async () => {
        const sdb = new SimpleDB({ logDuration: true })
        const test = sdb.newTable("test")
        await test.loadData("test/data/files/cities.csv")
        // How to test?
        await sdb.done()
    })
})
