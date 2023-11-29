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
    // it("should return the slope, yIntercept and coefficient of determination for all permutations of numeric columns for a specific category", async () => {
    //     await simpleNodeDB.linearRegressions("someData", {
    //         categories: "key1",
    //         outputTable: "linearRegressions",
    //         returnDataFrom: "table",
    //     })
    //     await simpleNodeDB.sort("linearRegressions", {
    //         key1: "asc",
    //         r2: "desc",
    //         x: "asc",
    //         y: "asc",
    //     })
    //     const data = await simpleNodeDB.getData("linearRegressions")

    //     assert.deepStrictEqual(data, [
    //         {
    //             key1: "Fraise",
    //             x: "key2",
    //             y: "key3",
    //             slope: 0.91,
    //             yIntercept: -7.65,
    //             r2: 1,
    //         },
    //         {
    //             key1: "Fraise",
    //             x: "key2",
    //             y: "key4",
    //             slope: -0.82,
    //             yIntercept: 19,
    //             r2: 1,
    //         },
    //         {
    //             key1: "Fraise",
    //             x: "key3",
    //             y: "key2",
    //             slope: 1.1,
    //             yIntercept: 8.42,
    //             r2: 1,
    //         },
    //         {
    //             key1: "Fraise",
    //             x: "key3",
    //             y: "key4",
    //             slope: -0.9,
    //             yIntercept: 12.11,
    //             r2: 1,
    //         },
    //         {
    //             key1: "Fraise",
    //             x: "key4",
    //             y: "key2",
    //             slope: -1.22,
    //             yIntercept: 23.22,
    //             r2: 1,
    //         },
    //         {
    //             key1: "Fraise",
    //             x: "key4",
    //             y: "key3",
    //             slope: -1.11,
    //             yIntercept: 13.45,
    //             r2: 1,
    //         },
    //         {
    //             key1: "Rubarbe",
    //             x: "key2",
    //             y: "key3",
    //             slope: -5.93,
    //             yIntercept: 16.43,
    //             r2: 1,
    //         },
    //         {
    //             key1: "Rubarbe",
    //             x: "key2",
    //             y: "key4",
    //             slope: -2,
    //             yIntercept: 7,
    //             r2: 1,
    //         },
    //         {
    //             key1: "Rubarbe",
    //             x: "key3",
    //             y: "key2",
    //             slope: -0.17,
    //             yIntercept: 2.77,
    //             r2: 1,
    //         },
    //         {
    //             key1: "Rubarbe",
    //             x: "key3",
    //             y: "key4",
    //             slope: 0.34,
    //             yIntercept: 1.46,
    //             r2: 1,
    //         },
    //         {
    //             key1: "Rubarbe",
    //             x: "key4",
    //             y: "key2",
    //             slope: -0.5,
    //             yIntercept: 3.5,
    //             r2: 1,
    //         },
    //         {
    //             key1: "Rubarbe",
    //             x: "key4",
    //             y: "key3",
    //             slope: 2.97,
    //             yIntercept: -4.34,
    //             r2: 1,
    //         },
    //     ])
    // })

    it("should return the slope, yIntercept and coefficient of determination for all combination of a column x and other numeric columns", async () => {
        await simpleNodeDB.linearRegressions("someData", {
            outputTable: "linearRegressions",
            x: "key2",
        })
        await simpleNodeDB.sort("linearRegressions", { r2: "desc" })
        const data = await simpleNodeDB.getData("linearRegressions")

        assert.deepStrictEqual(data, [
            { x: "key2", y: "key3", slope: 0.17, yIntercept: 5.89, r2: 0.13 },
            { x: "key2", y: "key4", slope: -0.1, yIntercept: 5.63, r2: 0.06 },
        ])
    })
    it("should return the slope, yIntercept and coefficient of determination for two specific columns", async () => {
        const data = await simpleNodeDB.linearRegressions("someData", {
            outputTable: "linearRegressions",
            x: "key2",
            y: "key3",
            returnDataFrom: "table",
        })
        assert.deepStrictEqual(data, [
            { x: "key2", y: "key3", slope: 0.17, yIntercept: 5.89, r2: 0.13 },
        ])
    })
    it("should return the slope, yIntercept and coefficient of determination for two specific columns, with a specific number of decimals", async () => {
        const data = await simpleNodeDB.linearRegressions("someData", {
            outputTable: "linearRegressions",
            x: "key2",
            y: "key3",
            decimals: 5,
            returnDataFrom: "table",
        })
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
