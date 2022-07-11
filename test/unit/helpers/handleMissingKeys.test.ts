import assert from "assert"
import handleMissingKeys from "../../../src/helpers/handleMissingKeys.js"

describe("handleMissingKeys", function () {
    it("should do nothing if data is empty", function () {
        const data = handleMissingKeys([], false)
        assert.equal(data.length, 0)
    })

    it("should not throw error if fillMissingKeys is false and no missing keys", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 2, key2: 3 },
        ]
        const newData = handleMissingKeys(data, false)
        assert.equal(data, newData)
    })

    it("should throw error if fillMissingKeys is false and missing keys", function () {
        const data = [{ key1: 1, key2: 2 }, { key1: 2 }]
        assert.throws(() => handleMissingKeys(data, false))
    })

    it("should fill missing keys", function () {
        const data = [{ key1: 1, key2: 2 }, { key1: 2 }]
        const newData = handleMissingKeys(data, true)
        assert.deepEqual(newData, [
            { key1: 1, key2: 2 },
            { key1: 2, key2: undefined },
        ])
    })

    it("should fill missing keys if first item is not complete", function () {
        const data = [{ key1: 2 }, { key1: 1, key2: 2 }]
        const newData = handleMissingKeys(data, true)
        assert.deepEqual(newData, [
            { key1: 2, key2: undefined },
            { key1: 1, key2: 2 },
        ])
    })

    it("should fill missing keys with unique keys", function () {
        const data = [{ key1: 2 }, { key1: 1, key2: 2 }]
        const newData = handleMissingKeys(data, true, [
            "key1",
            "key2",
            "peanut",
        ])
        assert.deepEqual(newData, [
            { key1: 2, key2: undefined, peanut: undefined },
            { key1: 1, key2: 2, peanut: undefined },
        ])
    })
})
