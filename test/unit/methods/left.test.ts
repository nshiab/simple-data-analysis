import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("left", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the first two strings", async () => {
        const table = sdb.newTable()
        await table.loadArray([
            { firstName: "Nael", lastName: "Shiab" },
            { firstName: "Graeme", lastName: "Bruce" },
        ])

        await table.left("firstName", 2)

        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { firstName: "Na", lastName: "Shiab" },
            { firstName: "Gr", lastName: "Bruce" },
        ])
    })
})
