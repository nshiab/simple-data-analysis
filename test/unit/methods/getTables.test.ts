import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getTables", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return one table", async () => {
        await sdb.loadData("dataCsv", ["test/data/files/data.csv"])

        const tables = await sdb.getTables()

        assert.deepStrictEqual(tables, ["dataCsv"])
    })
    it("should return multiple tables", async () => {
        await sdb.loadData("dataJson", ["test/data/files/data.json"])

        const tables = await sdb.getTables()

        assert.deepStrictEqual(tables, ["dataCsv", "dataJson"])
    })
})
