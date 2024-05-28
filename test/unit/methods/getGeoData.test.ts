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

    it("should return geospatial data as a geojson", async () => {
        const table = sdb.newTable("geoData")
        await table.loadGeoData("test/geodata/files/polygons.geojson")
        const geoData = await table.getGeoData("geom")

        assert.deepStrictEqual(geoData, {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-80.59257436471684, 50.34475712255144],
                                [-81.46830362263165, 44.96388502050658],
                                [-75.09077319336622, 46.96898493017997],
                                [-75.56015128267195, 50.14747359410518],
                                [-80.59257436471684, 50.34475712255144],
                            ],
                        ],
                    },
                    properties: { name: "polygonA" },
                },
                {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-121.9581024428179, 62.01105774612549],
                                [-122.30178667612884, 56.046480093823135],
                                [-112.2459009294211, 51.56850436985184],
                                [-104.83848404963159, 51.43356573562798],
                                [-96.84201249303278, 53.44208011203946],
                                [-98.04910119595648, 62.4259071421684],
                                [-121.9581024428179, 62.01105774612549],
                            ],
                        ],
                    },
                    properties: { name: "polygonB" },
                },
            ],
        })
    })
})
