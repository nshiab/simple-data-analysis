import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("splitExtract", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should extract a substring based on a separator and substring", async () => {
        const table = sdb.newTable()
        await table.loadArray([
            { name: "Shiab, Nael" },
            { name: "Bruce, Graeme" },
        ])

        await table.splitExtract("name", ",", 0)

        const data = await table.getData()

        assert.deepStrictEqual(data, [{ name: "Shiab" }, { name: "Bruce" }])
    })
})
