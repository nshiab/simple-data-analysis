import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("hasColumn", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return true when the column is in the data", async () => {
        const table = sdb.newTable("data")
        await table.loadData("test/data/files/data.csv")
        assert.deepStrictEqual(await table.hasColumn("key1"), true)
    })

    it("should return false when the column is not in the data", async () => {
        const table = sdb.newTable("data")
        await table.loadData("test/data/files/data.csv")
        assert.deepStrictEqual(await table.hasColumn("keyX"), false)
    })
})
