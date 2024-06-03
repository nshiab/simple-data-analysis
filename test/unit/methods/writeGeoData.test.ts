import { existsSync, mkdirSync, readFileSync } from "fs"
import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("writeGeoData", () => {
    const output = "./test/output/"

    let sdb: SimpleDB
    before(async function () {
        if (!existsSync(output)) {
            mkdirSync(output)
        }
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should write geojson file", async () => {
        const originalFile = "test/geodata/files/polygons.geojson"

        const table = sdb.newTable()
        await table.loadGeoData(originalFile)
        await table.writeGeoData(`${output}data.geojson`)

        const originalData = JSON.parse(readFileSync(originalFile, "utf-8"))
        const writtenData = JSON.parse(
            readFileSync(`${output}data.geojson`, "utf-8")
        )

        assert.deepStrictEqual(writtenData, originalData)
    })
    it("should write geojson file that has been converted to WGS84", async () => {
        const originalFile = "test/geodata/files/polygons.geojson"

        const table = sdb.newTable()
        await table.loadGeoData(originalFile, { toWGS84: true })
        await table.writeGeoData(`${output}dataWithOptionsToWGS84.geojson`)

        const originalData = JSON.parse(readFileSync(originalFile, "utf-8"))
        const writtenData = JSON.parse(
            readFileSync(`${output}dataWithOptionsToWGS84.geojson`, "utf-8")
        )

        assert.deepStrictEqual(writtenData, originalData)
    })

    it("should write geojson file with coordinates rounded to 3 decimals", async () => {
        const originalFile = "test/geodata/files/polygons.geojson"

        const table = sdb.newTable()
        await table.loadGeoData(originalFile)
        await table.writeGeoData(`${output}dataPrecision.geojson`, {
            precision: 3,
        })

        const writtenData = JSON.parse(
            readFileSync(`${output}dataPrecision.geojson`, "utf-8")
        )

        assert.deepStrictEqual(writtenData, {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    properties: { name: "polygonA" },
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-80.593, 50.345],
                                [-81.468, 44.964],
                                [-75.091, 46.969],
                                [-75.56, 50.147],
                                [-80.593, 50.345],
                            ],
                        ],
                    },
                },
                {
                    type: "Feature",
                    properties: { name: "polygonB" },
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-121.958, 62.011],
                                [-122.302, 56.046],
                                [-112.246, 51.569],
                                [-104.838, 51.434],
                                [-96.842, 53.442],
                                [-98.049, 62.426],
                                [-121.958, 62.011],
                            ],
                        ],
                    },
                },
            ],
        })
    })
})
