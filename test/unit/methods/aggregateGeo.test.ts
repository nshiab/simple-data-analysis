import assert from "assert"
import { existsSync, mkdirSync } from "fs"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("aggregateGeo", () => {
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

    it("should do an union of all geometries and overwrite the table", async () => {
        const table = sdb.newTable("geodata")
        await table.loadGeoData("test/geodata/files/polygonsGroups.json")
        await table.aggregateGeo("union")

        const data = await table.getGeoData("geom")

        assert.deepStrictEqual(data, {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-82.83893567445328, 50.62640104969924],
                                [-84.42488724739361, 44.568200476215395],
                                [-80.41235394219134, 43.43544164915107],
                                [-81.90936810407574, 41.7832801769253],
                                [-76.54154303811467, 39.25827938796405],
                                [-74.0185899104202, 41.67609329308551],
                                [-71.30309021987173, 39.18549421953887],
                                [-66.37632383108026, 38.66006974362426],
                                [-65.25312249560916, 44.318971411012456],
                                [-66.73687547327239, 44.853788962049634],
                                [-64.09300368099305, 47.82512483484163],
                                [-72.87692566862715, 52.492872979444854],
                                [-77.56963960950426, 49.48976039820121],
                                [-77.46330450485964, 48.96271632192344],
                                [-82.83893567445328, 50.62640104969924],
                            ],
                        ],
                    },
                    properties: {},
                },
            ],
        })
    })
    it("should do an union of all geometries from a specific column and overwrite the table", async () => {
        const table = sdb.newTable("geodata")
        await table.loadGeoData("test/geodata/files/polygonsGroups.json")
        await table.aggregateGeo("union", { column: "geom" })

        const data = await table.getGeoData("geom")

        assert.deepStrictEqual(data, {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-82.83893567445328, 50.62640104969924],
                                [-84.42488724739361, 44.568200476215395],
                                [-80.41235394219134, 43.43544164915107],
                                [-81.90936810407574, 41.7832801769253],
                                [-76.54154303811467, 39.25827938796405],
                                [-74.0185899104202, 41.67609329308551],
                                [-71.30309021987173, 39.18549421953887],
                                [-66.37632383108026, 38.66006974362426],
                                [-65.25312249560916, 44.318971411012456],
                                [-66.73687547327239, 44.853788962049634],
                                [-64.09300368099305, 47.82512483484163],
                                [-72.87692566862715, 52.492872979444854],
                                [-77.56963960950426, 49.48976039820121],
                                [-77.46330450485964, 48.96271632192344],
                                [-82.83893567445328, 50.62640104969924],
                            ],
                        ],
                    },
                    properties: {},
                },
            ],
        })
    })
    it("should do an union of all geometries and return the results in a new table", async () => {
        const table = sdb.newTable("geodata")
        await table.loadGeoData("test/geodata/files/polygonsGroups.json")
        const newTable = await table.aggregateGeo("union", {
            outputTable: true,
        })

        const data = await newTable.getGeoData("geom")

        assert.deepStrictEqual(data, {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-82.83893567445328, 50.62640104969924],
                                [-84.42488724739361, 44.568200476215395],
                                [-80.41235394219134, 43.43544164915107],
                                [-81.90936810407574, 41.7832801769253],
                                [-76.54154303811467, 39.25827938796405],
                                [-74.0185899104202, 41.67609329308551],
                                [-71.30309021987173, 39.18549421953887],
                                [-66.37632383108026, 38.66006974362426],
                                [-65.25312249560916, 44.318971411012456],
                                [-66.73687547327239, 44.853788962049634],
                                [-64.09300368099305, 47.82512483484163],
                                [-72.87692566862715, 52.492872979444854],
                                [-77.56963960950426, 49.48976039820121],
                                [-77.46330450485964, 48.96271632192344],
                                [-82.83893567445328, 50.62640104969924],
                            ],
                        ],
                    },
                    properties: {},
                },
            ],
        })
    })
    it("should do an union of all geometries and return the results in a new table with a specific name in the DB", async () => {
        const table = sdb.newTable("geodata")
        await table.loadGeoData("test/geodata/files/polygonsGroups.json")
        const newTable = await table.aggregateGeo("union", {
            outputTable: "specificTable",
        })

        const data = await newTable.getGeoData("geom")

        assert.deepStrictEqual(data, {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-82.83893567445328, 50.62640104969924],
                                [-84.42488724739361, 44.568200476215395],
                                [-80.41235394219134, 43.43544164915107],
                                [-81.90936810407574, 41.7832801769253],
                                [-76.54154303811467, 39.25827938796405],
                                [-74.0185899104202, 41.67609329308551],
                                [-71.30309021987173, 39.18549421953887],
                                [-66.37632383108026, 38.66006974362426],
                                [-65.25312249560916, 44.318971411012456],
                                [-66.73687547327239, 44.853788962049634],
                                [-64.09300368099305, 47.82512483484163],
                                [-72.87692566862715, 52.492872979444854],
                                [-77.56963960950426, 49.48976039820121],
                                [-77.46330450485964, 48.96271632192344],
                                [-82.83893567445328, 50.62640104969924],
                            ],
                        ],
                    },
                    properties: {},
                },
            ],
        })
    })
    it("should do an union of geometries based on categories", async () => {
        const table = sdb.newTable("geoCategories")
        await table.loadGeoData("test/geodata/files/polygonsGroups.json")
        await table.aggregateGeo("union", {
            categories: "groups",
        })
        const data = await table.getGeoData("geom")

        assert.deepStrictEqual(data, {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-77.56963960950426, 49.48976039820121],
                                [-77.46330450485964, 48.96271632192344],
                                [-82.83893567445328, 50.62640104969924],
                                [-84.42488724739361, 44.568200476215395],
                                [-76.43367458579074, 42.312239966269544],
                                [-75.86062003122073, 44.537223459668695],
                                [-68.00427901202615, 43.429407639551414],
                                [-64.09300368099305, 47.82512483484163],
                                [-72.87692566862715, 52.492872979444854],
                                [-77.56963960950426, 49.48976039820121],
                            ],
                        ],
                    },
                    properties: { groups: "A" },
                },
                {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-70.79752409112032, 46.317446445548114],
                                [-72.67730706669975, 45.29202451317114],
                                [-73.31482829407085, 46.422116081922724],
                                [-78.66686680022147, 45.361827303778455],
                                [-81.90936810407574, 41.7832801769253],
                                [-76.54154303811467, 39.25827938796405],
                                [-74.0185899104202, 41.67609329308551],
                                [-71.30309021987173, 39.18549421953887],
                                [-66.37632383108026, 38.66006974362426],
                                [-65.25312249560916, 44.318971411012456],
                                [-70.79752409112032, 46.317446445548114],
                            ],
                        ],
                    },
                    properties: { groups: "B" },
                },
            ],
        })
    })
    it("should do an union of geometries based on categories and return the results in a new table", async () => {
        const table = sdb.newTable("geoCategoriesAndNewTable")
        await table.loadGeoData("test/geodata/files/polygonsGroups.json")
        const newTable = await table.aggregateGeo("union", {
            categories: "groups",
            outputTable: true,
        })

        const data = await newTable.getGeoData("geom")

        assert.deepStrictEqual(data, {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-77.56963960950426, 49.48976039820121],
                                [-77.46330450485964, 48.96271632192344],
                                [-82.83893567445328, 50.62640104969924],
                                [-84.42488724739361, 44.568200476215395],
                                [-76.43367458579074, 42.312239966269544],
                                [-75.86062003122073, 44.537223459668695],
                                [-68.00427901202615, 43.429407639551414],
                                [-64.09300368099305, 47.82512483484163],
                                [-72.87692566862715, 52.492872979444854],
                                [-77.56963960950426, 49.48976039820121],
                            ],
                        ],
                    },
                    properties: { groups: "A" },
                },
                {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-70.79752409112032, 46.317446445548114],
                                [-72.67730706669975, 45.29202451317114],
                                [-73.31482829407085, 46.422116081922724],
                                [-78.66686680022147, 45.361827303778455],
                                [-81.90936810407574, 41.7832801769253],
                                [-76.54154303811467, 39.25827938796405],
                                [-74.0185899104202, 41.67609329308551],
                                [-71.30309021987173, 39.18549421953887],
                                [-66.37632383108026, 38.66006974362426],
                                [-65.25312249560916, 44.318971411012456],
                                [-70.79752409112032, 46.317446445548114],
                            ],
                        ],
                    },
                    properties: { groups: "B" },
                },
            ],
        })
    })
    it("should do an intersection of geometries based on categories and return the results in a new table", async () => {
        const table = sdb.newTable("geoCategoriesAndNewTableIntersection")
        await table.loadGeoData("test/geodata/files/polygonsGroups.json")
        const newTable = await table.aggregateGeo("intersection", {
            categories: "groups",
            outputTable: true,
        })

        const data = await newTable.getGeoData("geom")

        assert.deepStrictEqual(data, {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-76.59121317032408, 44.64024376334319],
                                [-75.86062003122073, 44.537223459668695],
                                [-74.92327882645311, 48.17661292382837],
                                [-77.46330450485964, 48.96271632192344],
                                [-76.59121317032408, 44.64024376334319],
                            ],
                        ],
                    },
                    properties: { groups: "A" },
                },
                {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-75.99049285283641, 43.484681104234824],
                                [-74.0185899104202, 41.67609329308551],
                                [-71.82392829577653, 43.77929660299827],
                                [-72.67730706669975, 45.29202451317114],
                                [-75.99049285283641, 43.484681104234824],
                            ],
                        ],
                    },
                    properties: { groups: "B" },
                },
            ],
        })
    })
    it("should do an intersection of geometries based on categories and return the results in a new table with a specific name in the DB", async () => {
        const table = sdb.newTable("geoCategoriesAndNewTableIntersection")
        await table.loadGeoData("test/geodata/files/polygonsGroups.json")
        const newTable = await table.aggregateGeo("intersection", {
            categories: "groups",
            outputTable: "specificTable",
        })

        const data = await newTable.getGeoData("geom")

        assert.deepStrictEqual(data, {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-76.59121317032408, 44.64024376334319],
                                [-75.86062003122073, 44.537223459668695],
                                [-74.92327882645311, 48.17661292382837],
                                [-77.46330450485964, 48.96271632192344],
                                [-76.59121317032408, 44.64024376334319],
                            ],
                        ],
                    },
                    properties: { groups: "A" },
                },
                {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-75.99049285283641, 43.484681104234824],
                                [-74.0185899104202, 41.67609329308551],
                                [-71.82392829577653, 43.77929660299827],
                                [-72.67730706669975, 45.29202451317114],
                                [-75.99049285283641, 43.484681104234824],
                            ],
                        ],
                    },
                    properties: { groups: "B" },
                },
            ],
        })
    })
})
