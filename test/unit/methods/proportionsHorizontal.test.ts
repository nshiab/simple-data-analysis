import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("proportionsHorizontal", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the horizontal proportions in new columns", async () => {
        await simpleNodeDB.loadData("proportions", [
            "test/data/files/dataProportions.json",
        ])
        const data = await simpleNodeDB.proportionsHorizontal(
            "proportions",
            ["key1", "key2", "key3"],
            {
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            {
                key1: 1,
                key2: 2,
                key3: 3,
                key1Perc: 0.17,
                key2Perc: 0.33,
                key3Perc: 0.5,
            },
            {
                key1: 4,
                key2: 5,
                key3: 6,
                key1Perc: 0.27,
                key2Perc: 0.33,
                key3Perc: 0.4,
            },
            {
                key1: 7,
                key2: 8,
                key3: 9,
                key1Perc: 0.29,
                key2Perc: 0.33,
                key3Perc: 0.38,
            },
        ])
    })

    it("should return the horizontal proportions in new columns with a specific suffix", async () => {
        await simpleNodeDB.loadData("proportionsSuffix", [
            "test/data/files/dataProportions.json",
        ])
        const data = await simpleNodeDB.proportionsHorizontal(
            "proportionsSuffix",
            ["key1", "key2", "key3"],
            {
                suffix: "Prop",
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            {
                key1: 1,
                key2: 2,
                key3: 3,
                key1Prop: 0.17,
                key2Prop: 0.33,
                key3Prop: 0.5,
            },
            {
                key1: 4,
                key2: 5,
                key3: 6,
                key1Prop: 0.27,
                key2Prop: 0.33,
                key3Prop: 0.4,
            },
            {
                key1: 7,
                key2: 8,
                key3: 9,
                key1Prop: 0.29,
                key2Prop: 0.33,
                key3Prop: 0.38,
            },
        ])
    })

    it("should return the horizontal proportions in new columns with a specific suffix and 4 decimals", async () => {
        await simpleNodeDB.loadData("proportionsSuffixDecimals", [
            "test/data/files/dataProportions.json",
        ])
        const data = await simpleNodeDB.proportionsHorizontal(
            "proportionsSuffixDecimals",
            ["key1", "key2", "key3"],
            {
                suffix: "Prop",
                decimals: 4,
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            {
                key1: 1,
                key2: 2,
                key3: 3,
                key1Prop: 0.1667,
                key2Prop: 0.3333,
                key3Prop: 0.5,
            },
            {
                key1: 4,
                key2: 5,
                key3: 6,
                key1Prop: 0.2667,
                key2Prop: 0.3333,
                key3Prop: 0.4,
            },
            {
                key1: 7,
                key2: 8,
                key3: 9,
                key1Prop: 0.2917,
                key2Prop: 0.3333,
                key3Prop: 0.375,
            },
        ])
    })
})
