import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("addItems", function () {
    it("should add a new key and generate new values", function () {
        const data = [{ key1: 1 }, { key1: 2 }]
        const sd = new SimpleData({ data }).addKey({
            key: "key2",
            valueGenerator: (item) => (item.key1 as number) * 2,
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: 1, key2: 2 },
            { key1: 2, key2: 4 },
        ])
    })

    it("should add a new key and generate new values computed from prior values", function () {
        const data = [{ key1: 1 }, { key1: 10 }, { key1: 100 }, { key1: 1000 }]
        const sd = new SimpleData({ data }).addKey({
            key: "variation",
            valueGenerator: (item, i, items) => {
                const prev = items[i - 1]
                if (
                    typeof item.key1 === "number" &&
                    prev &&
                    typeof prev.key1 === "number"
                ) {
                    return item.key1 - prev.key1
                } else {
                    return 0
                }
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
