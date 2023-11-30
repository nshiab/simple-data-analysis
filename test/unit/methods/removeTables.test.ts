import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("removeTables", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should remove one table", async () => {
        await simpleNodeDB.loadData("dataCsv", "test/data/files/employees.csv")
        await simpleNodeDB.loadData(
            "dataJson",
            "test/data/files/employees.json"
        )

        await simpleNodeDB.removeTables("dataJson")

        const tables = await simpleNodeDB.getTables()
        assert.deepStrictEqual(tables, ["dataCsv"])
    })

    it("should remove multiple tables", async () => {
        await simpleNodeDB.loadData(
            "dataJson",
            "test/data/files/employees.json"
        )
        await simpleNodeDB.removeTables(["dataJson", "dataCsv"])

        const tables = await simpleNodeDB.getTables()

        assert.deepStrictEqual(tables, [])
    })
})
