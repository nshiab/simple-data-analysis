import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getColumns", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the columns of a table", async () => {
        const table = await sdb.newTable("data")
        await table.loadData("test/data/files/data.csv")

        const columns = await table.getColumns()

        assert.deepStrictEqual(columns, ["key1", "key2"])
    })
})
