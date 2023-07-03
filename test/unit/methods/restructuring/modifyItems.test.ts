import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("modifyItems", function () {
    it("should modify items", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 2, key2: 4 },
        ]

        const sd = new SimpleData({ data }).modifyItems({
            itemGenerator: (item) => {
                if (
                    typeof item.key1 === "number" &&
                    typeof item.key2 === "number"
                ) {
                    item.key1 = item.key1 * item.key2
                }

                return item
            },
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
            itemGenerator: (item) => {
                if (
                    typeof item.key1 === "number" &&
                    typeof item.key2 === "number"
                ) {
                    item.key3 = item.key1 * item.key2
                } else {
                    item.key3 = null
                }

                return item
            },
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
        const data = [{ key1: 1 }, { key1: 10 }, { key1: 100 }, { key1: 1000 }]

        const sd = new SimpleData({ data }).modifyItems({
            itemGenerator: (item, i, items) => {
                const prev = items[i - 1]
                if (
                    typeof item.key1 === "number" &&
                    prev &&
                    typeof prev.key1 === "number"
                ) {
                    item.variation = item.key1 - prev.key1
                } else {
                    item.variation = 0
                }

                return item
            },
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: 1, variation: 0 },
            { key1: 10, variation: 9 },
            { key1: 100, variation: 90 },
            { key1: 1000, variation: 900 },
        ])
    })
})
