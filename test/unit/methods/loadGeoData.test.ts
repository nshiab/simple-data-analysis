import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("loadGeoData", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB({ spatial: true })
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should load geo data from a geojson file", async () => {
        await simpleNodeDB.loadGeoData(
            "geoJsonData",
            "test/geoData/files/CanadianProvincesAndTerritories.geojson"
        )

        const types = await simpleNodeDB.getTypes("geoJsonData")

        assert.deepStrictEqual(types, {
            nameEnglish: "VARCHAR",
            nameFrench: "VARCHAR",
            geom: "GEOMETRY",
        })
    })
})
