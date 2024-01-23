import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("insertTables", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should add rows from a table into another table", async () => {
        await simpleNodeDB.loadData("dataJSON1", "test/data/files/data.json")
        await simpleNodeDB.loadData("dataJSON2", "test/data/files/data.json")

        await simpleNodeDB.insertTables("dataJSON1", "dataJSON2")
        const data = await simpleNodeDB.getData("dataJSON1")
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
    it("should add rows from multiple tables into another table", async () => {
        await simpleNodeDB.loadData(
            "dataJSON1Multiple",
            "test/data/files/data.json"
        )
        await simpleNodeDB.loadData(
            "dataJSON2Multiple",
            "test/data/files/data.json"
        )
        await simpleNodeDB.loadData(
            "dataJSON3Multiple",
            "test/data/files/data.json"
        )

        await simpleNodeDB.insertTables("dataJSON1Multiple", [
            "dataJSON2Multiple",
            "dataJSON3Multiple",
        ])
        const data = await simpleNodeDB.getData("dataJSON1Multiple")
        assert.deepStrictEqual(data, [
            { key1: 1, key2: "un" },
            { key1: 2, key2: "deux" },
            { key1: 3, key2: "trois" },
            { key1: 4, key2: "quatre" },
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
