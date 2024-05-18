import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("flipCoordinates", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB({ spatial: true })
        await sdb.loadGeoData("geodata", "test/geodata/files/point.json")
    })
    after(async function () {
        await sdb.done()
    })

    it("should flip the coordinates", async () => {
        await sdb.flipCoordinates("geodata", "geom")
        const data = await sdb.customQuery(
            `SELECT ST_AsText(geom) as geomText FROM geoData;`,
            { returnDataFrom: "query" }
        )

        assert.deepStrictEqual(data, [
            { geomText: "POINT (45.51412791316409 -73.62315106245389)" },
        ])
    })
})
