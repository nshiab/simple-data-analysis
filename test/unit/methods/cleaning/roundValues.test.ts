import assert from "assert"
import roundValues from "../../../../src/methods/cleaning/roundValues.js"

describe("roundValues", function () {
    it("should round values", function () {
        const data = [
            { key1: 1.1111, key2: 2 },
            { key1: 11.6666, key2: 22 },
        ]
        const roundedData = roundValues(data, "key1", 2)
        assert.deepEqual(roundedData, [
            { key1: 1.11, key2: 2 },
            { key1: 11.67, key2: 22 },
        ])
    })
    it("should round values and skip errors", function () {
        const data = [
            { key1: 1.1111, key2: 2 },
            { key1: "Hi!", key2: 22 },
        ]
        const roundedData = roundValues(data, "key1", 2, true)
        assert.deepEqual(roundedData, [
            { key1: 1.11, key2: 2 },
            { key1: "Hi!", key2: 22 },
        ])
    })

    it("should save rounded values with a new key", function () {
        const data = [
            { key1: 1.1111, key2: 2 },
            { key1: 11.6666, key2: 22 },
        ]
        const roundedData = roundValues(data, "key1", 2, undefined, "key1x")
        assert.deepEqual(roundedData, [
            { key1: 1.1111, key2: 2, key1x: 1.11 },
            { key1: 11.6666, key2: 22, key1x: 11.67 },
        ])
    })

    it("should throw error if newKey already exists", function () {
        const data = [
            { key1: 1.1111, key2: 2 },
            { key1: 11.6666, key2: 22 },
        ]
        assert.throws(() => roundValues(data, "key1", 2, undefined, "key2"))
    })
})
