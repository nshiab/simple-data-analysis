import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("correlations", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
        await sdb.loadData("someData", "test/data/files/dataCorrelations.json")
    })
    after(async function () {
        await sdb.done()
    })

    it("should give all correlations between numeric columns in the table and overwrite the current table", async () => {
        await sdb.cloneTable("someData", "someDataOverwrite")
        await sdb.correlations("someDataOverwrite")
        await sdb.sort("someDataOverwrite", { corr: "desc" })

        const data = await sdb.getData("someDataOverwrite")

        assert.deepStrictEqual(data, [
            { x: "key2", y: "key3", corr: 0.3537284140407263 },
            { x: "key2", y: "key4", corr: -0.24750187590322287 },
            { x: "key3", y: "key4", corr: -0.715142020143122 },
        ])
    })

    it("should give all correlations between numeric columns in the table and overwrite the current table, with one decimal", async () => {
        await sdb.cloneTable("someData", "someDataOverwrite")
        await sdb.correlations("someDataOverwrite", {
            decimals: 1,
        })
        await sdb.sort("someDataOverwrite", { corr: "desc" })
        const data = await sdb.getData("someDataOverwrite")

        assert.deepStrictEqual(data, [
            { x: "key2", y: "key3", corr: 0.4 },
            { x: "key2", y: "key4", corr: -0.2 },
            { x: "key3", y: "key4", corr: -0.7 },
        ])
    })

    it("should give all correlations between numeric columns in the table", async () => {
        await sdb.correlations("someData", {
            outputTable: "allCorrelations",
            decimals: 1,
        })
        await sdb.sort("allCorrelations", { corr: "desc" })
        const data = await sdb.getData("allCorrelations")

        assert.deepStrictEqual(data, [
            { x: "key2", y: "key3", corr: 0.4 },
            { x: "key2", y: "key4", corr: -0.2 },
            { x: "key3", y: "key4", corr: -0.7 },
        ])
    })

    it("should give all correlations between numeric columns with a specific x column", async () => {
        await sdb.correlations("someData", {
            outputTable: "allCorrelationsX",
            x: "key2",
            decimals: 1,
        })

        await sdb.sort("allCorrelationsX", { corr: "desc" })

        const data = await sdb.getData("allCorrelationsX")

        assert.deepStrictEqual(data, [
            { x: "key2", y: "key3", corr: 0.4 },
            { x: "key2", y: "key4", corr: -0.2 },
        ])
    })

    it("should give the correlation between two specific columns", async () => {
        await sdb.correlations("someData", {
            outputTable: "allCorrelationsX",
            x: "key2",
            y: "key3",
            decimals: 1,
        })

        const data = await sdb.getData("allCorrelationsX")

        assert.deepStrictEqual(data, [{ x: "key2", y: "key3", corr: 0.4 }])
    })
    it("should give the correlation between two specific columns and with a category", async () => {
        await sdb.loadData(
            "temperatures",
            "./test/data/files/dailyTemperatures.csv"
        )
        await sdb.addColumn(
            "temperatures",
            "decade",
            "integer",
            "FLOOR(YEAR(time)/10)*10"
        )
        await sdb.summarize("temperatures", {
            values: "t",
            categories: ["decade", "id"],
            summaries: "mean",
        })
        await sdb.correlations("temperatures", {
            x: "decade",
            y: "mean",
            categories: "id",
            decimals: 2,
        })

        await sdb.sort("temperatures", { corr: "desc" })

        const data = await sdb.getData("temperatures")

        assert.deepStrictEqual(data, [
            { id: 6158355, x: "decade", y: "mean", corr: 0.96 },
            { id: 1108380, x: "decade", y: "mean", corr: 0.95 },
            { id: 7024745, x: "decade", y: "mean", corr: 0.91 },
        ])
    })
})
