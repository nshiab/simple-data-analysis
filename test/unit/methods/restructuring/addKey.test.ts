import assert from "assert"
import { SimpleData, SimpleDataValue } from "../../../../src/index.js"

describe("addItems", function () {
    it("should add a new key and generate new values", function () {
        const data = [{ key1: 1 }, { key1: 2 }]
        const sd = new SimpleData({ data }).addKey({
            key: "key2",
            itemGenerator: (item) => (item.key1 as number) * 2,
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: 1, key2: 2 },
            { key1: 2, key2: 4 },
        ])
    })

    it("should add a new key and generate new values computed from prior values", function () {
        const data = [{ key1: 1 }, { key1: 2 }, { key1: 3 }, { key1: 1 }]
        const sd = new SimpleData({ data }).addKey({
            key: "key2",
            itemGenerator: (item, i) => (item.key1 as number) * 2 + i,
        })

        const sd2 = new SimpleData({ data }).addKey({
            key: "key3",
            itemGenerator: (item, idx, items) => {
                return (
                    (item.key1 as number) * 2 +
                    idx +
                    (idx > 0 ? (items[idx - 1].key1 as number) ?? 0 : 0)
                )
            },
        })

        assert.deepStrictEqual(sd.getData(), [
            { key1: 1, key2: 2 },
            { key1: 2, key2: 5 },
            { key1: 3, key2: 8 },
            { key1: 1, key2: 5 },
        ])
        assert.deepStrictEqual(sd2.getData(), [
            { key1: 1, key3: 2 },
            { key1: 2, key3: 6 },
            { key1: 3, key3: 10 },
            { key1: 1, key3: 8 },
        ])
    })
})
