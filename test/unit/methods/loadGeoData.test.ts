import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"
import SimpleTable from "../../../src/class/SimpleTable.js"

describe("loadGeoData", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should load a geojson file and return the table", async () => {
        const table = await sdb
            .newTable()
            .loadGeoData(
                "test/geodata/files/CanadianProvincesAndTerritories.json"
            )

        assert.deepStrictEqual(table instanceof SimpleTable, true)
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
    it("should load a geojson file and convert it to WGS84", async () => {
        const table = sdb.newTable()
        await table.loadGeoData("test/geodata/files/point.json", {
            toWGS84: true,
        })
        await table.latLon("geom", "lat", "lon")
        await table.selectColumns(["lat", "lon"])

        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { lat: 45.51412791316409, lon: -73.62315106245389 },
        ])
    })
})
