import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"
import SimpleTable from "../../../src/class/SimpleTable.js"

describe("SimpleTable", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })
    it("should create a new SimpleTable", async () => {
        const table = await sdb.newTable("data")
        assert.deepStrictEqual(table instanceof SimpleTable, true)
    })
    it("should create a new SimpleTable with types", async () => {
        const table = await sdb.newTable("data", {
            types: { name: "string", age: "number" },
        })
        const tables = await sdb.getTables()
        assert.deepStrictEqual(
            table instanceof SimpleTable && tables.includes("data"),
            true
        )
    })
})
