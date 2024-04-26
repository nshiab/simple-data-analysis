import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("linearRegressions", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
        await simpleNodeDB.loadData(
            "someData",
            "test/data/files/dataCorrelations.json"
        )
    })
    after(async function () {
        await simpleNodeDB.done()
    })
    it("should return the slope, yIntercept and coefficient of determination for all permutations of numeric columns and overwrite the current table with the results", async () => {
        await simpleNodeDB.cloneTable("someData", "someDataCloned")
        await simpleNodeDB.linearRegressions("someDataCloned")
        await simpleNodeDB.sort("someDataCloned", { r2: "desc", x: "asc" })
        const data = await simpleNodeDB.getData("someDataCloned")

        assert.deepStrictEqual(data, [
            {
                x: "key3",
                y: "key4",
                slope: -0.5817374126568399,
                yIntercept: 9.07726828748322,
                r2: 0.5114281089743855,
            },
            {
                x: "key4",
                y: "key3",
                slope: -0.8791391061452515,
                yIntercept: 11.614435754189945,
                r2: 0.5114281089743855,
            },
            {
                x: "key3",
                y: "key2",
                slope: 0.7274298891809314,
                yIntercept: 3.588994583580412,
                r2: 0.1251237908997675,
            },
            {
                x: "key2",
                y: "key3",
                slope: 0.17200804195804195,
                yIntercept: 5.890452622377623,
                r2: 0.1251237908997674,
            },
            {
                x: "key4",
                y: "key2",
                slope: -0.6256983240223464,
                yIntercept: 11.972067039106145,
                r2: 0.06125717857561433,
            },
            {
                x: "key2",
                y: "key4",
                slope: -0.09790209790209789,
                yIntercept: 5.631118881118881,
                r2: 0.061257178575614316,
            },
        ])
    })

    it("should return the slope, yIntercept and coefficient of determination for all permutations of numeric columns and overwrite the current table with the results, with 2 decimals", async () => {
        await simpleNodeDB.cloneTable("someData", "someDataCloned")
        await simpleNodeDB.linearRegressions("someDataCloned", { decimals: 2 })
        await simpleNodeDB.sort("someDataCloned", { r2: "desc", x: "asc" })
        const data = await simpleNodeDB.getData("someDataCloned")

        assert.deepStrictEqual(data, [
            { x: "key3", y: "key4", slope: -0.58, yIntercept: 9.08, r2: 0.51 },
            { x: "key4", y: "key3", slope: -0.88, yIntercept: 11.61, r2: 0.51 },
            { x: "key2", y: "key3", slope: 0.17, yIntercept: 5.89, r2: 0.13 },
            { x: "key3", y: "key2", slope: 0.73, yIntercept: 3.59, r2: 0.13 },
            { x: "key2", y: "key4", slope: -0.1, yIntercept: 5.63, r2: 0.06 },
            { x: "key4", y: "key2", slope: -0.63, yIntercept: 11.97, r2: 0.06 },
        ])
    })

    it("should return the slope, yIntercept and coefficient of determination for all permutations of numeric columns", async () => {
        await simpleNodeDB.linearRegressions("someData", {
            outputTable: "linearRegressions",
            decimals: 2,
        })
        await simpleNodeDB.sort("linearRegressions", { r2: "desc", x: "asc" })
        const data = await simpleNodeDB.getData("linearRegressions")

        assert.deepStrictEqual(data, [
            { x: "key3", y: "key4", slope: -0.58, yIntercept: 9.08, r2: 0.51 },
            { x: "key4", y: "key3", slope: -0.88, yIntercept: 11.61, r2: 0.51 },
            { x: "key2", y: "key3", slope: 0.17, yIntercept: 5.89, r2: 0.13 },
            { x: "key3", y: "key2", slope: 0.73, yIntercept: 3.59, r2: 0.13 },
            { x: "key2", y: "key4", slope: -0.1, yIntercept: 5.63, r2: 0.06 },
            { x: "key4", y: "key2", slope: -0.63, yIntercept: 11.97, r2: 0.06 },
        ])
    })

    // To redo with climate data
    it("should return the slope, yIntercept and coefficient of determination for specific columns with a specific category", async () => {
        await simpleNodeDB.loadData(
            "temperatures",
            "./test/data/files/dailyTemperatures.csv"
        )
        await simpleNodeDB.addColumn(
            "temperatures",
            "decade",
            "integer",
            "FLOOR(YEAR(time)/10)*10"
        )
        await simpleNodeDB.summarize("temperatures", {
            values: "t",
            categories: ["decade", "id"],
            summaries: "mean",
        })
        await simpleNodeDB.linearRegressions("temperatures", {
            x: "decade",
            y: "mean",
            categories: "id",
            decimals: 2,
        })

        await simpleNodeDB.sort("temperatures", { r2: "desc" })
        const data = await simpleNodeDB.getData("temperatures")

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
        await simpleNodeDB.linearRegressions("someData", {
            outputTable: "linearRegressions",
            x: "key2",
            decimals: 2,
        })
        await simpleNodeDB.sort("linearRegressions", { r2: "desc" })
        const data = await simpleNodeDB.getData("linearRegressions")

        assert.deepStrictEqual(data, [
            { x: "key2", y: "key3", slope: 0.17, yIntercept: 5.89, r2: 0.13 },
            { x: "key2", y: "key4", slope: -0.1, yIntercept: 5.63, r2: 0.06 },
        ])
    })
    it("should return the slope, yIntercept and coefficient of determination for two specific columns", async () => {
        await simpleNodeDB.linearRegressions("someData", {
            outputTable: "linearRegressions",
            x: "key2",
            y: "key3",
            decimals: 2,
        })
        const data = await simpleNodeDB.getData("linearRegressions")
        assert.deepStrictEqual(data, [
            { x: "key2", y: "key3", slope: 0.17, yIntercept: 5.89, r2: 0.13 },
        ])
    })
    it("should return the slope, yIntercept and coefficient of determination for two specific columns, with a specific number of decimals", async () => {
        await simpleNodeDB.linearRegressions("someData", {
            outputTable: "linearRegressions",
            x: "key2",
            y: "key3",
            decimals: 5,
        })
        const data = await simpleNodeDB.getData("linearRegressions")
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
