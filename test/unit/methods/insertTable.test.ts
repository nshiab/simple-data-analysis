import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("insertTable", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should add rows from a table into another table", async () => {
        await simpleNodeDB.loadData("dataJSON1", "test/data/files/data.json")
        await simpleNodeDB.loadData("dataJSON2", "test/data/files/data.json")

        const data = await simpleNodeDB.insertTable("dataJSON1", "dataJSON2", {
            returnDataFrom: "table",
        })

        assert.deepStrictEqual(data, [
            { key1: 1, key2: "un" },
            { key1: 2, key2: "deux" },
            { key1: 3, key2: "trois" },
            { key1: 4, key2: "quatre" },
            { key1: 1, key2: "un" },
            { key1: 2, key2: "deux" },
            { key1: 3, key2: "trois" },
            { key1: 4, key2: "quatre" },
        ])
    })
})
