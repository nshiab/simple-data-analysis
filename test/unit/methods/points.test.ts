import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("points", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should create points", async () => {
        const table = sdb.newTable()
        await table.loadData("test/geodata/files/coordinates.csv")
        await table.convert({ lat: "double", lon: "double" })
        await table.points("lat", "lon", "geom")

        const data = await table.getGeoData("geom")

        assert.deepStrictEqual(data, {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: { type: "Point", coordinates: [-79.29, 43.77] },
                    properties: { name: "montreal", lat: 43.77, lon: -79.29 },
                },
                {
                    type: "Feature",
                    geometry: { type: "Point", coordinates: [-73.86, 45.35] },
                    properties: { name: "toronto", lat: 45.35, lon: -73.86 },
                },
                {
                    type: "Feature",
                    geometry: { type: "Point", coordinates: [-122.96, 49.07] },
                    properties: { name: "vancouver", lat: 49.07, lon: -122.96 },
                },
            ],
        })
    })
})
