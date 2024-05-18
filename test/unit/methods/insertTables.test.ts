import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("insertTables", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should add rows from a table into another table", async () => {
        await sdb.loadData("dataJSON1", "test/data/files/data.json")
        await sdb.loadData("dataJSON2", "test/data/files/data.json")

        await sdb.insertTables("dataJSON1", "dataJSON2")
        const data = await sdb.getData("dataJSON1")
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
        await sdb.loadData("dataJSON1Multiple", "test/data/files/data.json")
        await sdb.loadData("dataJSON2Multiple", "test/data/files/data.json")
        await sdb.loadData("dataJSON3Multiple", "test/data/files/data.json")

        await sdb.insertTables("dataJSON1Multiple", [
            "dataJSON2Multiple",
            "dataJSON3Multiple",
        ])
        const data = await sdb.getData("dataJSON1Multiple")
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
