import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("latLon", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should extract the lat and lon of points", async () => {
        const table = sdb.newTable()
        await table.loadGeoData("test/geodata/files/pointsInside.json")
        await table.latLon("geom", "lat", "lon")
        await table.removeColumns("geom")

        const data = await table.getData()

        assert.deepStrictEqual(data, [
            {
                name: "pointA",
                lat: 48.241182892559266,
                lon: -76.34553248992202,
            },
            { name: "pointB", lat: 50.15023361660323, lon: -73.18043031919933 },
            { name: "pointC", lat: 48.47150751404138, lon: -72.78960434234926 },
            { name: "pointD", lat: 47.43075362784262, lon: -72.2926406368759 },
        ])
    })
})
