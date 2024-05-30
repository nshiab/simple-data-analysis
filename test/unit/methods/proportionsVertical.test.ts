import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("proportionsVertical", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return the vertical proportions in a new column", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/dataSummarize.json"])
        await table.proportionsVertical("key2", "key2Perc")
        const data = await table.getData()

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
            {
                key1: "Banane",
                key2: null,
                key3: null,
                key2Perc: null,
            },
            {
                key1: "Banane",
                key2: null,
                key3: null,
                key2Perc: null,
            },
        ])
    })
    it("should return the vertical proportions in a new column and a specific number of decimals", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/dataSummarize.json"])
        await table.proportionsVertical("key2", "key2Prop", {
            decimals: 4,
        })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { key1: "Rubarbe", key2: 1, key3: 10.5, key2Prop: 0.0278 },
            { key1: "Fraise", key2: 11, key3: 2.345, key2Prop: 0.3056 },
            { key1: "Rubarbe", key2: 2, key3: 4.5657, key2Prop: 0.0556 },
            { key1: "Fraise", key2: 22, key3: 12.3434, key2Prop: 0.6111 },
            {
                key1: "Banane",
                key2: null,
                key3: null,
                key2Prop: null,
            },
            {
                key1: "Banane",
                key2: null,
                key3: null,
                key2Prop: null,
            },
        ])
    })
    it("should return the vertical proportions in a new column with a category", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/dataSummarize.json"])
        await table.proportionsVertical("key2", "key2Perc", {
            categories: "key1",
        })
        await table.sort({
            key1: "asc",
            key2Perc: "asc",
        })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            {
                key1: "Banane",
                key2: null,
                key3: null,
                key2Perc: null,
            },
            {
                key1: "Banane",
                key2: null,
                key3: null,
                key2Perc: null,
            },
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
        const table = sdb.newTable()
        await table.loadData(["test/data/files/dataSummarize.json"])
        await table.proportionsVertical("key3", "key3Perc", {
            categories: ["key1", "key2"],
        })
        await table.sort({
            key1: "asc",
            key2: "asc",
            key3Perc: "asc",
        })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            {
                key1: "Banane",
                key2: null,
                key3: null,
                key3Perc: null,
            },
            {
                key1: "Banane",
                key2: null,
                key3: null,
                key3Perc: null,
            },
            { key1: "Fraise", key2: 11, key3: 2.345, key3Perc: 1 },
            { key1: "Fraise", key2: 22, key3: 12.3434, key3Perc: 1 },
            { key1: "Rubarbe", key2: 1, key3: 10.5, key3Perc: 1 },
            { key1: "Rubarbe", key2: 2, key3: 4.5657, key3Perc: 1 },
        ])
    })
})
