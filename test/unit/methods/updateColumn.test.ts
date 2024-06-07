import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("updateColumn", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should update a column", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/cities.csv"])
        await table.updateColumn("city", `left("city", 3)`)

        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { id: 1108380, city: "VAN" },
            { id: 6158355, city: "TOR" },
            { id: 7024745, city: "MON" },
        ])
    })
})
