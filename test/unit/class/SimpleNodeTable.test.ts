import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"
import SimpleNodeTable from "../../../src/class/SimpleNodeTable.js"

describe("SimpleNodeTable", () => {
    const simpleNodeDB = new SimpleNodeDB().start()

    it("should return the instance of SimpleNodeTable", async () => {
        await simpleNodeDB.loadData("csv", ["test/data/files/data.csv"])
        const simpleNodeTable = simpleNodeDB.getTable("csv")
        assert.deepStrictEqual(simpleNodeTable instanceof SimpleNodeTable, true)
    })
    it("should return the data of the table", async () => {
        const simpleNodeTable = simpleNodeDB.getTable("csv")
        const data = await simpleNodeTable.getData()
        assert.deepStrictEqual(data, [
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
            { key1: "brioche", key2: "croissant" },
        ])
    })

    simpleNodeDB.done()
})
