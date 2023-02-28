import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

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
        assert.deepEqual(
            new SimpleData({ data }).getMedian({ key: "key1" }),
            40
        )
    })

    it("should throw an error when different types", function () {
        assert.throws(() => new SimpleData({ data }).getMedian({ key: "key2" }))
    })
    it("should throw an error when not working with with numbers", function () {
        assert.throws(() => new SimpleData({ data }).getMedian({ key: "key3" }))
    })
    it("should return median value when the type provided (Date)", function () {
        assert.deepEqual(
            new SimpleData({ data }).getMedian({ key: "key3", type: "Date" }),
            new Date(Date.UTC(2022, 7, 4))
        )
    })
})
