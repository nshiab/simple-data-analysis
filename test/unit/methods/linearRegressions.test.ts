import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("linearRegressions", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })
    it("should return the slope, yIntercept and coefficient of determination for all permutations of numeric columns and overwrite the current table with the results", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/dataCorrelations.json")
        await table.linearRegressions({ decimals: 10 })
        await table.sort({ r2: "desc", x: "asc" })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            {
                x: "key3",
                y: "key4",
                slope: -0.5817374127,
                yIntercept: 9.0772682875,
                r2: 0.511428109,
            },
            {
                x: "key4",
                y: "key3",
                slope: -0.8791391061,
                yIntercept: 11.6144357542,
                r2: 0.511428109,
            },
            {
                x: "key2",
                y: "key3",
                slope: 0.172008042,
                yIntercept: 5.8904526224,
                r2: 0.1251237909,
            },
            {
                x: "key3",
                y: "key2",
                slope: 0.7274298892,
                yIntercept: 3.5889945836,
                r2: 0.1251237909,
            },
            {
                x: "key2",
                y: "key4",
                slope: -0.0979020979,
                yIntercept: 5.6311188811,
                r2: 0.0612571786,
            },
            {
                x: "key4",
                y: "key2",
                slope: -0.625698324,
                yIntercept: 11.9720670391,
                r2: 0.0612571786,
            },
        ])
    })

    it("should return the slope, yIntercept and coefficient of determination for all permutations of numeric columns and overwrite the current table with the results, with 2 decimals", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/dataCorrelations.json")
        await table.linearRegressions({ decimals: 2 })
        await table.sort({ r2: "desc", x: "asc" })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { x: "key3", y: "key4", slope: -0.58, yIntercept: 9.08, r2: 0.51 },
            { x: "key4", y: "key3", slope: -0.88, yIntercept: 11.61, r2: 0.51 },
            { x: "key2", y: "key3", slope: 0.17, yIntercept: 5.89, r2: 0.13 },
            { x: "key3", y: "key2", slope: 0.73, yIntercept: 3.59, r2: 0.13 },
            { x: "key2", y: "key4", slope: -0.1, yIntercept: 5.63, r2: 0.06 },
            { x: "key4", y: "key2", slope: -0.63, yIntercept: 11.97, r2: 0.06 },
        ])
    })
    it("should return the slope, yIntercept and coefficient of determination for all permutations of numeric columns and push the results to a new table, with 2 decimals", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/dataCorrelations.json")
        const regre = await table.linearRegressions({
            decimals: 2,
            outputTable: true,
        })
        await regre.sort({ r2: "desc", x: "asc" })
        const data = await regre.getData()

        assert.deepStrictEqual(data, [
            { x: "key3", y: "key4", slope: -0.58, yIntercept: 9.08, r2: 0.51 },
            { x: "key4", y: "key3", slope: -0.88, yIntercept: 11.61, r2: 0.51 },
            { x: "key2", y: "key3", slope: 0.17, yIntercept: 5.89, r2: 0.13 },
            { x: "key3", y: "key2", slope: 0.73, yIntercept: 3.59, r2: 0.13 },
            { x: "key2", y: "key4", slope: -0.1, yIntercept: 5.63, r2: 0.06 },
            { x: "key4", y: "key2", slope: -0.63, yIntercept: 11.97, r2: 0.06 },
        ])
    })
    it("should return the slope, yIntercept and coefficient of determination for all permutations of numeric columns and push the results to a new table with a specific name, with 2 decimals", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/dataCorrelations.json")
        const regre = await table.linearRegressions({
            decimals: 2,
            outputTable: "regr",
        })
        await regre.sort({ r2: "desc", x: "asc" })
        const data = await regre.getData()

        assert.deepStrictEqual(data, [
            { x: "key3", y: "key4", slope: -0.58, yIntercept: 9.08, r2: 0.51 },
            { x: "key4", y: "key3", slope: -0.88, yIntercept: 11.61, r2: 0.51 },
            { x: "key2", y: "key3", slope: 0.17, yIntercept: 5.89, r2: 0.13 },
            { x: "key3", y: "key2", slope: 0.73, yIntercept: 3.59, r2: 0.13 },
            { x: "key2", y: "key4", slope: -0.1, yIntercept: 5.63, r2: 0.06 },
            { x: "key4", y: "key2", slope: -0.63, yIntercept: 11.97, r2: 0.06 },
        ])
    })
    it("should return the slope, yIntercept and coefficient of determination for specific columns with a specific category", async () => {
        const temp = sdb.newTable()
        await temp.loadData("./test/data/files/dailyTemperatures.csv")
        await temp.addColumn("decade", "integer", "FLOOR(YEAR(time)/10)*10")
        await temp.summarize({
            values: "t",
            categories: ["decade", "id"],
            summaries: "mean",
        })
        await temp.linearRegressions({
            x: "decade",
            y: "mean",
            categories: "id",
            decimals: 2,
        })

        await temp.sort({ r2: "desc" })
        const data = await temp.getData()

        assert.deepStrictEqual(data, [
            {
                id: 6158355,
                x: "decade",
                y: "mean",
                slope: 0.02,
                yIntercept: -29.85,
                r2: 0.92,
            },
            {
                id: 1108380,
                x: "decade",
                y: "mean",
                slope: 0.02,
                yIntercept: -24.53,
                r2: 0.9,
            },
            {
                id: 7024745,
                x: "decade",
                y: "mean",
                slope: 0.02,
                yIntercept: -30.57,
                r2: 0.83,
            },
        ])
    })

    it("should return the slope, yIntercept and coefficient of determination for all combination of a column x and other numeric columns", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/dataCorrelations.json")
        await table.linearRegressions({
            x: "key2",
            decimals: 2,
        })
        await table.sort({ r2: "desc" })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { x: "key2", y: "key3", slope: 0.17, yIntercept: 5.89, r2: 0.13 },
            { x: "key2", y: "key4", slope: -0.1, yIntercept: 5.63, r2: 0.06 },
        ])
    })
    it("should return the slope, yIntercept and coefficient of determination for two specific columns", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/dataCorrelations.json")
        await table.linearRegressions({
            x: "key2",
            y: "key3",
            decimals: 2,
        })
        const data = await table.getData()
        assert.deepStrictEqual(data, [
            { x: "key2", y: "key3", slope: 0.17, yIntercept: 5.89, r2: 0.13 },
        ])
    })
    it("should return the slope, yIntercept and coefficient of determination for two specific columns, with a specific number of decimals", async () => {
        const table = sdb.newTable()
        await table.loadData("test/data/files/dataCorrelations.json")
        await table.linearRegressions({
            x: "key2",
            y: "key3",
            decimals: 5,
        })
        const data = await table.getData()
        assert.deepStrictEqual(data, [
            {
                x: "key2",
                y: "key3",
                slope: 0.17201,
                yIntercept: 5.89045,
                r2: 0.12512,
            },
        ])
    })
})
