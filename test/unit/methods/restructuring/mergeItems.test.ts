import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("mergeItems", function () {
    it("should add keys based on a common key", function () {
        const data = [
            { key1: "red", key2: 1 },
            { key1: "yellow", key2: 2 },
        ]
        const dataToBeMerged = [
            { key1: "yellow", key3: "raton" },
            { key1: "red", key3: "castor" },
        ]

        const sd = new SimpleData({ data }).mergeItems({
            dataToBeMerged,
            commonKey: "key1",
        })

        assert.deepStrictEqual(sd.getData(), [
            { key1: "red", key2: 1, key3: "castor" },
            { key1: "yellow", key3: "raton", key2: 2 },
        ])
    })

    it("should merge items as a SimpleData instance", function () {
        const data = [
            { key1: "red", key2: 1 },
            { key1: "yellow", key2: 2 },
        ]
        const dataToBeMerged = new SimpleData({
            data: [
                { key1: "yellow", key3: "raton" },
                { key1: "red", key3: "castor" },
            ],
        })
        const sd = new SimpleData({ data }).mergeItems({
            dataToBeMerged,
            commonKey: "key1",
        })

        assert.deepStrictEqual(sd.getData(), [
            { key1: "red", key2: 1, key3: "castor" },
            { key1: "yellow", key3: "raton", key2: 2 },
        ])
    })
})
