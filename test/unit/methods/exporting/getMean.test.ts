import assert from "assert"
import getMean from "../../../../src/methods/exporting/getMean.js"

const data = [
    { key1: 9, key2: 90, key3: new Date(Date.UTC(2022, 7, 1)) },
    { key1: 20, key2: null, key3: new Date(Date.UTC(2022, 7, 2)) },
    { key1: 30, key2: -90, key3: new Date(Date.UTC(2022, 7, 3)) },
    { key1: 40, key2: 55, key3: new Date(Date.UTC(2022, 7, 4)) },
    { key1: 50, key2: 11, key3: new Date(Date.UTC(2022, 7, 5)) },
    { key1: 60, key2: undefined, key3: new Date(Date.UTC(2022, 7, 6)) },
    { key1: 70, key2: "haha", key3: new Date(Date.UTC(2022, 7, 7)) },
]

describe("getMean", function () {
    it("should return mean value 39.9 from key holding all numbers", function () {
        const meanValue = getMean(data, "key1", 1)
        assert.deepEqual(meanValue, 39.9)
    })

    it("should throw an error when different types", function () {
        assert.throws(() => getMean(data, "key2"))
    })
    it("should throw an error when working with dates", function () {
        assert.throws(() => getMean(data, "key3"))
    })
})
