import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("getValues", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the values of a column", async () => {
        await simpleNodeDB.loadData("dataCsv", ["test/data/files/data.csv"])

        const values = await simpleNodeDB.getValues("dataCsv", "key1")

        assert.deepStrictEqual(values, ["1", "3", "8", "brioche"])
    })
})
