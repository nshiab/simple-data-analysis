import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("reducePrecision", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should round the coordinates to 3 decimals", async () => {
        const table = sdb.newTable("geoData")
        await table.loadGeoData("test/geodata/files/point.json")
        await table.reducePrecision(3)
        const data = await sdb.customQuery(
            `SELECT ST_AsText(geom) as geomText FROM geoData;`,
            { returnDataFrom: "query" }
        )
        assert.deepStrictEqual(data, [{ geomText: "POINT (-73.623 45.514)" }])
    })
    it("should round the coordinates to 3 decimals from a specific column", async () => {
        const table = sdb.newTable("geoData")
        await table.loadGeoData("test/geodata/files/point.json")
        await table.reducePrecision(3, { column: "geom" })
        const data = await sdb.customQuery(
            `SELECT ST_AsText(geom) as geomText FROM geoData;`,
            { returnDataFrom: "query" }
        )
        assert.deepStrictEqual(data, [{ geomText: "POINT (-73.623 45.514)" }])
    })
})
