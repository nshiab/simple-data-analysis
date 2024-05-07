import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"
import { existsSync, mkdirSync, readFileSync } from "fs"

describe("reproject", () => {
    const output = "./test/output/"

    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        if (!existsSync(output)) {
            mkdirSync(output)
        }
        simpleNodeDB = new SimpleNodeDB({ spatial: true })
        await simpleNodeDB.loadGeoData(
            "geodata",
            "test/geodata/files/point.json"
        )
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should convert from one projection to another one", async () => {
        await simpleNodeDB.reproject(
            "geodata",
            "geom",
            "EPSG:4326",
            "EPSG:3347"
        )

        await simpleNodeDB.reproject(
            "geodata",
            "geom",
            "EPSG:3347",
            "EPSG:4326"
        )

        await simpleNodeDB.writeGeoData(
            "geodata",
            `${output}points-reprojected.geojson`
        )

        const data = JSON.parse(
            readFileSync(`${output}points-reprojected.geojson`, "utf-8")
        )

        assert.deepStrictEqual(data, {
            type: "FeatureCollection",
            name: "points-reprojected",
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
