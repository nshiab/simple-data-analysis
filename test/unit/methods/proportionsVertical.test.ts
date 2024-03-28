import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("proportionsVertical", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the vertical proportions in a new column", async () => {
        await simpleNodeDB.loadData("proportions", [
            "test/data/files/dataSummarize.json",
        ])
        await simpleNodeDB.proportionsVertical(
            "proportions",
            "key2",
            "key2Perc"
        )
        const data = await simpleNodeDB.getData("proportions")

        assert.deepStrictEqual(data, [
            {
                key1: "Rubarbe",
                key2: 1,
                key3: 10.5,
                key2Perc: 0.027777777777777776,
            },
            {
                key1: "Fraise",
                key2: 11,
                key3: 2.345,
                key2Perc: 0.3055555555555556,
            },
            {
                key1: "Rubarbe",
                key2: 2,
                key3: 4.5657,
                key2Perc: 0.05555555555555555,
            },
            {
                key1: "Fraise",
                key2: 22,
                key3: 12.3434,
                key2Perc: 0.6111111111111112,
            },
        ])
    })
    it("should return the vertical proportions in a new column and a specific number of decimals", async () => {
        await simpleNodeDB.loadData("proportionsSuffixDecimals", [
            "test/data/files/dataSummarize.json",
        ])
        await simpleNodeDB.proportionsVertical(
            "proportionsSuffixDecimals",
            "key2",
            "key2Prop",
            {
                decimals: 4,
            }
        )
        const data = await simpleNodeDB.getData("proportionsSuffixDecimals")

        assert.deepStrictEqual(data, [
            { key1: "Rubarbe", key2: 1, key3: 10.5, key2Prop: 0.0278 },
            { key1: "Fraise", key2: 11, key3: 2.345, key2Prop: 0.3056 },
            { key1: "Rubarbe", key2: 2, key3: 4.5657, key2Prop: 0.0556 },
            { key1: "Fraise", key2: 22, key3: 12.3434, key2Prop: 0.6111 },
        ])
    })
    it("should return the vertical proportions in a new column with a category", async () => {
        await simpleNodeDB.loadData("proportionsCategory", [
            "test/data/files/dataSummarize.json",
        ])
        await simpleNodeDB.proportionsVertical(
            "proportionsCategory",
            "key2",
            "key2Perc",
            {
                categories: "key1",
            }
        )
        await simpleNodeDB.sort("proportionsCategory", {
            key1: "asc",
            key2Perc: "asc",
        })
        const data = await simpleNodeDB.getData("proportionsCategory")

        assert.deepStrictEqual(data, [
            {
                key1: "Fraise",
                key2: 11,
                key3: 2.345,
                key2Perc: 0.3333333333333333,
            },
            {
                key1: "Fraise",
                key2: 22,
                key3: 12.3434,
                key2Perc: 0.6666666666666666,
            },
            {
                key1: "Rubarbe",
                key2: 1,
                key3: 10.5,
                key2Perc: 0.3333333333333333,
            },
            {
                key1: "Rubarbe",
                key2: 2,
                key3: 4.5657,
                key2Perc: 0.6666666666666666,
            },
        ])
    })

    it("should return the vertical proportions in a new column with multiple categories", async () => {
        await simpleNodeDB.loadData("proportionsCategories", [
            "test/data/files/dataSummarize.json",
        ])
        await simpleNodeDB.proportionsVertical(
            "proportionsCategories",
            "key3",
            "key3Perc",
            {
                categories: ["key1", "key2"],
            }
        )
        await simpleNodeDB.sort("proportionsCategories", {
            key1: "asc",
            key2: "asc",
            key3Perc: "asc",
        })
        const data = await simpleNodeDB.getData("proportionsCategories")

        assert.deepStrictEqual(data, [
            { key1: "Fraise", key2: 11, key3: 2.345, key3Perc: 1 },
            { key1: "Fraise", key2: 22, key3: 12.3434, key3Perc: 1 },
            { key1: "Rubarbe", key2: 1, key3: 10.5, key3Perc: 1 },
            { key1: "Rubarbe", key2: 2, key3: 4.5657, key3Perc: 1 },
        ])
    })
})
