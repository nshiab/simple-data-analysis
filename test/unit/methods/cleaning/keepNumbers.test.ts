import assert from "assert"
import keepNumbers from "../../../../src/methods/cleaning/keepNumbers.js"

describe("keepNumbers", function () {
    it("should keep only valid numbers", function () {
        const data = [
            { key1: null, key2: 2 },
            { key1: NaN, key2: 3 },
            { key1: undefined, key2: 4 },
            { key1: "", key2: 5 },
            { key1: 11, key2: 22 },
        ]

        const cleanData = keepNumbers(data, "key1")
        assert.deepEqual(cleanData, [{ key1: 11, key2: 22 }])
    })
})
