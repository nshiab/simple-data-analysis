import assert from "assert"
import addItemsWithStream from "../../../src/helpers/addItemsWithStream.js"
import { SimpleDataItem } from "../../../src/index.js"

describe("addItemsWithStream", function () {
    it("should return the data in a csv file while using stream", async function () {
        const data: SimpleDataItem[] = []
        await addItemsWithStream(
            data,
            "./test/data/files/data.csv",
            false,
            "utf8",
            false,
            false
        )

        assert.deepStrictEqual(data, [
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
            { key1: "brioche", key2: "croissant" },
        ])
    })
    it("should return the data in a csv file while using stream with specific keys", async function () {
        const data: SimpleDataItem[] = []
        await addItemsWithStream(
            data,
            "./test/data/files/data.csv",
            ["key2"],
            "utf8",
            false,
            false
        )

        assert.deepStrictEqual(data, [
            { key2: "2" },
            { key2: "coucou" },
            { key2: "10" },
            { key2: "croissant" },
        ])
    })
    it("should return the data in a tsv file while using stream", async function () {
        const data: SimpleDataItem[] = []
        await addItemsWithStream(
            data,
            "./test/data/files/data.tsv",
            false,
            "utf8",
            false,
            false
        )

        assert.deepStrictEqual(data, [
            { key1: "1", key2: "2" },
            { key1: "3", key2: "coucou" },
            { key1: "8", key2: "10" },
            { key1: "brioche", key2: "croissant" },
        ])
    })
})
