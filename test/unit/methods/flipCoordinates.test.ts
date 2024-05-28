import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("flipCoordinates", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should flip the coordinates", async () => {
        const table = sdb.newTable("geoData")
        await table.loadGeoData("test/geodata/files/point.json")
        await table.flipCoordinates("geom")
        const data = await table.customQuery(
            `SELECT ST_AsText(geom) as geomText FROM geoData;`,
            { returnDataFrom: "query" }
        )

        assert.deepStrictEqual(data, [
            { geomText: "POINT (45.51412791316409 -73.62315106245389)" },
        ])
    })
})
