import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("summarize", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
        await simpleNodeDB.loadData(
            "dataSummarize",
            "test/data/files/dataSummarize.json"
        )
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should summarize all numeric columns in a table and overwrite the column", async () => {
        await simpleNodeDB.cloneTable("dataSummarize", "dataSummarizeClone")
        await simpleNodeDB.summarize("dataSummarizeClone")
        const data = await simpleNodeDB.getData("dataSummarizeClone")

        assert.deepStrictEqual(data, [
            {
                value: "key2",
                count: 4,
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
                count: 4,
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

    it("should summarize all numeric columns in a table and overwrite the column with 2 decimals", async () => {
        await simpleNodeDB.cloneTable("dataSummarize", "dataSummarizeClone")
        await simpleNodeDB.summarize("dataSummarizeClone", { decimals: 2 })
        const data = await simpleNodeDB.getData("dataSummarizeClone")

        assert.deepStrictEqual(data, [
            {
                value: "key2",
                count: 4,
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
                count: 4,
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

    it("should summarize all numeric columns in a table", async () => {
        await simpleNodeDB.summarize("dataSummarize", {
            decimals: 2,
            outputTable: "dataSummarizeAll",
        })
        const data = await simpleNodeDB.getData("dataSummarizeAll")

        assert.deepStrictEqual(data, [
            {
                value: "key2",
                count: 4,
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
                count: 4,
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
    it("should summarize specific numeric columns in a table", async () => {
        await simpleNodeDB.summarize("dataSummarize", {
            decimals: 2,
            outputTable: "dataSummarizeOneValue",
            values: "key2",
        })
        const data = await simpleNodeDB.getData("dataSummarizeOneValue")

        assert.deepStrictEqual(data, [
            {
                value: "key2",
                count: 4,
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
    it("should summarize specific numeric columns in a table with a specific number of decimals", async () => {
        await simpleNodeDB.summarize("dataSummarize", {
            outputTable: "dataSummarizeOneValueDecimals",
            values: "key2",
            decimals: 4,
        })
        const data = await simpleNodeDB.getData("dataSummarizeOneValueDecimals")

        assert.deepStrictEqual(data, [
            {
                value: "key2",
                count: 4,
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
    it("should summarize all numeric columns in a table with a non numeric category", async () => {
        await simpleNodeDB.summarize("dataSummarize", {
            decimals: 2,
            outputTable: "dataSummarizeNonNumericalCategory",
            categories: "key1",
        })

        const data = await simpleNodeDB.getData(
            "dataSummarizeNonNumericalCategory"
        )

        assert.deepStrictEqual(data, [
            {
                value: "key2",
                key1: "Fraise",
                count: 2,
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
                key1: "Fraise",
                count: 2,
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
    it("should summarize all numeric columns in a table with a numeric category", async () => {
        await simpleNodeDB.summarize("dataSummarize", {
            decimals: 2,
            outputTable: "dataSummarizeNumericalCategory",
            categories: "key2",
        })
        const data = await simpleNodeDB.getData(
            "dataSummarizeNumericalCategory"
        )

        assert.deepStrictEqual(data, [
            {
                value: "key3",
                key2: 1,
                count: 1,
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
                min: 12.34,
                max: 12.34,
                mean: 12.34,
                median: 12.34,
                sum: 12.34,
                skew: null,
                stdDev: null,
                var: null,
            },
        ])
    })
    it("should summarize all numeric columns in a table with specific summaries", async () => {
        await simpleNodeDB.summarize("dataSummarize", {
            decimals: 2,
            outputTable: "dataSummarizeAllSpecificSummaries",
            summaries: ["mean", "count"],
        })
        const data = await simpleNodeDB.getData(
            "dataSummarizeAllSpecificSummaries"
        )

        assert.deepStrictEqual(data, [
            { value: "key2", mean: 9, count: 4 },
            { value: "key3", mean: 7.44, count: 4 },
        ])
    })
    it("should summarize all numeric columns in a table with specific summaries and specific categories", async () => {
        await simpleNodeDB.summarize("dataSummarize", {
            decimals: 2,
            outputTable: "dataSummarizeAllSpecificSummariesAndCategories",
            categories: "key1",
            summaries: ["mean", "count"],
        })
        const data = await simpleNodeDB.getData(
            "dataSummarizeAllSpecificSummariesAndCategories"
        )

        assert.deepStrictEqual(data, [
            { value: "key2", key1: "Fraise", mean: 16.5, count: 2 },
            { value: "key2", key1: "Rubarbe", mean: 1.5, count: 2 },
            { value: "key3", key1: "Fraise", mean: 7.34, count: 2 },
            { value: "key3", key1: "Rubarbe", mean: 7.53, count: 2 },
        ])
    })
    it("should summarize specific columns in a table with specific summaries and specific categories", async () => {
        await simpleNodeDB.summarize("dataSummarize", {
            outputTable: "dataSummarizeAllSpecificValuesSummariesAndCategories",
            values: "key2",
            categories: "key1",
            summaries: ["mean", "count"],
        })
        const data = await simpleNodeDB.getData(
            "dataSummarizeAllSpecificValuesSummariesAndCategories"
        )
        assert.deepStrictEqual(data, [
            { value: "key2", key1: "Fraise", mean: 16.5, count: 2 },
            { value: "key2", key1: "Rubarbe", mean: 1.5, count: 2 },
        ])
    })
    it("should summarize with multiple categories", async () => {
        await simpleNodeDB.summarize("dataSummarize", {
            decimals: 2,
            outputTable: "dataSummarizeMultipleCategories",
            values: "key3",
            categories: ["key1", "key2"],
            summaries: ["mean", "count"],
        })
        const data = await simpleNodeDB.getData(
            "dataSummarizeMultipleCategories"
        )

        assert.deepStrictEqual(data, [
            { value: "key3", key1: "Fraise", key2: 11, mean: 2.35, count: 1 },
            { value: "key3", key1: "Fraise", key2: 22, mean: 12.34, count: 1 },
            { value: "key3", key1: "Rubarbe", key2: 1, mean: 10.5, count: 1 },
            { value: "key3", key1: "Rubarbe", key2: 2, mean: 4.57, count: 1 },
        ])
    })
    it("should summarize with dates", async () => {
        await simpleNodeDB.loadArray("dates", [
            { keyA: new Date("2023-01-01") },
            { keyA: new Date("2022-01-01") },
            { keyA: new Date("2021-01-01") },
        ])

        await simpleNodeDB.summarize("dates")
        const data = await simpleNodeDB.getData("dates")

        assert.deepStrictEqual(data, [
            {
                value: "keyA",
                count: 3,
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
})
