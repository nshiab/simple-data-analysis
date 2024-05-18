import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getWidth", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
        await sdb.loadData("employees", ["test/data/files/employees.json"])
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the number of columns", async () => {
        assert.deepStrictEqual(await sdb.getWidth("employees"), 6)
    })
})
