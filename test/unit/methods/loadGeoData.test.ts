import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("loadGeoData", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should load a geojson file", async () => {
        const table = sdb.newTable()
        await table.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )

        const types = await table.getTypes()

        assert.deepStrictEqual(types, {
            nameEnglish: "VARCHAR",
            nameFrench: "VARCHAR",
            geom: "GEOMETRY",
        })
    })
    it("should load a geojson file from a URL", async () => {
        const table = sdb.newTable()
        await table.loadGeoData(
            "https://raw.githubusercontent.com/nshiab/simple-data-analysis/main/test/geodata/files/CanadianProvincesAndTerritories.json"
        )

        const types = await table.getTypes()

        assert.deepStrictEqual(types, {
            nameEnglish: "VARCHAR",
            nameFrench: "VARCHAR",
            geom: "GEOMETRY",
        })
    })
    it("should load a shapefile file", async () => {
        const table = sdb.newTable()
        await table.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.shp.zip"
        )

        const types = await table.getTypes()

        assert.deepStrictEqual(types, {
            nameEnglis: "VARCHAR",
            nameFrench: "VARCHAR",
            geom: "GEOMETRY",
        })
    })
})
