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
        await simpleNodeDB.sort("someDataOverwrite", { corr: "desc" })
        const data = await simpleNodeDB.getData("someDataOverwrite")

        assert.deepStrictEqual(data, [
            { x: "key2", y: "key3", corr: 0.4 },
            { x: "key2", y: "key4", corr: -0.2 },
            { x: "key3", y: "key4", corr: -0.7 },
        ])
    })

    it("should give all correlations between numeric columns in the table", async () => {
        await simpleNodeDB.correlations("someData", {
            outputTable: "allCorrelations",
            decimals: 1,
        })
        const data = await simpleNodeDB.sort(
            "allCorrelations",
            { corr: "desc" },
            { returnDataFrom: "table" }
        )

        assert.deepStrictEqual(data, [
            { x: "key2", y: "key3", corr: 0.4 },
            { x: "key2", y: "key4", corr: -0.2 },
            { x: "key3", y: "key4", corr: -0.7 },
        ])
    })

    it("should give all correlations between numeric columns with a specific x column", async () => {
        await simpleNodeDB.correlations("someData", {
            outputTable: "allCorrelationsX",
            x: "key2",
            decimals: 1,
        })

        const data = await simpleNodeDB.sort(
            "allCorrelationsX",
            { corr: "desc" },
            { returnDataFrom: "table" }
        )

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
    it("should give the correlation between two specific columns and with a category", async () => {
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
        await simpleNodeDB.correlations("temperatures", {
            x: "decade",
            y: "mean",
            categories: "id",
        })

        await simpleNodeDB.sort("temperatures", { corr: "desc" })

        const data = await simpleNodeDB.getData("temperatures")

        assert.deepStrictEqual(data, [
            { id: 6158355, x: "decade", y: "mean", corr: 0.96 },
            { id: 1108380, x: "decade", y: "mean", corr: 0.95 },
            { id: 7024745, x: "decade", y: "mean", corr: 0.91 },
        ])
    })
})
