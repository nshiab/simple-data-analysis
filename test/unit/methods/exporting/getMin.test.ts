import assert from "assert"
import getMin from "../../../../src/methods/exporting/getMin.js"

const data = [
    { key1: 66, key2: 5 },
    { key1: 88, key2: null },
    { key1: 77, key2: 9 },
    { key1: 99, key2: -11.1 },
    { key1: 44, key2: 6 },
    { key1: 55, key2: undefined },
    { key1: 44, key2: "haha" },
]

describe("getMin", function () {
    it("should return min value 4 from key holding all numbers", function () {
        const minValue = getMin(data, "key1")
        assert.deepEqual(minValue, 44)
    })

    it("should return min value -11.1 from key with different types", function () {
        const minValue = getMin(data, "key2")
        assert.deepEqual(minValue, -11.1)
    })
})
