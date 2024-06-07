import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getValues", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the values of a column", async () => {
        const table = sdb.newTable("data")
        await table.loadData(["test/data/files/data.csv"])

        const values = await table.getValues("key1")

        assert.deepStrictEqual(values, ["1", "3", "8", "brioche"])
    })
})
