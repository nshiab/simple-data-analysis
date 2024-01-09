import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("round", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should round to the nearest integer", async () => {
        await simpleNodeDB.loadData("dataInteger", [
            "test/data/files/dataManyDecimals.csv",
        ])
        await simpleNodeDB.selectColumns("dataInteger", ["key1"])

        await simpleNodeDB.round("dataInteger", ["key1"])

        const data = await simpleNodeDB.getData("dataInteger")

        assert.deepStrictEqual(data, [
            { key1: 1 },
            { key1: 3 },
            { key1: 8 },
            { key1: 10 },
        ])
    })
    it("should round to a specific number of decimals", async () => {
        await simpleNodeDB.loadData("dataDecimals", [
            "test/data/files/dataManyDecimals.csv",
        ])
        await simpleNodeDB.selectColumns("dataDecimals", ["key1"])
        await simpleNodeDB.round("dataDecimals", ["key1"], {
            decimals: 3,
        })
        const data = await simpleNodeDB.getData("dataDecimals")

        assert.deepStrictEqual(data, [
            { key1: 1.044 },
            { key1: 3.244 },
            { key1: 8.1 },
            { key1: 10 },
        ])
    })
    it("should floor", async () => {
        await simpleNodeDB.loadData("dataFloor", [
            "test/data/files/dataManyDecimals.csv",
        ])
        await simpleNodeDB.selectColumns("dataFloor", ["key1"])
        await simpleNodeDB.round("dataFloor", ["key1"], {
            method: "floor",
        })

        const data = await simpleNodeDB.getData("dataFloor")

        assert.deepStrictEqual(data, [
            { key1: 1 },
            { key1: 3 },
            { key1: 8 },
            { key1: 10 },
        ])
    })
    it("should ceil", async () => {
        await simpleNodeDB.loadData("dataCeil", [
            "test/data/files/dataManyDecimals.csv",
        ])
        await simpleNodeDB.selectColumns("dataCeil", ["key1"])
        await simpleNodeDB.round("dataCeil", ["key1"], {
            method: "ceiling",
        })
        const data = await simpleNodeDB.getData("dataCeil")

        assert.deepStrictEqual(data, [
            { key1: 2 },
            { key1: 4 },
            { key1: 9 },
            { key1: 10 },
        ])
    })
    it("should round multiple columns", async () => {
        await simpleNodeDB.loadData("dataMultipleColumns", [
            "test/data/files/dataManyDecimals.csv",
        ])
        await simpleNodeDB.round("dataMultipleColumns", ["key1", "key2"], {
            decimals: 2,
        })
        const data = await simpleNodeDB.getData("dataMultipleColumns")

        assert.deepStrictEqual(data, [
            { key1: 1.04, key2: 2.95 },
            { key1: 3.24, key2: 4.99 },
            { key1: 8.1, key2: 34.5 },
            { key1: 10, key2: 100 },
        ])
    })
})
