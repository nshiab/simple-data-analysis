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
        await sdb.loadData("dataDuplicatesCsv", [
            "test/data/files/dataDuplicates.csv",
        ])

        const uniques = await sdb.getUniques("dataDuplicatesCsv", "key1")

        assert.deepStrictEqual(uniques, ["1", "3", "8", "brioche"])
    })
})
