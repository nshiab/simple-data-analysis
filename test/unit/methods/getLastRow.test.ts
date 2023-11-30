import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("getLastRow", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
        await simpleNodeDB.loadData("data", ["test/data/files/data.json"])
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the last row", async () => {
        const data = await simpleNodeDB.getLastRow("data")
        assert.deepStrictEqual(data, { key1: 4, key2: "quatre" })
    })

    it("should return the last row found based on a condition", async () => {
        const data = await simpleNodeDB.getLastRow("data", {
            condition: `key2 = 'trois'`,
        })
        assert.deepStrictEqual(data, { key1: 3, key2: "trois" })
    })
})
