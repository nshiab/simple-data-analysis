import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("pickRandomItems", function () {
    it("should return a random set of data, of the same length as the value provided", function () {
        const data = [
            { key1: 0, key2: 2 },
            { key1: 1, key2: 2 },
            { key1: 2, key2: 4 },
            { key1: 2, key2: 6 },
        ]
        const sd = new SimpleData({ data }).pickRandomItems({ nbItems: 2 })
        assert.deepStrictEqual(sd.getLength(), 2)
    })

    it("should return a random set of data, of the same length as the value provided. This random data should match the random data selected previously generated using the same seed.", function () {
        const data = [
            { key1: 0, key2: 2 },
            { key1: 1, key2: 2 },
            { key1: 2, key2: 4 },
            { key1: 2, key2: 6 },
        ]
        const sd = new SimpleData({ data }).pickRandomItems({
            nbItems: 2,
            seed: 0.2,
        })
        assert.deepStrictEqual(sd.getData(), [
            { key1: 1, key2: 2 },
            { key1: 2, key2: 4 },
        ])
    })

    it("should return an error because a negative value is given", function () {
        const data = [
            { key1: 0, key2: 2 },
            { key1: 1, key2: 2 },
            { key1: 2, key2: 4 },
            { key1: 2, key2: 6 },
        ]

        assert.throws(
            () =>
                new SimpleData({ data }).pickRandomItems({
                    nbItems: -1,
                }),
            Error
        )
    })
})
