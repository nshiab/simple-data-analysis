import assert from "assert"
import getMax from "../../../../src/methods/exporting/getMax.js"

const data = [
    { key1: 66, key2: 5, key3: new Date(Date.UTC(2022, 7, 1)) },
    { key1: 88, key2: null, key3: new Date(Date.UTC(2022, 7, 2)) },
    { key1: 77, key2: 9, key3: new Date(Date.UTC(2022, 7, 3)) },
    { key1: 99, key2: -11.1, key3: new Date(Date.UTC(2022, 7, 4)) },
    { key1: 44, key2: 6, key3: new Date(Date.UTC(2022, 7, 5)) },
    { key1: 55, key2: undefined, key3: new Date(Date.UTC(2022, 7, 6)) },
    { key1: 44, key2: "haha", key3: new Date(Date.UTC(2022, 7, 7)) },
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
    it("should return max value when working with dates", function () {
        const maxValue = getMax(data, "key3")
        assert.deepEqual(maxValue, 1659830400000)
    })
})
