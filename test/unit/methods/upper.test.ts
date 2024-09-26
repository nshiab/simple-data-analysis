import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("upper", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should uppercase strings in one column", async () => {
        const table = sdb.newTable()
        await table.loadArray([{ firstName: "nael", lastName: "shiab" }])

        await table.upper("firstName")

        const data = await table.getData()

        assert.deepStrictEqual(data, [{ firstName: "NAEL", lastName: "shiab" }])
    })
    it("should uppercase strings in two columns", async () => {
        const table = sdb.newTable()
        await table.loadArray([{ firstName: "nael", lastName: "shiab" }])

        await table.upper(["firstName", "lastName"])

        const data = await table.getData()

        assert.deepStrictEqual(data, [{ firstName: "NAEL", lastName: "SHIAB" }])
    })
    it("should uppercase strings in two columns with column names containing spaces", async () => {
        const table = sdb.newTable()
        await table.loadArray([{ "first Name": "nael", "last Name": "shiab" }])

        await table.upper(["first Name", "last Name"])

        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { "first Name": "NAEL", "last Name": "SHIAB" },
        ])
    })
})
