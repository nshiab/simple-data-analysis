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
        assert.deepStrictEqual(sd.getData(), [
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
        assert.deepStrictEqual(sd.getData(), [
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

    it("should modify items based on prior values", function () {
        const data = [
            { key1: 1, key2: 2, other: 2 },
            { key1: 2, key2: 4, other: 4 },
            { key1: 1, key2: 3, other: 3 },
            { key1: 4, key2: 1, other: 1 },
        ]

        const sd = new SimpleData({ data }).modifyItems({
            key: "key1",
            itemGenerator: (item, i, items) =>
                item.key1 && item.key2
                    ? (item.key1 as number) * (item.key2 as number) +
                      i +
                      (items[i - 1] ? (items[i - 1]?.other as number) ?? 0 : 0)
                    : undefined,
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: 2, key2: 2, other: 2 },
            { key1: 11, key2: 4, other: 4 },
            { key1: 9, key2: 3, other: 3 },
            { key1: 10, key2: 1, other: 1 },
        ])
    })

    it("should modify items and adds the new values in a new key based on prior values", function () {
        const data = [
            { key1: 1, key2: 2, other: 2 },
            { key1: 2, key2: 4, other: 4 },
            { key1: 1, key2: 3, other: 3 },
            { key1: 4, key2: 1, other: 1 },
        ]

        const sd = new SimpleData({ data }).modifyItems({
            key: "key1",
            newKey: "key3",
            itemGenerator: (item, i, items) =>
                item.key1 && item.key2
                    ? (item.key1 as number) * (item.key2 as number) +
                      i +
                      (items[i - 1] ? (items[i - 1]?.other as number) ?? 0 : 0)
                    : undefined,
        })

        assert.deepStrictEqual(sd.getData(), [
            { key1: 1, key2: 2, other: 2, key3: 2 },
            { key1: 2, key2: 4, other: 4, key3: 11 },
            { key1: 1, key2: 3, other: 3, key3: 9 },
            { key1: 4, key2: 1, other: 1, key3: 10 },
        ])
    })
})
