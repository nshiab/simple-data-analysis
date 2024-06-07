import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("getGeoData", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should find the column with geometries and return geospatial data as a geojson", async () => {
        const table = sdb.newTable("geoData")
        await table.loadGeoData("test/geodata/files/polygons.geojson")
        await table.renameColumns({ geom: "newGeom" })
        const geoData = await table.getGeoData()

        assert.deepStrictEqual(geoData, {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    properties: { name: "polygonA" },
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-80.5925744, 50.3447571],
                                [-81.4683036, 44.963885],
                                [-75.0907732, 46.9689849],
                                [-75.5601513, 50.1474736],
                                [-80.5925744, 50.3447571],
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
                                [-121.9581024, 62.0110577],
                                [-122.3017867, 56.0464801],
                                [-112.2459009, 51.5685044],
                                [-104.838484, 51.4335657],
                                [-96.8420125, 53.4420801],
                                [-98.0491012, 62.4259071],
                                [-121.9581024, 62.0110577],
                            ],
                        ],
                    },
                },
            ],
        })
    })
    it("should return geospatial data as a geojson with a specific geometry column", async () => {
        const table = sdb.newTable("geoData")
        await table.loadGeoData("test/geodata/files/polygons.geojson")
        await table.renameColumns({ geom: "newGeom" })
        const geoData = await table.getGeoData("newGeom")

        assert.deepStrictEqual(geoData, {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    properties: { name: "polygonA" },
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-80.5925744, 50.3447571],
                                [-81.4683036, 44.963885],
                                [-75.0907732, 46.9689849],
                                [-75.5601513, 50.1474736],
                                [-80.5925744, 50.3447571],
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
                                [-121.9581024, 62.0110577],
                                [-122.3017867, 56.0464801],
                                [-112.2459009, 51.5685044],
                                [-104.838484, 51.4335657],
                                [-96.8420125, 53.4420801],
                                [-98.0491012, 62.4259071],
                                [-121.9581024, 62.0110577],
                            ],
                        ],
                    },
                },
            ],
        })
    })
})
