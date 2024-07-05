import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"
import {
    rmSync,
    existsSync,
    readFileSync,
    writeFileSync,
    readdirSync,
} from "fs"
import SimpleTable from "../../../src/class/SimpleTable.js"

describe("cache", () => {
    let sdb: SimpleDB
    let table: SimpleTable
    let tableGeo: SimpleTable
    before(async function () {
        sdb = new SimpleDB({ cacheVerbose: true })
        table = sdb.newTable()
        tableGeo = sdb.newTable()
        if (existsSync("./.sda-cache")) {
            rmSync("./.sda-cache", { recursive: true })
        }
    })
    // Done is called in the last test
    // after(async function () {
    //     await sdb.done()
    // })

    it("should cache computed values for tabular data", async () => {
        await table.cache(async () => {
            await table.loadData("test/data/files/dataSummarize.json")
            await table.summarize({
                values: "key2",
                decimals: 4,
            })
        })
        const data = await table.getData()
        assert.deepStrictEqual(data, [
            {
                value: "key2",
                count: 6,
                countUnique: 4,
                countNull: 2,
                min: 1,
                max: 22,
                mean: 9,
                median: 6.5,
                sum: 36,
                skew: 0.9669,
                stdDev: 9.7639,
                var: 95.3333,
            },
        ])
    })
    it("should load data from the cache instead of running computations", async () => {
        await table.cache(async () => {
            await table.loadData("test/data/files/dataSummarize.json")
            await table.summarize({
                values: "key2",
                decimals: 4,
            })
        })
        const data = await table.getData()
        assert.deepStrictEqual(data, [
            {
                value: "key2",
                count: 6,
                countUnique: 4,
                countNull: 2,
                min: 1,
                max: 22,
                mean: 9,
                median: 6.5,
                sum: 36,
                skew: 0.9669,
                stdDev: 9.7639,
                var: 95.3333,
            },
        ])
    })
    it("should not load data from the cache if ttl has expired", async () => {
        await table.cache(
            async () => {
                await table.loadData("test/data/files/dataSummarize.json")
                await table.summarize({
                    values: "key2",
                    decimals: 4,
                })
            },
            { ttl: 0 }
        )
        const data = await table.getData()
        assert.deepStrictEqual(data, [
            {
                value: "key2",
                count: 6,
                countUnique: 4,
                countNull: 2,
                min: 1,
                max: 22,
                mean: 9,
                median: 6.5,
                sum: 36,
                skew: 0.9669,
                stdDev: 9.7639,
                var: 95.3333,
            },
        ])
    })
    it("should cache computed values for geospatial data", async () => {
        await tableGeo.cache(async () => {
            await tableGeo.loadGeoData("test/geodata/files/pointsInside.json")
            await tableGeo.renameColumns({ geom: "points" })
            await tableGeo.latLon("points", "lat", "lon")
        })

        await tableGeo.removeColumns("points")
        const data = await tableGeo.getData()

        assert.deepStrictEqual(data, [
            {
                name: "pointA",
                lat: 48.241182892559266,
                lon: -76.34553248992202,
            },
            {
                name: "pointB",
                lat: 50.15023361660323,
                lon: -73.18043031919933,
            },
            {
                name: "pointC",
                lat: 48.47150751404138,
                lon: -72.78960434234926,
            },
            {
                name: "pointD",
                lat: 47.43075362784262,
                lon: -72.2926406368759,
            },
        ])
    })
    it("should load geospatial data from the cache instead of running computations", async () => {
        await tableGeo.cache(async () => {
            await tableGeo.loadGeoData("test/geodata/files/pointsInside.json")
            await tableGeo.renameColumns({ geom: "points" })
            await tableGeo.latLon("points", "lat", "lon")
        })

        await tableGeo.removeColumns("points")
        const data = await tableGeo.getData()

        assert.deepStrictEqual(data, [
            {
                name: "pointA",
                lat: 48.241182892559266,
                lon: -76.34553248992202,
            },
            {
                name: "pointB",
                lat: 50.15023361660323,
                lon: -73.18043031919933,
            },
            {
                name: "pointC",
                lat: 48.47150751404138,
                lon: -72.78960434234926,
            },
            {
                name: "pointD",
                lat: 47.43075362784262,
                lon: -72.2926406368759,
            },
        ])
    })
    it("should not load data from the cache if ttl has expired", async () => {
        await tableGeo.cache(
            async () => {
                await tableGeo.loadGeoData(
                    "test/geodata/files/pointsInside.json"
                )
                await tableGeo.renameColumns({ geom: "points" })
                await tableGeo.latLon("points", "lat", "lon")
            },
            { ttl: 0 }
        )

        await tableGeo.removeColumns("points")
        const data = await tableGeo.getData()

        assert.deepStrictEqual(data, [
            {
                name: "pointA",
                lat: 48.241182892559266,
                lon: -76.34553248992202,
            },
            {
                name: "pointB",
                lat: 50.15023361660323,
                lon: -73.18043031919933,
            },
            {
                name: "pointC",
                lat: 48.47150751404138,
                lon: -72.78960434234926,
            },
            {
                name: "pointD",
                lat: 47.43075362784262,
                lon: -72.2926406368759,
            },
        ])
    })
    it("should clean the cache when calling done", async () => {
        // We create a fake cached file.

        const cacheSources = JSON.parse(
            readFileSync(".sda-cache/sources.json", "utf-8")
        )
        cacheSources["testForCache"] = {
            timestamp: 1720117189389,
            file: "./.sda-cache/testForCache.json",
            geo: false,
            geoColumnName: null,
        }
        writeFileSync(".sda-cache/sources.json", JSON.stringify(cacheSources))
        writeFileSync(".sda-cache/testForCache.json", JSON.stringify("Hi!"))

        await sdb.done()

        const cacheSourcesIdsUpdated = Object.keys(
            JSON.parse(readFileSync(".sda-cache/sources.json", "utf-8"))
        )
        const files = readdirSync(".sda-cache/")

        assert.deepStrictEqual(
            { cacheSourcesIdsUpdated, files },
            {
                cacheSourcesIdsUpdated: [
                    "table1.afaf8ab8855d778f4f19526d0bade5d5f67b761cfade1ea9be6b2636979c7055",
                    "table2.3fd3ed0fe0def2631f630112adadcca9d7de2eab3b00e6a7122017bc39f91857",
                ],
                files: [
                    "sources.json",
                    "table1.afaf8ab8855d778f4f19526d0bade5d5f67b761cfade1ea9be6b2636979c7055.parquet",
                    "table2.3fd3ed0fe0def2631f630112adadcca9d7de2eab3b00e6a7122017bc39f91857.geojson",
                ],
            }
        )
    })
})
