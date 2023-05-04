import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

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
        assert.deepStrictEqual(
            new SimpleData({ data }).getQuantile({
                key: "key1",
                quantile: 0.5,
            }),
            40
        )
    })

    it("should throw an error when different types", function () {
        assert.throws(() =>
            new SimpleData({ data }).getQuantile({
                key: "key2",
                quantile: 0.5,
            })
        )
    })
    it("should throw an error when working with dates", function () {
        assert.throws(() =>
            new SimpleData({ data }).getQuantile({
                key: "key3",
                quantile: 0.5,
            })
        )
    })
})
