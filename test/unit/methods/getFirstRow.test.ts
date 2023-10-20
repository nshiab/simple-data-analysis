import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("getFirstRow", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
        await simpleNodeDB.loadData("data", ["test/data/files/data.json"])
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the first row", async () => {
        const data = await simpleNodeDB.getFirstRow("data")
        assert.deepStrictEqual(data, { key1: 1, key2: "un" })
    })

    it("should return the first row found based on a condition", async () => {
        const data = await simpleNodeDB.getFirstRow("data", {
            condition: `key2 = 'trois'`,
        })
        assert.deepStrictEqual(data, {
            key1: 3,
            key2: "trois",
        })
    })
})
