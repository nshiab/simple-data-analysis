import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getTypes", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the types of a table", async () => {
        await sdb.loadData("dataCsv", ["test/data/files/data.csv"])

        const types = await sdb.getTypes("dataCsv")

        assert.deepStrictEqual(types, { key1: "VARCHAR", key2: "VARCHAR" })
    })
})
