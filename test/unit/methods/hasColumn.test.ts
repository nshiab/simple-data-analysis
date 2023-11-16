import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("hasColumn", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
        await simpleNodeDB.loadData("dataCsv", ["test/data/files/data.csv"])
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return true when the column is in the data", async () => {
        assert.deepStrictEqual(
            await simpleNodeDB.hasColumn("dataCsv", "key1"),
            true
        )
    })

    it("should return false when the column is not in the data", async () => {
        assert.deepStrictEqual(
            await simpleNodeDB.hasColumn("dataCsv", "keyX"),
            false
        )
    })
})
