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
        await sdb.loadData("dataInteger", [
            "test/data/files/dataManyDecimals.csv",
        ])
        await sdb.selectColumns("dataInteger", ["key1"])

        await sdb.round("dataInteger", ["key1"])

        const data = await sdb.getData("dataInteger")

        assert.deepStrictEqual(data, [
            { key1: 1 },
            { key1: 3 },
            { key1: 8 },
            { key1: 10 },
        ])
    })
    it("should round to a specific number of decimals", async () => {
        await sdb.loadData("dataDecimals", [
            "test/data/files/dataManyDecimals.csv",
        ])
        await sdb.selectColumns("dataDecimals", ["key1"])
        await sdb.round("dataDecimals", ["key1"], {
            decimals: 3,
        })
        const data = await sdb.getData("dataDecimals")

        assert.deepStrictEqual(data, [
            { key1: 1.044 },
            { key1: 3.244 },
            { key1: 8.1 },
            { key1: 10 },
        ])
    })
    it("should floor", async () => {
        await sdb.loadData("dataFloor", [
            "test/data/files/dataManyDecimals.csv",
        ])
        await sdb.selectColumns("dataFloor", ["key1"])
        await sdb.round("dataFloor", ["key1"], {
            method: "floor",
        })

        const data = await sdb.getData("dataFloor")

        assert.deepStrictEqual(data, [
            { key1: 1 },
            { key1: 3 },
            { key1: 8 },
            { key1: 10 },
        ])
    })
    it("should ceil", async () => {
        await sdb.loadData("dataCeil", ["test/data/files/dataManyDecimals.csv"])
        await sdb.selectColumns("dataCeil", ["key1"])
        await sdb.round("dataCeil", ["key1"], {
            method: "ceiling",
        })
        const data = await sdb.getData("dataCeil")

        assert.deepStrictEqual(data, [
            { key1: 2 },
            { key1: 4 },
            { key1: 9 },
            { key1: 10 },
        ])
    })
    it("should round multiple columns", async () => {
        await sdb.loadData("dataMultipleColumns", [
            "test/data/files/dataManyDecimals.csv",
        ])
        await sdb.round("dataMultipleColumns", ["key1", "key2"], {
            decimals: 2,
        })
        const data = await sdb.getData("dataMultipleColumns")

        assert.deepStrictEqual(data, [
            { key1: 1.04, key2: 2.95 },
            { key1: 3.24, key2: 4.99 },
            { key1: 8.1, key2: 34.5 },
            { key1: 10, key2: 100 },
        ])
    })
})
