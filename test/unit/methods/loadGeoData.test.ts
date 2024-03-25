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

    it("should load a geojson file", async () => {
        await simpleNodeDB.loadGeoData(
            "geoJsonData",
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )

        const types = await simpleNodeDB.getTypes("geoJsonData")

        assert.deepStrictEqual(types, {
            nameEnglish: "VARCHAR",
            nameFrench: "VARCHAR",
            geom: "GEOMETRY",
        })
    })
    it("should load a shapefile file", async () => {
        await simpleNodeDB.loadGeoData(
            "shapefileData",
            "test/geodata/files/CanadianProvincesAndTerritories.shp.zip"
        )

        const types = await simpleNodeDB.getTypes("shapefileData")

        assert.deepStrictEqual(types, {
            nameEnglis: "VARCHAR",
            nameFrench: "VARCHAR",
            geom: "GEOMETRY",
        })
    })
})
