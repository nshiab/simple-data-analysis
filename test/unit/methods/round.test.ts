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
})
