import assert from "assert"
import keepStrings from "../../../../src/methods/cleaning/keepStrings.js"

describe("keepStrings", function () {
    it("should keep only non-empty strings", function () {
        const data = [
            { key1: null, key2: 2 },
            { key1: NaN, key2: 3 },
            { key1: undefined, key2: 4 },
            { key1: "", key2: 5 },
            { key1: "11", key2: 22 },
        ]

        const cleanData = keepStrings(data, "key1")
        assert.deepEqual(cleanData, [{ key1: "11", key2: 22 }])
    })
    it("should keep only everyting except non-empty strings", function () {
        const data = [
            { key1: null, key2: 2 },
            { key1: NaN, key2: 3 },
            { key1: undefined, key2: 4 },
            { key1: "", key2: 5 },
            { key1: "11", key2: 22 },
        ]

        const cleanData = keepStrings(data, "key1", true)
        assert.deepEqual(cleanData, [
            { key1: null, key2: 2 },
            { key1: NaN, key2: 3 },
            { key1: undefined, key2: 4 },
            { key1: "", key2: 5 },
        ])
    })
})
