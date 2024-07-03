import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"
import { rmSync } from "fs"
import SimpleTable from "../../../src/class/SimpleTable.js"

describe("cache", () => {
    let sdb: SimpleDB
    let table: SimpleTable
    let tableGeo: SimpleTable
    before(async function () {
        sdb = new SimpleDB()
        table = sdb.newTable()
        tableGeo = sdb.newTable()
        rmSync("./.sda-cache", { recursive: true })
    })
    after(async function () {
        await sdb.done()
    })

    it("should cache computed values for tabular data", async () => {
        await table.cache(
            async () => {
                await table.loadData("test/data/files/dataSummarize.json")
                await table.summarize({
                    values: "key2",
                    decimals: 4,
                })
            },
            { verbose: true }
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
    it("should load data from the cache instead of running computations", async () => {
        await table.cache(
            async () => {
                await table.loadData("test/data/files/dataSummarize.json")
                await table.summarize({
                    values: "key2",
                    decimals: 4,
                })
            },
            { verbose: true }
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
    it("should not load data from the cache if ttl has expired", async () => {
        await table.cache(
            async () => {
                await table.loadData("test/data/files/dataSummarize.json")
                await table.summarize({
                    values: "key2",
                    decimals: 4,
                })
            },
            { ttl: 0, verbose: true }
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
        await tableGeo.cache(
            async () => {
                await tableGeo.loadGeoData(
                    "test/geodata/files/pointsInside.json"
                )
                await tableGeo.latLon("geom", "lat", "lon")
            },
            { verbose: true }
        )

        await tableGeo.removeColumns("geom")
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
        await tableGeo.cache(
            async () => {
                await tableGeo.loadGeoData(
                    "test/geodata/files/pointsInside.json"
                )
                await tableGeo.latLon("geom", "lat", "lon")
            },
            { verbose: true }
        )

        await tableGeo.removeColumns("geom")
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
                await tableGeo.latLon("geom", "lat", "lon")
            },
            { ttl: 0, verbose: true }
        )

        await tableGeo.removeColumns("geom")
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
})
