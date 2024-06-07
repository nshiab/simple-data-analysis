import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("lower", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should lowercase strings in one column", async () => {
        const table = sdb.newTable()
        await table.loadArray([{ firstName: "NAEL", lastName: "SHIAB" }])

        await table.lower("firstName")

        const data = await table.getData()

        assert.deepStrictEqual(data, [{ firstName: "nael", lastName: "SHIAB" }])
    })
    it("should lowercase strings in two columns", async () => {
        const table = sdb.newTable()
        await table.loadArray([{ firstName: "NAEL", lastName: "SHIAB" }])

        await table.lower(["firstName", "lastName"])

        const data = await table.getData()

        assert.deepStrictEqual(data, [{ firstName: "nael", lastName: "shiab" }])
    })
})
