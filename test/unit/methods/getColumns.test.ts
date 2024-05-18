import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getColumns", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the columns of a table", async () => {
        await sdb.loadData("dataCsv", ["test/data/files/data.csv"])

        const columns = await sdb.getColumns("dataCsv")

        assert.deepStrictEqual(columns, ["key1", "key2"])
    })
})
