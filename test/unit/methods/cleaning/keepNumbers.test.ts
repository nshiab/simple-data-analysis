import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("keepNumbers", function () {
    it("should keep only valid numbers", function () {
        const data = [
            { key1: null, key2: 2 },
            { key1: NaN, key2: 3 },
            { key1: undefined, key2: 4 },
            { key1: "", key2: 5 },
            { key1: 11, key2: 22 },
        ]

        const sd = new SimpleData({ data }).keepNumbers({ key: "key1" })
        assert.deepEqual(sd.getData(), [{ key1: 11, key2: 22 }])
    })
    it("should keep only non valid numbers", function () {
        const data = [
            { key1: null, key2: 2 },
            { key1: NaN, key2: 3 },
            { key1: undefined, key2: 4 },
            { key1: "", key2: 5 },
            { key1: 11, key2: 22 },
        ]

        const sd = new SimpleData({ data }).keepNumbers({
            key: "key1",
            keepNonNumbersOnly: true,
        })
        assert.deepEqual(sd.getData(), [
            { key1: null, key2: 2 },
            { key1: NaN, key2: 3 },
            { key1: undefined, key2: 4 },
            { key1: "", key2: 5 },
        ])
    })
})
