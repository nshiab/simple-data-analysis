import assert from "assert"
import getUniqueValues from "../../../../src/methods/exporting/getUniqueValues.js"

describe("getUniqueValues", function () {
    it("should return unique values", function () {
        const data = [
            { patate: 1, poil: 2 },
            { patate: 111, poil: 22 },
            { patate: 111, poil: 222 },
        ]
        const uniqueValues = getUniqueValues(data, "patate")
        assert.deepEqual(uniqueValues, [1, 111])
    })
})
