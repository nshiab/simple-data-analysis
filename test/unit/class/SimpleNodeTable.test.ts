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

    simpleNodeDB.done()
})
