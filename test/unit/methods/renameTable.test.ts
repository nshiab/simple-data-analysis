import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("renameTable", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
        await sdb.loadData("cities", ["test/data/files/cities.csv"])
    })
    after(async function () {
        await sdb.done()
    })

    it("should rename a table", async () => {
        await sdb.renameTable("cities", "canadianCities")

        const data = await sdb.getData("canadianCities")

        assert.deepStrictEqual(data, [
            { id: 1108380, city: "VANCOUVER" },
            { id: 6158355, city: "TORONTO" },
            { id: 7024745, city: "MONTREAL" },
        ])
    })
})
