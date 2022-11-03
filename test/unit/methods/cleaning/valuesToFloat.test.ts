import assert from "assert"
import valuesToFloat from "../../../../src/methods/cleaning/valuesToFloat.js"

describe("valuesToFloat", function () {
    it("should convert values to float", function () {
        const data = [{ key1: "1,000,000.5", key2: 2 }]
        const floatsData = valuesToFloat(data, "key1")
        assert.deepEqual(floatsData, [{ key1: 1000000.5, key2: 2 }])
    })

    it("should convert French formatted numbers to float", function () {
        const data = [{ key1: "1 000 000,5", key2: 2 }]
        const floatsData = valuesToFloat(data, "key1", " ", ",")
        assert.deepEqual(floatsData, [{ key1: 1000000.5, key2: 2 }])
    })

    it("should not throw errors when floats are already here", function () {
        const data = [
            { key1: 12, key2: 2 },
            { key1: 1000000.5, key2: 2 },
            { key1: "1,000,000.75", key2: 2 },
        ]
        const floatsData = valuesToFloat(data, "key1", ",", ".")
        assert.deepEqual(floatsData, [
            { key1: 12, key2: 2 },
            { key1: 1000000.5, key2: 2 },
            { key1: 1000000.75, key2: 2 },
        ])
    })

    it("should skip errors", function () {
        const data = [
            { key1: 12, key2: 2 },
            { key1: 1000000.5, key2: 2 },
            { key1: "a", key2: 2 },
        ]
        const floatsData = valuesToFloat(data, "key1", ",", ".", true)
        assert.deepEqual(floatsData, [
            { key1: 12, key2: 2 },
            { key1: 1000000.5, key2: 2 },
            { key1: "a", key2: 2 },
        ])
    })

    it("should save values as floats with a new key", function () {
        const data = [{ key1: "1,000,000.5", key2: 2 }]
        const floatsData = valuesToFloat(
            data,
            "key1",
            undefined,
            undefined,
            undefined,
            "key1x"
        )
        assert.deepEqual(floatsData, [
            { key1: "1,000,000.5", key2: 2, key1x: 1000000.5 },
        ])
    })

    it("should throw error if newKey already exists", function () {
        const data = [
            { key1: 12, key2: 2 },
            { key1: 1000000.5, key2: 2 },
            { key1: "1,000,000.75", key2: 2 },
        ]
        assert.throws(() =>
            valuesToFloat(data, "key1", undefined, undefined, undefined, "key2")
        )
    })
})
