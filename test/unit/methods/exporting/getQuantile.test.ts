import assert from "assert"
import getQuantile from "../../../../src/methods/exporting/getQuantile.js"

const data = [
    { key1: 9, key2: 90, key3: new Date(Date.UTC(2022, 7, 1)) },
    { key1: 20, key2: null, key3: new Date(Date.UTC(2022, 7, 2)) },
    { key1: 30, key2: -90, key3: new Date(Date.UTC(2022, 7, 3)) },
    { key1: 40, key2: 55, key3: new Date(Date.UTC(2022, 7, 4)) },
    { key1: 50, key2: 11, key3: new Date(Date.UTC(2022, 7, 5)) },
    { key1: 60, key2: undefined, key3: new Date(Date.UTC(2022, 7, 6)) },
    { key1: 70, key2: "haha", key3: new Date(Date.UTC(2022, 7, 7)) },
]

describe("getQuantile", function () {
    it("should return median value 40 from key holding all numbers", function () {
        const medianValue = getQuantile(data, "key1", 0.5)
        assert.deepEqual(medianValue, 40)
    })

    it("should return median value 33 from key with different types", function () {
        const medianValue = getQuantile(data, "key2", 0.5)
        assert.deepEqual(medianValue, 33)
    })
    it("should return median value with dates", function () {
        const medianValue = getQuantile(data, "key3", 0.5)
        assert.deepEqual(medianValue, 1659571200000)
    })
})
