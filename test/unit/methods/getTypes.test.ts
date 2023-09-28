import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("getTypes", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the types of a table", async () => {
        await simpleNodeDB.loadData("dataCsv", ["test/data/files/data.csv"])

        const types = await simpleNodeDB.getTypes("dataCsv")

        assert.deepStrictEqual(types, { key1: "VARCHAR", key2: "VARCHAR" })
    })
})
