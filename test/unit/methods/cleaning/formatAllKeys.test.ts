import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("formatAllKeys", function () {
    it("should format keys", function () {
        const data = [{ key1_key2_a: 1, "key1 key2 b": 2, "key1-key2#c": 3 }]

        const sd = new SimpleData({ data }).formatAllKeys()
        assert.deepStrictEqual(sd.getData(), [
            { key1Key2A: 1, key1Key2B: 2, key1Key2C: 3 },
        ])
    })
    it("should format keys with a specific format function", function () {
        const data = [{ key1: 1, key2: 2, key3: 3 }]

        const sd = new SimpleData({ data }).formatAllKeys({
            formatKey: (key) => key.toUpperCase(),
        })
        assert.deepStrictEqual(sd.getData(), [{ KEY1: 1, KEY2: 2, KEY3: 3 }])
    })
})
