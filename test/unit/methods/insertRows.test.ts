import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("insertRows", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("add rows in a table", async () => {
        await sdb.loadData("dataCsv", "test/data/files/data.json")

        await sdb.insertRows("dataCsv", [
            { key1: 5, key2: "cinq" },
            { key1: 6, key2: "six" },
        ])

        const data = await sdb.getData("dataCsv")

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
