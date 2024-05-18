import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("crossJoin", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should return all pairs of rows", async () => {
        await sdb.loadArray("numbers", [
            { key1: 1 },
            { key1: 2 },
            { key1: 3 },
            { key1: 4 },
        ])
        await sdb.loadArray("letters", [
            { key2: "a" },
            { key2: "b" },
            { key2: "c" },
            { key2: "d" },
        ])
        await sdb.crossJoin("numbers", "letters")
        const data = await sdb.getData("numbers")
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
        await sdb.loadArray("numbers", [
            { key1: 1 },
            { key1: 2 },
            { key1: 3 },
            { key1: 4 },
        ])
        await sdb.loadArray("letters", [
            { key2: "a" },
            { key2: "b" },
            { key2: "c" },
            { key2: "d" },
        ])
        await sdb.crossJoin("numbers", "letters", {
            outputTable: "joined",
        })
        const data = await sdb.getData("joined")
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
