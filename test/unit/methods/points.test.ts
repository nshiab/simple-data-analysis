import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"
import { existsSync, mkdirSync, readFileSync } from "fs"
const output = "./test/output/"

describe("points", () => {
    let sdb: SimpleDB
    before(async function () {
        if (!existsSync(output)) {
            mkdirSync(output)
        }
        sdb = new SimpleDB({ spatial: true })
    })
    after(async function () {
        await sdb.done()
    })

    it("should create points", async () => {
        await sdb.loadGeoData("geodata", "test/geodata/files/coordinates.csv")
        await sdb.convert("geodata", { lat: "double", lon: "double" })
        await sdb.points("geodata", "lat", "lon", "geom")
        await sdb.flipCoordinates("geodata", "geom")

        await sdb.writeGeoData("geodata", `${output}/pointsTest.geojson`)

        const data = JSON.parse(
            readFileSync(`${output}/pointsTest.geojson`, "utf-8")
        )

        assert.deepStrictEqual(data, {
            type: "FeatureCollection",
            name: "pointsTest",
            features: [
                {
                    type: "Feature",
                    properties: { name: "montreal", lat: 43.77, lon: -79.29 },
                    geometry: { type: "Point", coordinates: [-79.29, 43.77] },
                },
                {
                    type: "Feature",
                    properties: { name: "toronto", lat: 45.35, lon: -73.86 },
                    geometry: { type: "Point", coordinates: [-73.86, 45.35] },
                },
                {
                    type: "Feature",
                    properties: { name: "vancouver", lat: 49.07, lon: -122.96 },
                    geometry: { type: "Point", coordinates: [-122.96, 49.07] },
                },
            ],
        })
    })
})
