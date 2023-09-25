import assert from "assert"
import SimpleNodeDB from "../../../../../src/class/SimpleNodeDB.js"

describe("renameColumns", () => {
    const simpleNodeDB = new SimpleNodeDB().start()

    it("should change the name of the columns", async () => {
        await simpleNodeDB.loadData("dataJSON", ["test/data/files/data.json"])

        const data = await simpleNodeDB.renameColumns(
            "dataJSON",
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

    simpleNodeDB.done()
})
