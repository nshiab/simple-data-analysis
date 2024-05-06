import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"
import { existsSync, mkdirSync, readFileSync } from "fs"
const output = "./test/output/"

describe("points", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        if (!existsSync(output)) {
            mkdirSync(output)
        }
        simpleNodeDB = new SimpleNodeDB({ spatial: true, debug: true })
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should create points", async () => {
        await simpleNodeDB.loadGeoData(
            "geodata",
            "test/geodata/files/coordinates.csv"
        )
        await simpleNodeDB.convert("geodata", { lat: "double", lon: "double" })
        await simpleNodeDB.points("geodata", "lat", "lon", "geom")
        await simpleNodeDB.flipCoordinates("geodata", "geom")

        await simpleNodeDB.writeGeoData(
            "geodata",
            `${output}/pointsTest.geojson`
        )

        const data = JSON.parse(
            readFileSync(`${output}/pointsTest.geojson`, "utf-8")
        )

        console.log(data)

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
