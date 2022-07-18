import assert from "assert"
import getMax from "../../../../src/methods/exporting/getMax.js"

const data = [
    { key1: 66, key2: 5 },
    { key1: 88, key2: null },
    { key1: 77, key2: 9 },
    { key1: 99, key2: -11.1 },
    { key1: 44, key2: 6 },
    { key1: 55, key2: undefined },
    { key1: 44, key2: "haha" },
]

describe("getMax", function () {
    it("should return max value 99 from key holding all numbers", function () {
        const maxValue = getMax(data, "key1")
        assert.deepEqual(maxValue, 99)
    })

    it("should return max value 9 from key with different types", function () {
        const maxValue = getMax(data, "key2")
        assert.deepEqual(maxValue, 9)
    })
})
