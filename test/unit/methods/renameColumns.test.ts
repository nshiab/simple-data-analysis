import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("renameColumns", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should change the name of one column", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/data.json"])

        await table.renameColumns({
            key1: "A",
        })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { A: 1, key2: "un" },
            { A: 2, key2: "deux" },
            { A: 3, key2: "trois" },
            { A: 4, key2: "quatre" },
        ])
    })

    it("should change the name of multiple columns", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/data.json"])

        await table.renameColumns({
            key1: "A",
            key2: "B",
        })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { A: 1, B: "un" },
            { A: 2, B: "deux" },
            { A: 3, B: "trois" },
            { A: 4, B: "quatre" },
        ])
    })
})
