import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("cloneColumn", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should clone a column", async () => {
        const table = await sdb.newTable("data")
        await table.loadArray([{ firstName: "nael", lastName: "shiab" }])

        await table.cloneColumn("firstName", "firstNameCloned")

        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { firstName: "nael", lastName: "shiab", firstNameCloned: "nael" },
        ])
    })
})
