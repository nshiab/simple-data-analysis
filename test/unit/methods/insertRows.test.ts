import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("insertRows", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("add rows in a table", async () => {
        await simpleNodeDB.loadData("dataCsv", "test/data/files/data.json")

        await simpleNodeDB.insertRows("dataCsv", [
            { key1: 5, key2: "cinq" },
            { key1: 6, key2: "six" },
        ])

        const data = await simpleNodeDB.getData("dataCsv")

        assert.deepStrictEqual(data, [
            { key1: 1, key2: "un" },
            { key1: 2, key2: "deux" },
            { key1: 3, key2: "trois" },
            { key1: 4, key2: "quatre" },
            { key1: 5, key2: "cinq" },
            { key1: 6, key2: "six" },
        ])
    })
})
