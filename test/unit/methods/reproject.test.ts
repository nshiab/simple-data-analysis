import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"
import { existsSync, mkdirSync, readFileSync } from "fs"

describe("reproject", () => {
    const output = "./test/output/"

    let sdb: SimpleDB
    before(async function () {
        if (!existsSync(output)) {
            mkdirSync(output)
        }
        sdb = new SimpleDB({ spatial: true })
        await sdb.loadGeoData("geodata", "test/geodata/files/point.json")
    })
    after(async function () {
        await sdb.done()
    })

    it("should convert from one projection to another one", async () => {
        await sdb.reproject("geodata", "geom", "EPSG:4326", "EPSG:3347")

        await sdb.reproject("geodata", "geom", "EPSG:3347", "EPSG:4326")

        await sdb.writeGeoData("geodata", `${output}points-reprojected.geojson`)

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
