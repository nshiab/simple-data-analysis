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
        const table = await sdb.newTable("data")
        await table.loadArray([
            { first: "Nael", last: "Shiab" },
            { first: "Graeme", last: "Bruce" },
        ])
        await table.addRowNumber("rowNumber")

        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { first: "Nael", last: "Shiab", rowNumber: 1 },
            { first: "Graeme", last: "Bruce", rowNumber: 2 },
        ])
    })
})
