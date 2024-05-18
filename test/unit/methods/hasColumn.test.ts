import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("hasColumn", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
        await sdb.loadData("dataCsv", ["test/data/files/data.csv"])
    })
    after(async function () {
        await sdb.done()
    })

    it("should return true when the column is in the data", async () => {
        assert.deepStrictEqual(await sdb.hasColumn("dataCsv", "key1"), true)
    })

    it("should return false when the column is not in the data", async () => {
        assert.deepStrictEqual(await sdb.hasColumn("dataCsv", "keyX"), false)
    })
})
