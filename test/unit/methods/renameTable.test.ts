import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("renameTable", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should rename a table", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/cities.csv"])
        await table.renameTable("canadianCities")

        const tables = await sdb.getTables()

        assert.deepStrictEqual(tables, ["canadianCities"])
    })
})
