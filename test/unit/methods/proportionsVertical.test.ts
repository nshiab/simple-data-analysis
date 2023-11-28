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
        const data = await simpleNodeDB.proportionsVertical(
            "proportions",
            "key2",
            "key2Perc",
            {
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            { key1: "Rubarbe", key2: 1, key3: 10.5, key2Perc: 0.03 },
            { key1: "Fraise", key2: 11, key3: 2.345, key2Perc: 0.31 },
            { key1: "Rubarbe", key2: 2, key3: 4.5657, key2Perc: 0.06 },
            { key1: "Fraise", key2: 22, key3: 12.3434, key2Perc: 0.61 },
        ])
    })
    it("should return the vertical proportions in a new column and a specific number of decimals", async () => {
        await simpleNodeDB.loadData("proportionsSuffixDecimals", [
            "test/data/files/dataSummarize.json",
        ])
        const data = await simpleNodeDB.proportionsVertical(
            "proportionsSuffixDecimals",
            "key2",
            "key2Prop",
            {
                decimals: 4,
                returnDataFrom: "table",
            }
        )

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
        const data = await simpleNodeDB.proportionsVertical(
            "proportionsCategory",
            "key2",
            "key2Perc",
            {
                categories: "key1",
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            { key1: "Fraise", key2: 11, key3: 2.345, key2Perc: 0.33 },
            { key1: "Fraise", key2: 22, key3: 12.3434, key2Perc: 0.67 },
            { key1: "Rubarbe", key2: 1, key3: 10.5, key2Perc: 0.33 },
            { key1: "Rubarbe", key2: 2, key3: 4.5657, key2Perc: 0.67 },
        ])
    })

    it("should return the vertical proportions in a new column with multiple categories", async () => {
        await simpleNodeDB.loadData("proportionsCategories", [
            "test/data/files/dataSummarize.json",
        ])
        const data = await simpleNodeDB.proportionsVertical(
            "proportionsCategories",
            "key3",
            "key3Perc",
            {
                categories: ["key1", "key2"],
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            { key1: "Fraise", key2: 11, key3: 2.345, key3Perc: 1 },
            { key1: "Fraise", key2: 22, key3: 12.3434, key3Perc: 1 },
            { key1: "Rubarbe", key2: 1, key3: 10.5, key3Perc: 1 },
            { key1: "Rubarbe", key2: 2, key3: 4.5657, key3Perc: 1 },
        ])
    })
})
