import assert from "assert"
import SimpleNodeDB from "../../../../../src/class/SimpleNodeDB.js"

describe("loadData", () => {
    const simpleNodeDB = new SimpleNodeDB().start()

    it("should return the columns of a table", async () => {
        await simpleNodeDB.loadData("dataCsv", ["test/data/files/data.csv"])

        const columns = await simpleNodeDB.getColumns("dataCsv")

        assert.deepStrictEqual(columns, ["key1", "key2"])
    })

    simpleNodeDB.done()
})
