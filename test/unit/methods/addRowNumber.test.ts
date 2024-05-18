import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("addRowNumber", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return a column with the row number", async () => {
        await sdb.loadArray("data", [
            { first: "Nael", last: "Shiab" },
            { first: "Graeme", last: "Bruce" },
        ])
        await sdb.addRowNumber("data", "rowNumber")

        const data = await sdb.getData("data")

        assert.deepStrictEqual(data, [
            { first: "Nael", last: "Shiab", rowNumber: 1 },
            { first: "Graeme", last: "Bruce", rowNumber: 2 },
        ])
    })
})
