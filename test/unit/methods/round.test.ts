import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("round", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should round to the nearest integer", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/dataManyDecimals.csv"])
        await table.selectColumns(["key1"])

        await table.round(["key1"])

        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { key1: 1 },
            { key1: 3 },
            { key1: 8 },
            { key1: 10 },
        ])
    })
    it("should round to a specific number of decimals", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/dataManyDecimals.csv"])
        await table.selectColumns(["key1"])
        await table.round(["key1"], {
            decimals: 3,
        })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { key1: 1.044 },
            { key1: 3.244 },
            { key1: 8.1 },
            { key1: 10 },
        ])
    })
    it("should floor", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/dataManyDecimals.csv"])
        await table.selectColumns(["key1"])
        await table.round(["key1"], {
            method: "floor",
        })

        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { key1: 1 },
            { key1: 3 },
            { key1: 8 },
            { key1: 10 },
        ])
    })
    it("should ceil", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/dataManyDecimals.csv"])
        await table.selectColumns(["key1"])
        await table.round(["key1"], {
            method: "ceiling",
        })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { key1: 2 },
            { key1: 4 },
            { key1: 9 },
            { key1: 10 },
        ])
    })
    it("should round multiple columns", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/dataManyDecimals.csv"])
        await table.round(["key1", "key2"], {
            decimals: 2,
        })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { key1: 1.04, key2: 2.95 },
            { key1: 3.24, key2: 4.99 },
            { key1: 8.1, key2: 34.5 },
            { key1: 10, key2: 100 },
        ])
    })
})
