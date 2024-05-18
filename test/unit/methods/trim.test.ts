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
        await sdb.loadData("dataTrim", ["test/data/files/dataTrim.json"])

        await sdb.trim("dataTrim", "key1")
        const data = await sdb.getData("dataTrim")

        assert.deepStrictEqual(data, [
            { key1: "a", key2: " !@a!@" },
            { key1: "b", key2: " !@b!@" },
            { key1: "c", key2: " !@c!@" },
            { key1: "d", key2: " !@d!@" },
        ])
    })
    it("should remove whitespace from multiple columns", async () => {
        await sdb.loadData("dataTrimMultipleColumns", [
            "test/data/files/dataTrim.json",
        ])

        await sdb.trim("dataTrimMultipleColumns", ["key1", "key2"])

        const data = await sdb.getData("dataTrimMultipleColumns")

        assert.deepStrictEqual(data, [
            { key1: "a", key2: "!@a!@" },
            { key1: "b", key2: "!@b!@" },
            { key1: "c", key2: "!@c!@" },
            { key1: "d", key2: "!@d!@" },
        ])
    })
    it("should remove whitespace just on the left", async () => {
        await sdb.loadData("dataTrimLeft", ["test/data/files/dataTrim.json"])

        await sdb.trim("dataTrimLeft", "key1", {
            method: "leftTrim",
        })
        const data = await sdb.getData("dataTrimLeft")

        assert.deepStrictEqual(data, [
            { key1: "a  ", key2: " !@a!@" },
            { key1: "b  ", key2: " !@b!@" },
            { key1: "c  ", key2: " !@c!@" },
            { key1: "d  ", key2: " !@d!@" },
        ])
    })
    it("should remove whitespace just on the right", async () => {
        await sdb.loadData("dataTrimRight", ["test/data/files/dataTrim.json"])

        await sdb.trim("dataTrimRight", "key1", {
            method: "rightTrim",
        })
        const data = await sdb.getData("dataTrimRight")

        assert.deepStrictEqual(data, [
            { key1: "  a", key2: " !@a!@" },
            { key1: "  b", key2: " !@b!@" },
            { key1: "  c", key2: " !@c!@" },
            { key1: "  d", key2: " !@d!@" },
        ])
    })
    it("should remove specific characters", async () => {
        await sdb.loadData("dataTrimSpecial", ["test/data/files/dataTrim.json"])

        await sdb.trim("dataTrimSpecial", "key2", {
            method: "rightTrim",
            character: "!@",
        })
        const data = await sdb.getData("dataTrimSpecial")

        assert.deepStrictEqual(data, [
            { key1: "  a  ", key2: " !@a" },
            { key1: "  b  ", key2: " !@b" },
            { key1: "  c  ", key2: " !@c" },
            { key1: "  d  ", key2: " !@d" },
        ])
    })
})
