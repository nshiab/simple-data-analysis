import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("replaceNulls", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should replace null values in one column", async () => {
        await simpleNodeDB.loadArray("data", [
            { keyA: 1 },
            { keyA: null },
            { keyA: 3 },
            { keyA: null },
        ])
        await simpleNodeDB.replaceNulls("data", "keyA", 0)

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [
            { keyA: 1 },
            { keyA: 0 },
            { keyA: 3 },
            { keyA: 0 },
        ])
    })

    it("should replace null values in multiple columns", async () => {
        await simpleNodeDB.loadArray("data", [
            { keyA: 1, keyB: 1 },
            { keyA: null, keyB: 2 },
            { keyA: 3, keyB: null },
            { keyA: null, keyB: 4 },
        ])
        await simpleNodeDB.replaceNulls("data", ["keyA", "keyB"], 0)

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [
            { keyA: 1, keyB: 1 },
            { keyA: 0, keyB: 2 },
            { keyA: 3, keyB: 0 },
            { keyA: 0, keyB: 4 },
        ])
    })
})
