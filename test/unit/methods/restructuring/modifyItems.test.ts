import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("modifyItems", function () {
    it("should modify items", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 2, key2: 4 },
        ]

        const sd = new SimpleData({ data }).modifyItems({
            key: "key1",
            itemGenerator: (item) =>
                item.key1 && item.key2
                    ? (item.key1 as number) * (item.key2 as number)
                    : undefined,
        })
        assert.deepEqual(sd.getData(), [
            { key1: 2, key2: 2 },
            { key1: 8, key2: 4 },
        ])
    })
    it("should modify items and adds the new values in a new key", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 2, key2: 4 },
        ]

        const sd = new SimpleData({ data }).modifyItems({
            key: "key1",
            newKey: "key3",
            itemGenerator: (item) =>
                item.key1 && item.key2
                    ? (item.key1 as number) * (item.key2 as number)
                    : undefined,
        })
        assert.deepEqual(sd.getData(), [
            {
                key1: 1,
                key2: 2,
                key3: 2,
            },
            {
                key1: 2,
                key2: 4,
                key3: 8,
            },
        ])
    })
})
