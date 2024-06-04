import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("summarize", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should summarize all numeric columns in a table and overwrite the table", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/dataSummarize.json")
        await table.summarize()
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            {
                value: "key1",
                count: 6,
                countUnique: 3,
                countNull: 0,
                min: null,
                max: null,
                mean: null,
                median: null,
                sum: null,
                skew: null,
                stdDev: null,
                var: null,
            },
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
                skew: 0.9668861556278396,
                stdDev: 9.763879010584539,
                var: 95.33333333333333,
            },
            {
                value: "key3",
                count: 6,
                countUnique: 4,
                countNull: 2,
                min: 2.345,
                max: 12.3434,
                mean: 7.438525,
                median: 7.53285,
                sum: 29.7541,
                skew: -0.057065942564767755,
                stdDev: 4.747895967250477,
                var: 22.542516115833337,
            },
        ])
    })
    it("should summarize with 2 decimals all columns in a table and overwrite the table", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/dataSummarize.json")
        await table.summarize({ decimals: 2 })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            {
                value: "key1",
                count: 6,
                countUnique: 3,
                countNull: 0,
                min: null,
                max: null,
                mean: null,
                median: null,
                sum: null,
                skew: null,
                stdDev: null,
                var: null,
            },
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
                skew: 0.97,
                stdDev: 9.76,
                var: 95.33,
            },
            {
                value: "key3",
                count: 6,
                countUnique: 4,
                countNull: 2,
                min: 2.35,
                max: 12.34,
                mean: 7.44,
                median: 7.53,
                sum: 29.75,
                skew: -0.06,
                stdDev: 4.75,
                var: 22.54,
            },
        ])
    })

    it("should summarize all columns in a table and output the results in another table", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/dataSummarize.json")
        const newTable = await table.summarize({
            decimals: 2,
            outputTable: true,
        })
        const data = await newTable.getData()

        assert.deepStrictEqual(data, [
            {
                value: "key1",
                count: 6,
                countUnique: 3,
                countNull: 0,
                min: null,
                max: null,
                mean: null,
                median: null,
                sum: null,
                skew: null,
                stdDev: null,
                var: null,
            },
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
                skew: 0.97,
                stdDev: 9.76,
                var: 95.33,
            },
            {
                value: "key3",
                count: 6,
                countUnique: 4,
                countNull: 2,
                min: 2.35,
                max: 12.34,
                mean: 7.44,
                median: 7.53,
                sum: 29.75,
                skew: -0.06,
                stdDev: 4.75,
                var: 22.54,
            },
        ])
    })
    it("should summarize all columns in a table and output the results in another table with a specific name in the DB", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/dataSummarize.json")
        await table.summarize({
            decimals: 2,
            outputTable: "newTable",
        })
        const data = await sdb.customQuery("select * from newTable", {
            returnDataFrom: "query",
        })

        assert.deepStrictEqual(data, [
            {
                value: "key1",
                count: 6,
                countUnique: 3,
                countNull: 0,
                min: null,
                max: null,
                mean: null,
                median: null,
                sum: null,
                skew: null,
                stdDev: null,
                var: null,
            },
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
                skew: 0.97,
                stdDev: 9.76,
                var: 95.33,
            },
            {
                value: "key3",
                count: 6,
                countUnique: 4,
                countNull: 2,
                min: 2.35,
                max: 12.34,
                mean: 7.44,
                median: 7.53,
                sum: 29.75,
                skew: -0.06,
                stdDev: 4.75,
                var: 22.54,
            },
        ])
    })
    it("should summarize specific columns in a table", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/dataSummarize.json")
        await table.summarize({
            decimals: 2,
            values: "key2",
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
                skew: 0.97,
                stdDev: 9.76,
                var: 95.33,
            },
        ])
    })

    it("should summarize specific columns in a table with a specific number of decimals", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/dataSummarize.json")
        await table.summarize({
            values: "key2",
            decimals: 4,
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

    it("should summarize all columns in a table with a non numeric category", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/dataSummarize.json")
        await table.summarize({
            decimals: 2,
            categories: "key1",
        })

        const data = await table.getData()

        assert.deepStrictEqual(data, [
            {
                value: "key2",
                key1: "Banane",
                count: 2,
                countUnique: 0,
                countNull: 2,
                min: null,
                max: null,
                mean: null,
                median: null,
                sum: null,
                skew: null,
                stdDev: null,
                var: null,
            },
            {
                value: "key2",
                key1: "Fraise",
                count: 2,
                countUnique: 2,
                countNull: 0,
                min: 11,
                max: 22,
                mean: 16.5,
                median: 16.5,
                sum: 33,
                skew: null,
                stdDev: 7.78,
                var: 60.5,
            },
            {
                value: "key2",
                key1: "Rubarbe",
                count: 2,
                countUnique: 2,
                countNull: 0,
                min: 1,
                max: 2,
                mean: 1.5,
                median: 1.5,
                sum: 3,
                skew: null,
                stdDev: 0.71,
                var: 0.5,
            },
            {
                value: "key3",
                key1: "Banane",
                count: 2,
                countUnique: 0,
                countNull: 2,
                min: null,
                max: null,
                mean: null,
                median: null,
                sum: null,
                skew: null,
                stdDev: null,
                var: null,
            },
            {
                value: "key3",
                key1: "Fraise",
                count: 2,
                countUnique: 2,
                countNull: 0,
                min: 2.35,
                max: 12.34,
                mean: 7.34,
                median: 7.34,
                sum: 14.69,
                skew: null,
                stdDev: 7.07,
                var: 49.98,
            },
            {
                value: "key3",
                key1: "Rubarbe",
                count: 2,
                countUnique: 2,
                countNull: 0,
                min: 4.57,
                max: 10.5,
                mean: 7.53,
                median: 7.53,
                sum: 15.07,
                skew: null,
                stdDev: 4.2,
                var: 17.61,
            },
        ])
    })

    it("should summarize all columns in a table with a numeric category", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/dataSummarize.json")
        await table.summarize({
            decimals: 2,
            categories: "key2",
        })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            {
                value: "key1",
                key2: 1,
                count: 1,
                countUnique: 1,
                countNull: 0,
                min: null,
                max: null,
                mean: null,
                median: null,
                sum: null,
                skew: null,
                stdDev: null,
                var: null,
            },
            {
                value: "key1",
                key2: 2,
                count: 1,
                countUnique: 1,
                countNull: 0,
                min: null,
                max: null,
                mean: null,
                median: null,
                sum: null,
                skew: null,
                stdDev: null,
                var: null,
            },
            {
                value: "key1",
                key2: 11,
                count: 1,
                countUnique: 1,
                countNull: 0,
                min: null,
                max: null,
                mean: null,
                median: null,
                sum: null,
                skew: null,
                stdDev: null,
                var: null,
            },
            {
                value: "key1",
                key2: 22,
                count: 1,
                countUnique: 1,
                countNull: 0,
                min: null,
                max: null,
                mean: null,
                median: null,
                sum: null,
                skew: null,
                stdDev: null,
                var: null,
            },
            {
                value: "key1",
                key2: null,
                count: 2,
                countUnique: 1,
                countNull: 0,
                min: null,
                max: null,
                mean: null,
                median: null,
                sum: null,
                skew: null,
                stdDev: null,
                var: null,
            },
            {
                value: "key3",
                key2: 1,
                count: 1,
                countUnique: 1,
                countNull: 0,
                min: 10.5,
                max: 10.5,
                mean: 10.5,
                median: 10.5,
                sum: 10.5,
                skew: null,
                stdDev: null,
                var: null,
            },
            {
                value: "key3",
                key2: 2,
                count: 1,
                countUnique: 1,
                countNull: 0,
                min: 4.57,
                max: 4.57,
                mean: 4.57,
                median: 4.57,
                sum: 4.57,
                skew: null,
                stdDev: null,
                var: null,
            },
            {
                value: "key3",
                key2: 11,
                count: 1,
                countUnique: 1,
                countNull: 0,
                min: 2.35,
                max: 2.35,
                mean: 2.35,
                median: 2.35,
                sum: 2.35,
                skew: null,
                stdDev: null,
                var: null,
            },
            {
                value: "key3",
                key2: 22,
                count: 1,
                countUnique: 1,
                countNull: 0,
                min: 12.34,
                max: 12.34,
                mean: 12.34,
                median: 12.34,
                sum: 12.34,
                skew: null,
                stdDev: null,
                var: null,
            },
            {
                value: "key3",
                key2: null,
                count: 2,
                countUnique: 0,
                countNull: 2,
                min: null,
                max: null,
                mean: null,
                median: null,
                sum: null,
                skew: null,
                stdDev: null,
                var: null,
            },
        ])
    })

    it("should summarize all columns in a table with specific summaries", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/dataSummarize.json")
        await table.summarize({
            decimals: 2,
            summaries: ["mean", "count"],
        })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { value: "key1", mean: null, count: 6 },
            { value: "key2", mean: 9, count: 6 },
            { value: "key3", mean: 7.44, count: 6 },
        ])
    })

    it("should summarize all columns in a table with specific summaries and specific categories", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/dataSummarize.json")
        await table.summarize({
            decimals: 2,
            categories: "key1",
            summaries: ["mean", "count"],
        })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { value: "key2", key1: "Banane", mean: null, count: 2 },
            { value: "key2", key1: "Fraise", mean: 16.5, count: 2 },
            { value: "key2", key1: "Rubarbe", mean: 1.5, count: 2 },
            { value: "key3", key1: "Banane", mean: null, count: 2 },
            { value: "key3", key1: "Fraise", mean: 7.34, count: 2 },
            { value: "key3", key1: "Rubarbe", mean: 7.53, count: 2 },
        ])
    })

    it("should summarize specific columns in a table with specific summaries and specific categories", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/dataSummarize.json")
        await table.summarize({
            values: "key2",
            categories: "key1",
            summaries: ["mean", "count"],
        })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { value: "key2", key1: "Banane", mean: null, count: 2 },
            { value: "key2", key1: "Fraise", mean: 16.5, count: 2 },
            { value: "key2", key1: "Rubarbe", mean: 1.5, count: 2 },
        ])
    })

    it("should summarize with multiple categories", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/dataSummarize.json")
        await table.summarize({
            decimals: 2,
            values: "key3",
            categories: ["key1", "key2"],
            summaries: ["mean", "count"],
        })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { value: "key3", key1: "Banane", key2: null, mean: null, count: 2 },
            { value: "key3", key1: "Fraise", key2: 11, mean: 2.35, count: 1 },
            { value: "key3", key1: "Fraise", key2: 22, mean: 12.34, count: 1 },
            { value: "key3", key1: "Rubarbe", key2: 1, mean: 10.5, count: 1 },
            { value: "key3", key1: "Rubarbe", key2: 2, mean: 4.57, count: 1 },
        ])
    })

    it("should summarize with dates", async () => {
        const table = sdb.newTable()
        await table.loadArray([
            { keyA: new Date("2023-01-01") },
            { keyA: new Date("2022-01-01") },
            { keyA: new Date("2022-01-01") },
            { keyA: new Date("2021-01-01") },
            { keyA: null },
        ])

        await table.summarize()
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            {
                value: "keyA",
                count: 5,
                countUnique: 3,
                countNull: 1,
                min: new Date("2021-01-01"),
                max: new Date("2023-01-01"),
                mean: null,
                median: new Date("2022-01-01"),
                sum: null,
                skew: null,
                stdDev: null,
                var: null,
            },
        ])
    })
    it("should summarize even with geometries", async () => {
        const provinces = sdb.newTable()
        await provinces.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )
        await provinces.summarize()

        const data = await provinces.getData()

        assert.deepStrictEqual(data, [
            {
                value: "geom",
                count: null,
                countUnique: null,
                countNull: null,
                min: null,
                max: null,
                mean: null,
                median: null,
                sum: null,
                skew: null,
                stdDev: null,
                var: null,
            },
            {
                value: "nameEnglish",
                count: 13,
                countUnique: 13,
                countNull: 0,
                min: null,
                max: null,
                mean: null,
                median: null,
                sum: null,
                skew: null,
                stdDev: null,
                var: null,
            },
            {
                value: "nameFrench",
                count: 13,
                countUnique: 13,
                countNull: 0,
                min: null,
                max: null,
                mean: null,
                median: null,
                sum: null,
                skew: null,
                stdDev: null,
                var: null,
            },
        ])
    })
    it("should summarize even with a mix of geometries, dates, and number, with the option toMs", async () => {
        const provinces = sdb.newTable()
        await provinces.loadGeoData(
            "test/geodata/files/CanadianProvincesAndTerritories.json"
        )

        const fires = sdb.newTable()
        await fires.loadData("test/geodata/files/firesCanada2023.csv")
        await fires.points("lat", "lon", "points")
        await fires.joinGeo(provinces, "inside")
        await fires.summarize({ toMs: true })

        const data = await fires.getData()

        assert.deepStrictEqual(data, [
            {
                value: "cause",
                count: 7173,
                countUnique: 3,
                countNull: 0,
                min: null,
                max: null,
                mean: null,
                median: null,
                sum: null,
                skew: null,
                stdDev: null,
                var: null,
            },
            {
                value: "firename",
                count: 7173,
                countUnique: 7070,
                countNull: 0,
                min: null,
                max: null,
                mean: null,
                median: null,
                sum: null,
                skew: null,
                stdDev: null,
                var: null,
            },
            {
                value: "geom",
                count: null,
                countUnique: null,
                countNull: null,
                min: null,
                max: null,
                mean: null,
                median: null,
                sum: null,
                skew: null,
                stdDev: null,
                var: null,
            },
            {
                value: "hectares",
                count: 7173,
                countUnique: 1270,
                countNull: 0,
                min: 0,
                max: 1080520,
                mean: 2542.6626543984025,
                median: 0.2,
                sum: 18238519.21999974,
                skew: 23.103418035907847,
                stdDev: 24767.408856431437,
                var: 613424541.4616383,
            },
            {
                value: "lat",
                count: 7173,
                countUnique: 5733,
                countNull: 0,
                min: 41.935,
                max: 69.572,
                mean: 52.96274972814743,
                median: 52.597,
                sum: 379901.8038000015,
                skew: 0.6477738256188252,
                stdDev: 4.671369172159063,
                var: 21.821689942598052,
            },
            {
                value: "lon",
                count: 7173,
                countUnique: 6419,
                countNull: 0,
                min: -140.918,
                max: -52.777,
                mean: -106.08266514707931,
                median: -115.215,
                sum: -760930.9570999999,
                skew: 0.8113802971328642,
                stdDev: 20.865309674375574,
                var: 435.3611478075909,
            },
            {
                value: "nameEnglish",
                count: 7173,
                countUnique: 12,
                countNull: 124,
                min: null,
                max: null,
                mean: null,
                median: null,
                sum: null,
                skew: null,
                stdDev: null,
                var: null,
            },
            {
                value: "nameFrench",
                count: 7173,
                countUnique: 12,
                countNull: 124,
                min: null,
                max: null,
                mean: null,
                median: null,
                sum: null,
                skew: null,
                stdDev: null,
                var: null,
            },
            {
                value: "points",
                count: null,
                countUnique: null,
                countNull: null,
                min: null,
                max: null,
                mean: null,
                median: null,
                sum: null,
                skew: null,
                stdDev: null,
                var: null,
            },
            {
                value: "startdate",
                count: 7173,
                countUnique: 6407,
                countNull: 0,
                min: 1673028000000,
                max: 1703063041000,
                mean: 1688148540401.2268,
                median: 1688396400000,
                sum: 12109089480298000,
                skew: 0.3442270365603758,
                stdDev: 3982510968.0103426,
                var: 15860393610322678000,
            },
        ])
    })
    it("should summarize dates with the option toMs and we should be able to bring them back at date", async () => {
        const fires = sdb.newTable()
        await fires.loadData("test/geodata/files/firesCanada2023.csv")
        await fires.summarize({ values: "startdate", toMs: true })
        await fires.convert({
            min: "timestamp",
            max: "timestamp",
            median: "timestamp",
        })

        const data = await fires.getData()

        assert.deepStrictEqual(data, [
            {
                value: "startdate",
                count: 7171,
                countUnique: 6407,
                countNull: 0,
                min: new Date("2023-01-06T18:00:00.000Z"),
                max: new Date("2023-12-20T09:04:01.000Z"),
                mean: 1688147310271.6497,
                median: new Date("2023-07-03T11:25:39.000Z"),
                sum: 12105704361958000,
                skew: 0.34455072951692006,
                stdDev: 3982134719.016981,
                var: 15857396920400452000,
            },
        ])
    })
})
