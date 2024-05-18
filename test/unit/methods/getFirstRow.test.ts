import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getFirstRow", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
        await sdb.loadData("data", ["test/data/files/data.json"])
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the first row", async () => {
        const data = await sdb.getFirstRow("data")
        assert.deepStrictEqual(data, { key1: 1, key2: "un" })
    })

    it("should return the first row found based on a condition", async () => {
        const data = await sdb.getFirstRow("data", {
            condition: `key2 = 'trois'`,
        })
        assert.deepStrictEqual(data, {
            key1: 3,
            key2: "trois",
        })
    })
})
