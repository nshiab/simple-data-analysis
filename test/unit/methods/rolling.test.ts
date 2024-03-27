import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("rolling", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should compute a rolling average with 3 preceding and 3 following", async () => {
        await simpleNodeDB.loadArray("data", [
            { value: 52 },
            { value: 76 },
            { value: 36 },
            { value: 95 },
            { value: 40 },
            { value: 19 },
            { value: 63 },
            { value: 4 },
            { value: 83 },
            { value: 41 },
        ])

        await simpleNodeDB.rolling("data", "value", "rollingAvg", "mean", 3, 3)
        await simpleNodeDB.rolling(
            "data",
            "value",
            "countAggregated",
            "count",
            3,
            3
        )

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [
            { value: 52, rollingAvg: 64.75, countAggregated: 4 },
            { value: 76, rollingAvg: 59.8, countAggregated: 5 },
            { value: 36, rollingAvg: 53, countAggregated: 6 },
            { value: 95, rollingAvg: 54.43, countAggregated: 7 },
            { value: 40, rollingAvg: 47.57, countAggregated: 7 },
            { value: 19, rollingAvg: 48.57, countAggregated: 7 },
            { value: 63, rollingAvg: 49.29, countAggregated: 7 },
            { value: 4, rollingAvg: 41.67, countAggregated: 6 },
            { value: 83, rollingAvg: 42, countAggregated: 5 },
            { value: 41, rollingAvg: 47.75, countAggregated: 4 },
        ])
    })
    it("should compute a rolling average with 3 preceding and 3 following, and 4 decimals", async () => {
        await simpleNodeDB.loadArray("data", [
            { value: 52 },
            { value: 76 },
            { value: 36 },
            { value: 95 },
            { value: 40 },
            { value: 19 },
            { value: 63 },
            { value: 4 },
            { value: 83 },
            { value: 41 },
        ])

        await simpleNodeDB.rolling(
            "data",
            "value",
            "rollingAvg",
            "mean",
            3,
            3,
            { decimals: 4 }
        )
        await simpleNodeDB.rolling(
            "data",
            "value",
            "countAggregated",
            "count",
            3,
            3
        )

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [
            { value: 52, rollingAvg: 64.75, countAggregated: 4 },
            { value: 76, rollingAvg: 59.8, countAggregated: 5 },
            { value: 36, rollingAvg: 53, countAggregated: 6 },
            { value: 95, rollingAvg: 54.4286, countAggregated: 7 },
            { value: 40, rollingAvg: 47.5714, countAggregated: 7 },
            { value: 19, rollingAvg: 48.5714, countAggregated: 7 },
            { value: 63, rollingAvg: 49.2857, countAggregated: 7 },
            { value: 4, rollingAvg: 41.6667, countAggregated: 6 },
            { value: 83, rollingAvg: 42, countAggregated: 5 },
            { value: 41, rollingAvg: 47.75, countAggregated: 4 },
        ])
    })
    it("should compute a rolling max with 0 preceding and 3 following", async () => {
        await simpleNodeDB.loadArray("data", [
            { value: 52 },
            { value: 76 },
            { value: 36 },
            { value: 95 },
            { value: 40 },
            { value: 19 },
            { value: 63 },
            { value: 4 },
            { value: 83 },
            { value: 41 },
        ])

        await simpleNodeDB.rolling("data", "value", "rollingMax", "max", 0, 3)
        await simpleNodeDB.rolling(
            "data",
            "value",
            "countAggregated",
            "count",
            0,
            3
        )

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [
            { value: 52, rollingMax: 95, countAggregated: 4 },
            { value: 76, rollingMax: 95, countAggregated: 4 },
            { value: 36, rollingMax: 95, countAggregated: 4 },
            { value: 95, rollingMax: 95, countAggregated: 4 },
            { value: 40, rollingMax: 63, countAggregated: 4 },
            { value: 19, rollingMax: 83, countAggregated: 4 },
            { value: 63, rollingMax: 83, countAggregated: 4 },
            { value: 4, rollingMax: 83, countAggregated: 3 },
            { value: 83, rollingMax: 83, countAggregated: 2 },
            { value: 41, rollingMax: 41, countAggregated: 1 },
        ])
    })
})
