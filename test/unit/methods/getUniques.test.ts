import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getUniques", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the unique values of a column", async () => {
        const table = sdb.newTable("data")
        await table.loadData(["test/data/files/dataDuplicates.csv"])

        const uniques = await table.getUniques("key1")

        assert.deepStrictEqual(uniques, ["1", "3", "8", "brioche"])
    })
})
