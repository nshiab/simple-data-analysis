import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("correlations", () => {
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

    it("should give all correlations between numeric columns in the table and overwrite the current table", async () => {
        await simpleNodeDB.cloneTable("someData", "someDataOverwrite")
        await simpleNodeDB.correlations("someDataOverwrite", {
            decimals: 1,
        })

        const data = await simpleNodeDB.getData("someDataOverwrite")

        assert.deepStrictEqual(data, [
            { x: "key2", y: "key3", corr: 0.4 },
            { x: "key2", y: "key4", corr: -0.2 },
            { x: "key3", y: "key4", corr: -0.7 },
        ])
    })

    it("should give all correlations between numeric columns in the table", async () => {
        const data = await simpleNodeDB.correlations("someData", {
            outputTable: "allCorrelations",
            returnDataFrom: "table",
            decimals: 1,
        })

        assert.deepStrictEqual(data, [
            { x: "key2", y: "key3", corr: 0.4 },
            { x: "key2", y: "key4", corr: -0.2 },
            { x: "key3", y: "key4", corr: -0.7 },
        ])
    })

    it("should give all correlations between numeric columns in the table and sort the correlation values in ascending order", async () => {
        const data = await simpleNodeDB.correlations("someData", {
            outputTable: "allCorrelations",
            returnDataFrom: "table",
            decimals: 1,
            order: "asc",
        })

        assert.deepStrictEqual(data, [
            { x: "key3", y: "key4", corr: -0.7 },
            { x: "key2", y: "key4", corr: -0.2 },
            { x: "key2", y: "key3", corr: 0.4 },
        ])
    })

    it("should give all correlations between numeric columns with a specific x column", async () => {
        const data = await simpleNodeDB.correlations("someData", {
            outputTable: "allCorrelationsX",
            x: "key2",
            returnDataFrom: "table",
            decimals: 1,
        })

        assert.deepStrictEqual(data, [
            { x: "key2", y: "key3", corr: 0.4 },
            { x: "key2", y: "key4", corr: -0.2 },
        ])
    })

    it("should give the correlation between two specific columns", async () => {
        const data = await simpleNodeDB.correlations("someData", {
            outputTable: "allCorrelationsX",
            x: "key2",
            y: "key3",
            returnDataFrom: "table",
            decimals: 1,
        })

        assert.deepStrictEqual(data, [{ x: "key2", y: "key3", corr: 0.4 }])
    })
})
