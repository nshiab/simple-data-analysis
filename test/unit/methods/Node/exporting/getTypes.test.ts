import assert from "assert"
import SimpleNodeDB from "../../../../../src/class/SimpleNodeDB.js"

describe("getTypes", () => {
    const simpleNodeDB = new SimpleNodeDB().start()

    it("should return the types of a table", async () => {
        await simpleNodeDB.loadData("dataCsv", ["test/data/files/data.csv"])

        const types = await simpleNodeDB.getTypes("dataCsv")

        assert.deepStrictEqual(types, { key1: "VARCHAR", key2: "VARCHAR" })
    })

    simpleNodeDB.done()
})
