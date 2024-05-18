import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getVar", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
        await sdb.loadData("data", ["test/data/files/data.json"])
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the variance", async () => {
        assert.deepStrictEqual(
            await sdb.getVar("data", "key1"),
            1.6666666666666667
        )
    })
    it("should return the variance rounded", async () => {
        assert.deepStrictEqual(
            await sdb.getVar("data", "key1", { decimals: 6 }),
            1.666667
        )
    })
})
