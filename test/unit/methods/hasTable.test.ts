import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("hasTable", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
        await simpleNodeDB.loadData("employees", [
            "test/data/files/employees.json",
        ])
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return true because the table is in the db", async () => {
        assert.deepStrictEqual(await simpleNodeDB.hasTable("employees"), true)
    })
    it("should return false because the table is not in the db", async () => {
        assert.deepStrictEqual(await simpleNodeDB.hasTable("donut"), false)
    })
})
