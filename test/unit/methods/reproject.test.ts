import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("reproject", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should convert from one projection to another one", async () => {
        const table = sdb.newTable()
        await table.loadGeoData("test/geodata/files/point.json")
        await table.reproject("geom", "EPSG:4326", "EPSG:3347")

        await table.reproject("geom", "EPSG:3347", "EPSG:4326")

        const data = await table.getGeoData()

        assert.deepStrictEqual(data, {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "Point",
                        coordinates: [-73.623151062453886, 45.514127913164081],
                    },
                },
            ],
        })
    })
})
