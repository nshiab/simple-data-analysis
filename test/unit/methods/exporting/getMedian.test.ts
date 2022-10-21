import assert from "assert"
import getMedian from "../../../../src/methods/exporting/getMedian.js"

const data = [
    { key1: 10, key2: 90, key3: new Date(Date.UTC(2022, 7, 1)) },
    { key1: 20, key2: null, key3: new Date(Date.UTC(2022, 7, 2)) },
    { key1: 30, key2: -90, key3: new Date(Date.UTC(2022, 7, 3)) },
    { key1: 40, key2: 55, key3: new Date(Date.UTC(2022, 7, 4)) },
    { key1: 50, key2: 11, key3: new Date(Date.UTC(2022, 7, 5)) },
    { key1: 60, key2: undefined, key3: new Date(Date.UTC(2022, 7, 6)) },
    { key1: 70, key2: "haha", key3: new Date(Date.UTC(2022, 7, 7)) },
]

describe("getMedian", function () {
    it("should return median value 40 from key holding all numbers", function () {
        const medianValue = getMedian(data, "key1")
        assert.deepEqual(medianValue, 40)
    })

    it("should throw an error when different types", function () {
        assert.throws(() => getMedian(data, "key2"))
    })
    it("should throw an error when working with dates", function () {
        assert.throws(() => getMedian(data, "key3"))
    })
})
