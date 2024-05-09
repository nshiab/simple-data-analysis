import assert from "assert"
import { existsSync, mkdirSync, readFileSync } from "fs"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("aggregateGeo", () => {
    const output = "./test/output/"

    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        if (!existsSync(output)) {
            mkdirSync(output)
        }
        simpleNodeDB = new SimpleNodeDB({ spatial: true })
        await simpleNodeDB.loadGeoData(
            "geodata",
            "test/geodata/files/polygonsGroups.json"
        )
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should do an union of all geometries and overwrite the table", async () => {
        await simpleNodeDB.loadGeoData(
            "geodataOverwrite",
            "test/geodata/files/polygonsGroups.json"
        )
        await simpleNodeDB.aggregateGeo("geodataOverwrite", "geom", "union")
        await simpleNodeDB.writeGeoData(
            "geodataOverwrite",
            `${output}aggregatedAllUnion.geojson`
        )
        const data = JSON.parse(
            readFileSync(`${output}aggregatedAllUnion.geojson`, "utf-8")
        )

        assert.deepStrictEqual(data, {
            type: "FeatureCollection",
            name: "aggregatedAllUnion",
            features: [
                {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-64.09300368099305, 47.825124834841631],
                                [-66.736875473272391, 44.853788962049634],
                                [-65.253122495609162, 44.318971411012456],
                                [-66.376323831080256, 38.660069743624263],
                                [-71.303090219871734, 39.185494219538867],
                                [-74.018589910420204, 41.676093293085508],
                                [-76.541543038114668, 39.258279387964052],
                                [-81.909368104075739, 41.783280176925302],
                                [-80.412353942191345, 43.435441649151073],
                                [-84.424887247393613, 44.568200476215395],
                                [-82.838935674453282, 50.62640104969924],
                                [-77.463304504859636, 48.962716321923438],
                                [-77.569639609504264, 49.489760398201213],
                                [-72.876925668627152, 52.492872979444854],
                                [-64.09300368099305, 47.825124834841631],
                            ],
                        ],
                    },
                },
            ],
        })
    })
    it("should do an union of all geometries and return the results in a new the table", async () => {
        await simpleNodeDB.loadGeoData(
            "geodata",
            "test/geodata/files/polygonsGroups.json"
        )
        await simpleNodeDB.aggregateGeo("geodata", "geom", "union", {
            outputTable: "unionAll",
        })
        await simpleNodeDB.writeGeoData(
            "unionAll",
            `${output}outputTableUnionAll.geojson`
        )
        const data = JSON.parse(
            readFileSync(`${output}outputTableUnionAll.geojson`, "utf-8")
        )

        assert.deepStrictEqual(data, {
            type: "FeatureCollection",
            name: "outputTableUnionAll",
            features: [
                {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-64.09300368099305, 47.825124834841631],
                                [-66.736875473272391, 44.853788962049634],
                                [-65.253122495609162, 44.318971411012456],
                                [-66.376323831080256, 38.660069743624263],
                                [-71.303090219871734, 39.185494219538867],
                                [-74.018589910420204, 41.676093293085508],
                                [-76.541543038114668, 39.258279387964052],
                                [-81.909368104075739, 41.783280176925302],
                                [-80.412353942191345, 43.435441649151073],
                                [-84.424887247393613, 44.568200476215395],
                                [-82.838935674453282, 50.62640104969924],
                                [-77.463304504859636, 48.962716321923438],
                                [-77.569639609504264, 49.489760398201213],
                                [-72.876925668627152, 52.492872979444854],
                                [-64.09300368099305, 47.825124834841631],
                            ],
                        ],
                    },
                },
            ],
        })
    })
    it("should do an union of geometries based on categories", async () => {
        await simpleNodeDB.loadGeoData(
            "geodata",
            "test/geodata/files/polygonsGroups.json"
        )
        await simpleNodeDB.aggregateGeo("geodata", "geom", "union", {
            categories: "group",
        })
        await simpleNodeDB.writeGeoData(
            "geodata",
            `${output}unionOnCategories.geojson`
        )
        const data = JSON.parse(
            readFileSync(`${output}unionOnCategories.geojson`, "utf-8")
        )

        assert.deepStrictEqual(data, {
            type: "FeatureCollection",
            name: "unionOnCategories",
            features: [
                {
                    type: "Feature",
                    properties: { group: "A" },
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-77.569639609504264, 49.489760398201213],
                                [-72.876925668627152, 52.492872979444854],
                                [-64.09300368099305, 47.825124834841631],
                                [-68.004279012026146, 43.429407639551414],
                                [-75.860620031220733, 44.537223459668695],
                                [-76.43367458579074, 42.312239966269544],
                                [-84.424887247393613, 44.568200476215395],
                                [-82.838935674453282, 50.62640104969924],
                                [-77.463304504859636, 48.962716321923438],
                                [-77.569639609504264, 49.489760398201213],
                            ],
                        ],
                    },
                },
                {
                    type: "Feature",
                    properties: { group: "B" },
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-70.797524091120323, 46.317446445548114],
                                [-65.253122495609162, 44.318971411012456],
                                [-66.376323831080256, 38.660069743624263],
                                [-71.303090219871734, 39.185494219538867],
                                [-74.018589910420204, 41.676093293085508],
                                [-76.541543038114668, 39.258279387964052],
                                [-81.909368104075739, 41.783280176925302],
                                [-78.66686680022147, 45.361827303778455],
                                [-73.31482829407085, 46.422116081922724],
                                [-72.677307066699754, 45.292024513171143],
                                [-70.797524091120323, 46.317446445548114],
                            ],
                        ],
                    },
                },
            ],
        })
    })
    it("should do an union of geometries based on categories and return the results in a new table", async () => {
        await simpleNodeDB.loadGeoData(
            "geodata",
            "test/geodata/files/polygonsGroups.json"
        )
        await simpleNodeDB.aggregateGeo("geodata", "geom", "union", {
            categories: "group",
            outputTable: "unionOnCategoriesOutputTable",
        })
        await simpleNodeDB.writeGeoData(
            "unionOnCategoriesOutputTable",
            `${output}unionOnCategoriesOutputTable.geojson`
        )
        const data = JSON.parse(
            readFileSync(
                `${output}unionOnCategoriesOutputTable.geojson`,
                "utf-8"
            )
        )

        assert.deepStrictEqual(data, {
            type: "FeatureCollection",
            name: "unionOnCategoriesOutputTable",
            features: [
                {
                    type: "Feature",
                    properties: { group: "A" },
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-77.569639609504264, 49.489760398201213],
                                [-72.876925668627152, 52.492872979444854],
                                [-64.09300368099305, 47.825124834841631],
                                [-68.004279012026146, 43.429407639551414],
                                [-75.860620031220733, 44.537223459668695],
                                [-76.43367458579074, 42.312239966269544],
                                [-84.424887247393613, 44.568200476215395],
                                [-82.838935674453282, 50.62640104969924],
                                [-77.463304504859636, 48.962716321923438],
                                [-77.569639609504264, 49.489760398201213],
                            ],
                        ],
                    },
                },
                {
                    type: "Feature",
                    properties: { group: "B" },
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-70.797524091120323, 46.317446445548114],
                                [-65.253122495609162, 44.318971411012456],
                                [-66.376323831080256, 38.660069743624263],
                                [-71.303090219871734, 39.185494219538867],
                                [-74.018589910420204, 41.676093293085508],
                                [-76.541543038114668, 39.258279387964052],
                                [-81.909368104075739, 41.783280176925302],
                                [-78.66686680022147, 45.361827303778455],
                                [-73.31482829407085, 46.422116081922724],
                                [-72.677307066699754, 45.292024513171143],
                                [-70.797524091120323, 46.317446445548114],
                            ],
                        ],
                    },
                },
            ],
        })
    })
})
