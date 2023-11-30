import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("trim", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = new SimpleNodeDB()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should remove whitespace", async () => {
        await simpleNodeDB.loadData("dataTrim", [
            "test/data/files/dataTrim.json",
        ])

        await simpleNodeDB.trim("dataTrim", "key1")
        const data = await simpleNodeDB.getData("dataTrim")

        assert.deepStrictEqual(data, [
            { key1: "a", key2: " !@a!@" },
            { key1: "b", key2: " !@b!@" },
            { key1: "c", key2: " !@c!@" },
            { key1: "d", key2: " !@d!@" },
        ])
    })
    it("should remove whitespace from multiple columns", async () => {
        await simpleNodeDB.loadData("dataTrimMultipleColumns", [
            "test/data/files/dataTrim.json",
        ])

        await simpleNodeDB.trim("dataTrimMultipleColumns", ["key1", "key2"])

        const data = await simpleNodeDB.getData("dataTrimMultipleColumns")

        assert.deepStrictEqual(data, [
            { key1: "a", key2: "!@a!@" },
            { key1: "b", key2: "!@b!@" },
            { key1: "c", key2: "!@c!@" },
            { key1: "d", key2: "!@d!@" },
        ])
    })
    it("should remove whitespace just on the left", async () => {
        await simpleNodeDB.loadData("dataTrimLeft", [
            "test/data/files/dataTrim.json",
        ])

        await simpleNodeDB.trim("dataTrimLeft", "key1", {
            method: "leftTrim",
        })
        const data = await simpleNodeDB.getData("dataTrimLeft")

        assert.deepStrictEqual(data, [
            { key1: "a  ", key2: " !@a!@" },
            { key1: "b  ", key2: " !@b!@" },
            { key1: "c  ", key2: " !@c!@" },
            { key1: "d  ", key2: " !@d!@" },
        ])
    })
    it("should remove whitespace just on the right", async () => {
        await simpleNodeDB.loadData("dataTrimRight", [
            "test/data/files/dataTrim.json",
        ])

        await simpleNodeDB.trim("dataTrimRight", "key1", {
            method: "rightTrim",
        })
        const data = await simpleNodeDB.getData("dataTrimRight")

        assert.deepStrictEqual(data, [
            { key1: "  a", key2: " !@a!@" },
            { key1: "  b", key2: " !@b!@" },
            { key1: "  c", key2: " !@c!@" },
            { key1: "  d", key2: " !@d!@" },
        ])
    })
    it("should remove specific characters", async () => {
        await simpleNodeDB.loadData("dataTrimSpecial", [
            "test/data/files/dataTrim.json",
        ])

        await simpleNodeDB.trim("dataTrimSpecial", "key2", {
            method: "rightTrim",
            character: "!@",
        })
        const data = await simpleNodeDB.getData("dataTrimSpecial")

        assert.deepStrictEqual(data, [
            { key1: "  a  ", key2: " !@a" },
            { key1: "  b  ", key2: " !@b" },
            { key1: "  c  ", key2: " !@c" },
            { key1: "  d  ", key2: " !@d" },
        ])
    })
})
