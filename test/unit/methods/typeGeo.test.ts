import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("typeGeo", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB({ spatial: true })
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the geometry types in a new column", async () => {
        await simpleNodeDB.loadGeoData(
            "geodata",
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await simpleNodeDB.typeGeo("geodata", "geom", "type")
        await simpleNodeDB.selectColumns("geodata", ["nameEnglish", "type"])
        const data = await simpleNodeDB.getData("geodata")

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
