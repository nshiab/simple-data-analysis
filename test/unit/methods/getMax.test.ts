import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getMax", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the max value", async () => {
        const table = sdb.newTable("data")
        await table.loadData(["test/data/files/data.json"])
        assert.deepStrictEqual(await table.getMax("key1"), 4)
    })
})
