import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("loadGeoData", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB({ spatial: true })
    })
    after(async function () {
        await sdb.done()
    })

    it("should load a geojson file", async () => {
        await sdb.loadGeoData(
            "geoJsonData",
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )

        const types = await sdb.getTypes("geoJsonData")

        assert.deepStrictEqual(types, {
            nameEnglish: "VARCHAR",
            nameFrench: "VARCHAR",
            geom: "GEOMETRY",
        })
    })
    it("should load a geojson file from a URL", async () => {
        await sdb.loadGeoData(
            "geoJsonData",
            "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/CanadianProvincesAndTerritories.json"
        )

        const types = await sdb.getTypes("geoJsonData")

        assert.deepStrictEqual(types, {
            nameEnglish: "VARCHAR",
            nameFrench: "VARCHAR",
            geom: "GEOMETRY",
        })
    })
    it("should load a shapefile file", async () => {
        await sdb.loadGeoData(
            "shapefileData",
            "test/geodata/files/CanadianProvincesAndTerritories.shp.zip"
        )

        const types = await sdb.getTypes("shapefileData")

        assert.deepStrictEqual(types, {
            nameEnglis: "VARCHAR",
            nameFrench: "VARCHAR",
            geom: "GEOMETRY",
        })
    })
})
