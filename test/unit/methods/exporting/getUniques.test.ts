import assert from "assert"
import SimpleNodeDB from "../../../../src/class/SimpleNodeDB.js"

describe("getUniques", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the unique values of a column", async () => {
        await simpleNodeDB.loadData("dataDuplicatesCsv", [
            "test/data/files/dataDuplicates.csv",
        ])

        const uniques = await simpleNodeDB.getUniques(
            "dataDuplicatesCsv",
            "key1"
        )

        assert.deepStrictEqual(uniques, ["1", "3", "8", "brioche"])
    })
})
