import assert from "assert"
import getMean from "../../../../src/methods/exporting/getMean.js"

const data = [
    { key1: 10, key2: 90 },
    { key1: 20, key2: null },
    { key1: 30, key2: -90 },
    { key1: 40, key2: 55 },
    { key1: 50, key2: 11 },
    { key1: 60, key2: undefined },
    { key1: 70, key2: "haha" },
]

describe("getMean", function () {
    it("should return mean value 40 from key holding all numbers", function () {
        const meanValue = getMean(data, "key1")
        assert.deepEqual(meanValue, 40)
    })

    it("should return mean value 16.5 from key with different types", function () {
        const meanValue = getMean(data, "key2")
        assert.deepEqual(meanValue, 16.5)
    })
})
