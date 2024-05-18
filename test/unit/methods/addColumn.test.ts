import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"
import { existsSync, mkdirSync, readFileSync } from "fs"

describe("addColumn", () => {
    const output = "./test/output/"

    let sdb: SimpleDB
    before(async function () {
        if (!existsSync(output)) {
            mkdirSync(output)
        }
        sdb = new SimpleDB({ spatial: true })
        await sdb.loadData("dataSummarize", [
            "test/data/files/dataSummarize.json",
        ])
    })
    after(async function () {
        await sdb.done()
    })

    it("should return a column with new computed values", async () => {
        await sdb.addColumn(
            "dataSummarize",
            "multiply",
            "double",
            `key2 * key3`
        )

        const data = await sdb.getData("dataSummarize")

        assert.deepStrictEqual(data, [
            { key1: "Rubarbe", key2: 1, key3: 10.5, multiply: 10.5 },
            { key1: "Fraise", key2: 11, key3: 2.345, multiply: 25.795 },
            { key1: "Rubarbe", key2: 2, key3: 4.5657, multiply: 9.1314 },
            { key1: "Fraise", key2: 22, key3: 12.3434, multiply: 271.5548 },
            { key1: "Banane", key2: null, key3: null, multiply: null },
            { key1: "Banane", key2: null, key3: null, multiply: null },
        ])
    })
    it("should return a column with booleans", async () => {
        await sdb.addColumn(
            "dataSummarize",
            "key2GreaterThanTen",
            "boolean",
            `key2 > 10`
        )

        const data = await sdb.getData("dataSummarize")

        assert.deepStrictEqual(data, [
            {
                key1: "Rubarbe",
                key2: 1,
                key3: 10.5,
                multiply: 10.5,
                key2GreaterThanTen: false,
            },
            {
                key1: "Fraise",
                key2: 11,
                key3: 2.345,
                multiply: 25.795,
                key2GreaterThanTen: true,
            },
            {
                key1: "Rubarbe",
                key2: 2,
                key3: 4.5657,
                multiply: 9.1314,
                key2GreaterThanTen: false,
            },
            {
                key1: "Fraise",
                key2: 22,
                key3: 12.3434,
                multiply: 271.5548,
                key2GreaterThanTen: true,
            },
            {
                key1: "Banane",
                key2: null,
                key3: null,
                multiply: null,
                key2GreaterThanTen: null,
            },
            {
                key1: "Banane",
                key2: null,
                key3: null,
                multiply: null,
                key2GreaterThanTen: null,
            },
        ])
    })
    it("should return a column with geometry", async () => {
        await sdb.loadGeoData("geo", "test/geodata/files/polygons.geojson")

        await sdb.addColumn("geo", "centroid", "geometry", `ST_Centroid(geom)`)
        await sdb.selectColumns("geo", ["name", "centroid"])
        await sdb.writeGeoData("geo", `${output}/addColumTest.geojson`)

        const data = JSON.parse(
            readFileSync(`${output}/addColumTest.geojson`, "utf-8")
        )

        assert.deepStrictEqual(data, {
            type: "FeatureCollection",
            name: "addColumTest",
            features: [
                {
                    type: "Feature",
                    properties: { name: "polygonA" },
                    geometry: {
                        type: "Point",
                        coordinates: [-78.404315186235195, 47.992857929155612],
                    },
                },
                {
                    type: "Feature",
                    properties: { name: "polygonB" },
                    geometry: {
                        type: "Point",
                        coordinates: [-109.102836190004638, 57.31925822683683],
                    },
                },
            ],
        })
    })
})
