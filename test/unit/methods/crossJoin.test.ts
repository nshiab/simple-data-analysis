import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("crossJoin", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return all pairs of rows", async () => {
        await simpleNodeDB.loadArray("numbers", [
            { key1: 1 },
            { key1: 2 },
            { key1: 3 },
            { key1: 4 },
        ])
        await simpleNodeDB.loadArray("letters", [
            { key2: "a" },
            { key2: "b" },
            { key2: "c" },
            { key2: "d" },
        ])
        await simpleNodeDB.crossJoin("numbers", "letters")
        const data = await simpleNodeDB.getData("numbers")
        assert.deepStrictEqual(data, [
            { key1: 1, key2: "a" },
            { key1: 1, key2: "b" },
            { key1: 1, key2: "c" },
            { key1: 1, key2: "d" },
            { key1: 2, key2: "a" },
            { key1: 2, key2: "b" },
            { key1: 2, key2: "c" },
            { key1: 2, key2: "d" },
            { key1: 3, key2: "a" },
            { key1: 3, key2: "b" },
            { key1: 3, key2: "c" },
            { key1: 3, key2: "d" },
            { key1: 4, key2: "a" },
            { key1: 4, key2: "b" },
            { key1: 4, key2: "c" },
            { key1: 4, key2: "d" },
        ])
    })
    it("should return all pairs of rows in a new table", async () => {
        await simpleNodeDB.loadArray("numbers", [
            { key1: 1 },
            { key1: 2 },
            { key1: 3 },
            { key1: 4 },
        ])
        await simpleNodeDB.loadArray("letters", [
            { key2: "a" },
            { key2: "b" },
            { key2: "c" },
            { key2: "d" },
        ])
        await simpleNodeDB.crossJoin("numbers", "letters", {
            outputTable: "joined",
        })
        const data = await simpleNodeDB.getData("joined")
        assert.deepStrictEqual(data, [
            { key1: 1, key2: "a" },
            { key1: 1, key2: "b" },
            { key1: 1, key2: "c" },
            { key1: 1, key2: "d" },
            { key1: 2, key2: "a" },
            { key1: 2, key2: "b" },
            { key1: 2, key2: "c" },
            { key1: 2, key2: "d" },
            { key1: 3, key2: "a" },
            { key1: 3, key2: "b" },
            { key1: 3, key2: "c" },
            { key1: 3, key2: "d" },
            { key1: 4, key2: "a" },
            { key1: 4, key2: "b" },
            { key1: 4, key2: "c" },
            { key1: 4, key2: "d" },
        ])
    })
})
