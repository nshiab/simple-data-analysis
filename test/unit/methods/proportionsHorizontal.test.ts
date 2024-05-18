import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("proportionsHorizontal", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the horizontal proportions in new columns", async () => {
        await sdb.loadData("proportions", [
            "test/data/files/dataProportions.json",
        ])
        await sdb.proportionsHorizontal("proportions", ["key1", "key2", "key3"])
        const data = await sdb.getData("proportions")

        assert.deepStrictEqual(data, [
            {
                key1: 1,
                key2: 2,
                key3: 3,
                key1Perc: 0.16666666666666666,
                key2Perc: 0.3333333333333333,
                key3Perc: 0.5,
            },
            {
                key1: 4,
                key2: 5,
                key3: 6,
                key1Perc: 0.26666666666666666,
                key2Perc: 0.3333333333333333,
                key3Perc: 0.4,
            },
            {
                key1: 7,
                key2: 8,
                key3: 9,
                key1Perc: 0.2916666666666667,
                key2Perc: 0.3333333333333333,
                key3Perc: 0.375,
            },
        ])
    })

    it("should return the horizontal proportions in new columns with a specific suffix", async () => {
        await sdb.loadData("proportionsSuffix", [
            "test/data/files/dataProportions.json",
        ])
        await sdb.proportionsHorizontal(
            "proportionsSuffix",
            ["key1", "key2", "key3"],
            {
                suffix: "Prop",
            }
        )
        const data = await sdb.getData("proportionsSuffix")

        assert.deepStrictEqual(data, [
            {
                key1: 1,
                key2: 2,
                key3: 3,
                key1Prop: 0.16666666666666666,
                key2Prop: 0.3333333333333333,
                key3Prop: 0.5,
            },
            {
                key1: 4,
                key2: 5,
                key3: 6,
                key1Prop: 0.26666666666666666,
                key2Prop: 0.3333333333333333,
                key3Prop: 0.4,
            },
            {
                key1: 7,
                key2: 8,
                key3: 9,
                key1Prop: 0.2916666666666667,
                key2Prop: 0.3333333333333333,
                key3Prop: 0.375,
            },
        ])
    })

    it("should return the horizontal proportions in new columns with a specific suffix and 4 decimals", async () => {
        await sdb.loadData("proportionsSuffixDecimals", [
            "test/data/files/dataProportions.json",
        ])
        await sdb.proportionsHorizontal(
            "proportionsSuffixDecimals",
            ["key1", "key2", "key3"],
            {
                suffix: "Prop",
                decimals: 4,
            }
        )
        const data = await sdb.getData("proportionsSuffixDecimals")

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
