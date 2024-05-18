import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("replaceNulls", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should replace null values in one column", async () => {
        await sdb.loadArray("data", [
            { keyA: 1 },
            { keyA: null },
            { keyA: 3 },
            { keyA: null },
        ])
        await sdb.replaceNulls("data", "keyA", 0)

        const data = await sdb.getData("data")

        assert.deepStrictEqual(data, [
            { keyA: 1 },
            { keyA: 0 },
            { keyA: 3 },
            { keyA: 0 },
        ])
    })

    it("should replace null values in multiple columns", async () => {
        await sdb.loadArray("data", [
            { keyA: 1, keyB: 1 },
            { keyA: null, keyB: 2 },
            { keyA: 3, keyB: null },
            { keyA: null, keyB: 4 },
        ])
        await sdb.replaceNulls("data", ["keyA", "keyB"], 0)

        const data = await sdb.getData("data")

        assert.deepStrictEqual(data, [
            { keyA: 1, keyB: 1 },
            { keyA: 0, keyB: 2 },
            { keyA: 3, keyB: 0 },
            { keyA: 0, keyB: 4 },
        ])
    })
})
