import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("fixGeo", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should fix invalid geometries", async () => {
        // From https://github.com/chrieke/geojson-invalid-geometry
        const table = sdb.newTable("geodata")
        await table.loadGeoData("test/geodata/files/invalid.geojson")
        await table.fixGeo()
        const data = await table.getGeoData()

        assert.deepStrictEqual(data, {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: "MultiPolygon",
                        coordinates: [
                            [
                                [
                                    [13.382096, 52.514797],
                                    [13.382288, 52.515426],
                                    [13.382609404455074, 52.51544412917958],
                                    [13.382603, 52.514954],
                                    [13.383127, 52.514867],
                                    [13.383144, 52.515321],
                                    [13.383060641522562, 52.5154695817136],
                                    [13.383529, 52.515496],
                                    [13.383424, 52.51464],
                                    [13.382096, 52.514797],
                                ],
                            ],
                            [
                                [
                                    [13.38262, 52.516255],
                                    [13.383060641522562, 52.5154695817136],
                                    [13.382609404455074, 52.51544412917958],
                                    [13.38262, 52.516255],
                                ],
                            ],
                        ],
                    },
                    properties: {},
                },
            ],
        })
    })
    it("should fix invalid geometries in a specific column", async () => {
        // From https://github.com/chrieke/geojson-invalid-geometry
        const table = sdb.newTable("geodata")
        await table.loadGeoData("test/geodata/files/invalid.geojson")
        await table.fixGeo("geom")
        const data = await table.getGeoData()

        assert.deepStrictEqual(data, {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: "MultiPolygon",
                        coordinates: [
                            [
                                [
                                    [13.382096, 52.514797],
                                    [13.382288, 52.515426],
                                    [13.382609404455074, 52.51544412917958],
                                    [13.382603, 52.514954],
                                    [13.383127, 52.514867],
                                    [13.383144, 52.515321],
                                    [13.383060641522562, 52.5154695817136],
                                    [13.383529, 52.515496],
                                    [13.383424, 52.51464],
                                    [13.382096, 52.514797],
                                ],
                            ],
                            [
                                [
                                    [13.38262, 52.516255],
                                    [13.383060641522562, 52.5154695817136],
                                    [13.382609404455074, 52.51544412917958],
                                    [13.38262, 52.516255],
                                ],
                            ],
                        ],
                    },
                    properties: {},
                },
            ],
        })
    })
    it("should flag fixed geo as valid", async () => {
        // From https://github.com/chrieke/geojson-invalid-geometry
        const table = sdb.newTable("geodata")
        await table.loadGeoData("test/geodata/files/invalid.geojson")
        await table.fixGeo()
        await table.isValidGeo("isValid")
        await table.selectColumns("isValid")
        const data = await table.getData()

        assert.deepStrictEqual(data, [{ isValid: true }])
    })
})
