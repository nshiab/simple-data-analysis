import assert from "assert"
import getArray from "../../../../src/methods/exporting/getArray.js"

describe("getArray", function () {
    it("should return an array", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 11, poil: 22 },
            { patate: 111, poil: 222 },
        ]
        const array = getArray(data, "patate")
        assert.deepEqual(array, [1, 11, 111])
    })
})
