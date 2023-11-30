import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("addColumn", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
        await simpleNodeDB.loadData("dataSummarize", [
            "test/data/files/dataSummarize.json",
        ])
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return a column with new computed values", async () => {
        await simpleNodeDB.addColumn(
            "dataSummarize",
            "multiply",
            "double",
            `key2 * key3`
        )

        const data = await simpleNodeDB.getData("dataSummarize")

        assert.deepStrictEqual(data, [
            { key1: "Rubarbe", key2: 1, key3: 10.5, multiply: 10.5 },
            { key1: "Fraise", key2: 11, key3: 2.345, multiply: 25.795 },
            { key1: "Rubarbe", key2: 2, key3: 4.5657, multiply: 9.1314 },
            { key1: "Fraise", key2: 22, key3: 12.3434, multiply: 271.5548 },
        ])
    })
})
