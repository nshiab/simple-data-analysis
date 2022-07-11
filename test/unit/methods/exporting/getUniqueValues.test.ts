import assert from "assert"
import getUniqueValues from "../../../../src/methods/exporting/getUniqueValues.js"

describe("getUniqueValues", function () {
    it("should return unique values", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 111, key2: 22 },
            { key1: 111, key2: 222 },
        ]
        const uniqueValues = getUniqueValues(data, "key1")
        assert.deepEqual(uniqueValues, [1, 111])
    })
})
