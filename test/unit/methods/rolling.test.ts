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

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [
            { value: 52, rollingAvg: null },
            { value: 76, rollingAvg: null },
            { value: 36, rollingAvg: null },
            { value: 95, rollingAvg: 54.43 },
            { value: 40, rollingAvg: 47.57 },
            { value: 19, rollingAvg: 48.57 },
            { value: 63, rollingAvg: 49.29 },
            { value: 4, rollingAvg: null },
            { value: 83, rollingAvg: null },
            { value: 41, rollingAvg: null },
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

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [
            { value: 52, rollingAvg: null },
            { value: 76, rollingAvg: null },
            { value: 36, rollingAvg: null },
            { value: 95, rollingAvg: 54.4286 },
            { value: 40, rollingAvg: 47.5714 },
            { value: 19, rollingAvg: 48.5714 },
            { value: 63, rollingAvg: 49.2857 },
            { value: 4, rollingAvg: null },
            { value: 83, rollingAvg: null },
            { value: 41, rollingAvg: null },
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

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [
            { value: 52, rollingMax: 95 },
            { value: 76, rollingMax: 95 },
            { value: 36, rollingMax: 95 },
            { value: 95, rollingMax: 95 },
            { value: 40, rollingMax: 63 },
            { value: 19, rollingMax: 83 },
            { value: 63, rollingMax: 83 },
            { value: 4, rollingMax: null },
            { value: 83, rollingMax: null },
            { value: 41, rollingMax: null },
        ])
    })
    it("should compute a rolling max with 0 preceding and 3 following, and a category", async () => {
        await simpleNodeDB.loadArray("data", [
            { group: "a", value: 52 },
            { group: "a", value: 76 },
            { group: "a", value: 36 },
            { group: "a", value: 95 },
            { group: "a", value: 40 },
            { group: "b", value: 19 },
            { group: "b", value: 63 },
            { group: "b", value: 4 },
            { group: "b", value: 83 },
            { group: "b", value: 41 },
        ])

        await simpleNodeDB.rolling("data", "value", "rollingMax", "max", 0, 3, {
            categories: "group",
        })

        const data = await simpleNodeDB.getData("data")

        assert.deepStrictEqual(data, [
            { group: "b", value: 19, rollingMax: 83 },
            { group: "b", value: 63, rollingMax: 83 },
            { group: "b", value: 4, rollingMax: null },
            { group: "b", value: 83, rollingMax: null },
            { group: "b", value: 41, rollingMax: null },
            { group: "a", value: 52, rollingMax: 95 },
            { group: "a", value: 76, rollingMax: 95 },
            { group: "a", value: 36, rollingMax: null },
            { group: "a", value: 95, rollingMax: null },
            { group: "a", value: 40, rollingMax: null },
        ])
    })
})
