import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("renameTable", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
        await simpleNodeDB.loadData("cities", ["test/data/files/cities.csv"])
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should rename a table", async () => {
        await simpleNodeDB.renameTable("cities", "canadianCities")

        const data = await simpleNodeDB.getData("canadianCities")

        assert.deepStrictEqual(data, [
            { id: 1108380, city: "VANCOUVER" },
            { id: 6158355, city: "TORONTO" },
            { id: 7024745, city: "MONTREAL" },
        ])
    })
})
