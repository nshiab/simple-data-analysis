import assert from "assert"
import SimpleDB from "../../../src/class/SimpleDB.js"

describe("trim", () => {
    let sdb: SimpleDB
    before(async function () {
        sdb = new SimpleDB()
    })
    after(async function () {
        await sdb.done()
    })

    it("should remove whitespace", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/dataTrim.json"])

        await table.trim("key1")
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { key1: "a", key2: " !@a!@" },
            { key1: "b", key2: " !@b!@" },
            { key1: "c", key2: " !@c!@" },
            { key1: "d", key2: " !@d!@" },
        ])
    })
    it("should remove whitespace from multiple columns", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/dataTrim.json"])

        await table.trim(["key1", "key2"])

        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { key1: "a", key2: "!@a!@" },
            { key1: "b", key2: "!@b!@" },
            { key1: "c", key2: "!@c!@" },
            { key1: "d", key2: "!@d!@" },
        ])
    })
    it("should remove whitespace just on the left", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/dataTrim.json"])

        await table.trim("key1", {
            method: "leftTrim",
        })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { key1: "a  ", key2: " !@a!@" },
            { key1: "b  ", key2: " !@b!@" },
            { key1: "c  ", key2: " !@c!@" },
            { key1: "d  ", key2: " !@d!@" },
        ])
    })
    it("should remove whitespace just on the right", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/dataTrim.json"])

        await table.trim("key1", {
            method: "rightTrim",
        })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { key1: "  a", key2: " !@a!@" },
            { key1: "  b", key2: " !@b!@" },
            { key1: "  c", key2: " !@c!@" },
            { key1: "  d", key2: " !@d!@" },
        ])
    })
    it("should remove specific characters", async () => {
        const table = sdb.newTable()
        await table.loadData(["test/data/files/dataTrim.json"])

        await table.trim("key2", {
            method: "rightTrim",
            character: "!@",
        })
        const data = await table.getData()

        assert.deepStrictEqual(data, [
            { key1: "  a  ", key2: " !@a" },
            { key1: "  b  ", key2: " !@b" },
            { key1: "  c  ", key2: " !@c" },
            { key1: "  d  ", key2: " !@d" },
        ])
    })
})
