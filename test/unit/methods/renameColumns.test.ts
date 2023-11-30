import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("renameColumns", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should change the name of one column", async () => {
        await simpleNodeDB.loadData("dataJSONOneColumn", [
            "test/data/files/data.json",
        ])

        await simpleNodeDB.renameColumns("dataJSONOneColumn", {
            key1: "A",
        })
        const data = await simpleNodeDB.getData("dataJSONOneColumn")

        assert.deepStrictEqual(data, [
            { A: 1, key2: "un" },
            { A: 2, key2: "deux" },
            { A: 3, key2: "trois" },
            { A: 4, key2: "quatre" },
        ])
    })

    it("should change the name of multiple columns", async () => {
        await simpleNodeDB.loadData("dataJSONMultipleColumns", [
            "test/data/files/data.json",
        ])

        await simpleNodeDB.renameColumns("dataJSONMultipleColumns", {
            key1: "A",
            key2: "B",
        })
        const data = await simpleNodeDB.getData("dataJSONMultipleColumns")

        assert.deepStrictEqual(data, [
            { A: 1, B: "un" },
            { A: 2, B: "deux" },
            { A: 3, B: "trois" },
            { A: 4, B: "quatre" },
        ])
    })
})
