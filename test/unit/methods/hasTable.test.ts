import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("hasTable", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
        await sdb.loadData("employees", ["test/data/files/employees.json"])
    })
    after(async function () {
        await sdb.done()
    })

    it("should return true because the table is in the db", async () => {
        assert.deepStrictEqual(await sdb.hasTable("employees"), true)
    })
    it("should return false because the table is not in the db", async () => {
        assert.deepStrictEqual(await sdb.hasTable("donut"), false)
    })
})
