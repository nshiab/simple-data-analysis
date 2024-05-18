import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("normalize", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })
    it("should normalize values in a column", async () => {
        await sdb.loadData("data", "test/data/files/dataSummarize.json")

        await sdb.normalize("data", "key2", "normalized")
        await sdb.sort("data", { normalized: "asc" })

        const data = await sdb.getData("data")

        assert.deepStrictEqual(data, [
            { key1: "Rubarbe", key2: 1, key3: 10.5, normalized: 0 },
            {
                key1: "Rubarbe",
                key2: 2,
                key3: 4.5657,
                normalized: 0.047619047619047616,
            },
            {
                key1: "Fraise",
                key2: 11,
                key3: 2.345,
                normalized: 0.47619047619047616,
            },
            { key1: "Fraise", key2: 22, key3: 12.3434, normalized: 1 },
            { key1: "Banane", key2: null, key3: null, normalized: null },
            { key1: "Banane", key2: null, key3: null, normalized: null },
        ])
    })
    it("should normalize values in a column with two decimals", async () => {
        await sdb.loadData("data", "test/data/files/dataSummarize.json")

        await sdb.normalize("data", "key2", "normalized", {
            decimals: 2,
        })
        await sdb.sort("data", { normalized: "asc" })

        const data = await sdb.getData("data")

        assert.deepStrictEqual(data, [
            { key1: "Rubarbe", key2: 1, key3: 10.5, normalized: 0 },
            { key1: "Rubarbe", key2: 2, key3: 4.5657, normalized: 0.05 },
            { key1: "Fraise", key2: 11, key3: 2.345, normalized: 0.48 },
            { key1: "Fraise", key2: 22, key3: 12.3434, normalized: 1 },
            { key1: "Banane", key2: null, key3: null, normalized: null },
            { key1: "Banane", key2: null, key3: null, normalized: null },
        ])
    })
    it("should normalize values in a column and keep 4 decimals", async () => {
        await sdb.loadData("data", "test/data/files/dataSummarize.json")

        await sdb.normalize("data", "key2", "normalized", {
            decimals: 4,
        })
        await sdb.sort("data", { normalized: "asc" })

        const data = await sdb.getData("data")

        assert.deepStrictEqual(data, [
            { key1: "Rubarbe", key2: 1, key3: 10.5, normalized: 0 },
            { key1: "Rubarbe", key2: 2, key3: 4.5657, normalized: 0.0476 },
            { key1: "Fraise", key2: 11, key3: 2.345, normalized: 0.4762 },
            { key1: "Fraise", key2: 22, key3: 12.3434, normalized: 1 },
            { key1: "Banane", key2: null, key3: null, normalized: null },
            { key1: "Banane", key2: null, key3: null, normalized: null },
        ])
    })
    it("should normalize values in a column with categories", async () => {
        await sdb.loadData("data", "test/data/files/dataSummarize.json")

        await sdb.normalize("data", "key2", "normalized", {
            categories: "key1",
        })
        await sdb.sort("data", { key3: "asc" })

        const data = await sdb.getData("data")

        assert.deepStrictEqual(data, [
            { key1: "Fraise", key2: 11, key3: 2.345, normalized: 0 },
            { key1: "Rubarbe", key2: 2, key3: 4.5657, normalized: 1 },
            { key1: "Rubarbe", key2: 1, key3: 10.5, normalized: 0 },
            { key1: "Fraise", key2: 22, key3: 12.3434, normalized: 1 },
            { key1: "Banane", key2: null, key3: null, normalized: null },
            { key1: "Banane", key2: null, key3: null, normalized: null },
        ])
    })
})
