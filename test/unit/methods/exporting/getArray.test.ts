import assert from "assert"
import getArray from "../../../../src/methods/exporting/getArray.js"

describe("getArray", function () {
    it("should return an array", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 11, key2: 22 },
            { key1: 111, key2: 222 },
        ]
        const array = getArray(data, "key1")
        assert.deepEqual(array, [1, 11, 111])
    })
    it("should return an array with multiple keys", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 11, key2: 22 },
            { key1: 111, key2: 222 },
        ]
        const array = getArray(data, ["key1", "key2"])
        assert.deepEqual(array, [1, 2, 11, 22, 111, 222])
    })
})
