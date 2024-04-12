import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("latLon", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB({ spatial: true })
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should extract the lat and lon of points", async () => {
        await simpleNodeDB.loadGeoData(
            "points",
            "test/geodata/files/pointsInside.json"
        )
        await simpleNodeDB.latLon("points", "geom", ["lat", "lon"])
        await simpleNodeDB.removeColumns("points", "geom")

        const data = await simpleNodeDB.getData("points")

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
