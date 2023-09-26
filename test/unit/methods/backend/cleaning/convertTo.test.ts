import assert from "assert"
import SimpleNodeDB from "../../../../../src/class/SimpleNodeDB.js"

describe("convertTo", () => {
    const simpleNodeDB = new SimpleNodeDB().start()

    it("should convert numbers to string", async () => {
        await simpleNodeDB.loadData("dataJustNumbers", [
            "test/data/files/dataJustNumbers.csv",
        ])

        const data = await simpleNodeDB.convertTo(
            "dataJustNumbers",
            ["key1"],
            ["string"],
            { returnDataFrom: "table" }
        )

        assert.deepStrictEqual(data, [
            { key1: "1.3", key2: 2 },
            { key1: "3.0", key2: 15 },
            { key1: "8.5", key2: 10 },
            { key1: "1.0", key2: 154 },
        ])
    })

    it("should convert string to float", async () => {
        const data = await simpleNodeDB.convertTo(
            "dataJustNumbers",
            ["key1"],
            ["float"],
            { returnDataFrom: "table" }
        )

        assert.deepStrictEqual(data, [
            { key1: 1.3, key2: 2 },
            { key1: 3, key2: 15 },
            { key1: 8.5, key2: 10 },
            { key1: 1, key2: 154 },
        ])
    })

    it("should convert string to integer", async () => {
        await simpleNodeDB.convertTo("dataJustNumbers", ["key2"], ["string"])

        const data = await simpleNodeDB.convertTo(
            "dataJustNumbers",
            ["key2"],
            ["integer"],
            { returnDataFrom: "table" }
        )

        assert.deepStrictEqual(data, [
            { key1: 1.3, key2: 2 },
            { key1: 3, key2: 15 },
            { key1: 8.5, key2: 10 },
            { key1: 1, key2: 154 },
        ])
    })

    it("convert multiple columns in multiple types", async () => {
        await simpleNodeDB.convertTo("dataJustNumbers", ["key1"], ["string"])

        const data = await simpleNodeDB.convertTo(
            "dataJustNumbers",
            ["key1", "key2"],
            ["float", "string"],
            { returnDataFrom: "table" }
        )

        assert.deepStrictEqual(data, [
            { key1: 1.3, key2: "2" },
            { key1: 3, key2: "15" },
            { key1: 8.5, key2: "10" },
            { key1: 1, key2: "154" },
        ])
    })

    simpleNodeDB.done()
})
