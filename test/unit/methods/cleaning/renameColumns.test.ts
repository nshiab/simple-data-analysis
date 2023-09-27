import assert from "assert"
import SimpleNodeDB from "../../../../src/class/SimpleNodeDB.js"

describe("renameColumns", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should change the name of one column", async () => {
        await simpleNodeDB.loadData("dataJSONOneColumn", [
            "test/data/files/data.json",
        ])

        const data = await simpleNodeDB.renameColumns(
            "dataJSONOneColumn",
            ["key1"],
            ["A"],
            { returnDataFrom: "table" }
        )

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

        const data = await simpleNodeDB.renameColumns(
            "dataJSONMultipleColumns",
            ["key1", "key2"],
            ["A", "B"],
            { returnDataFrom: "table" }
        )

        assert.deepStrictEqual(data, [
            { A: 1, B: "un" },
            { A: 2, B: "deux" },
            { A: 3, B: "trois" },
            { A: 4, B: "quatre" },
        ])
    })
})
