import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getMax", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
        await sdb.loadData("data", ["test/data/files/data.json"])
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the max value", async () => {
        assert.deepStrictEqual(await sdb.getMax("data", "key1"), 4)
    })
})
