import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getLastRow", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
        await sdb.loadData("data", ["test/data/files/data.json"])
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the last row", async () => {
        const data = await sdb.getLastRow("data")
        assert.deepStrictEqual(data, { key1: 4, key2: "quatre" })
    })

    it("should return the last row found based on a condition", async () => {
        const data = await sdb.getLastRow("data", {
            condition: `key2 = 'trois'`,
        })
        assert.deepStrictEqual(data, { key1: 3, key2: "trois" })
    })
})
