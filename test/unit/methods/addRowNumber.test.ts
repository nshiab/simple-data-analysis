import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("addRowNumber", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return a column with the row number", async () => {
        await simpleNodeDB.loadArray("data", [
            { first: "Nael", last: "Shiab" },
            { first: "Graeme", last: "Bruce" },
        ])
        await simpleNodeDB.addRowNumber("data", "rowNumber")

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [
            { first: "Nael", last: "Shiab", rowNumber: 1 },
            { first: "Graeme", last: "Bruce", rowNumber: 2 },
        ])
    })
})
