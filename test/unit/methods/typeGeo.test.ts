import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("typeGeo", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the geometry types in a new column", async () => {
        const table = sdb.newTable()
        await table.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await table.typeGeo("geom", "type")
        await table.selectColumns(["nameEnglish", "type"])
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { nameEnglish: "Newfoundland and Labrador", type: "MULTIPOLYGON" },
            { nameEnglish: "Prince Edward Island", type: "POLYGON" },
            { nameEnglish: "Nova Scotia", type: "POLYGON" },
            { nameEnglish: "New Brunswick", type: "POLYGON" },
            { nameEnglish: "Quebec", type: "MULTIPOLYGON" },
            { nameEnglish: "Ontario", type: "MULTIPOLYGON" },
            { nameEnglish: "Manitoba", type: "POLYGON" },
            { nameEnglish: "Saskatchewan", type: "POLYGON" },
            { nameEnglish: "Alberta", type: "POLYGON" },
            { nameEnglish: "British Columbia", type: "MULTIPOLYGON" },
            { nameEnglish: "Yukon", type: "POLYGON" },
            { nameEnglish: "Northwest Territories", type: "MULTIPOLYGON" },
            { nameEnglish: "Nunavut", type: "MULTIPOLYGON" },
        ])
    })
})
