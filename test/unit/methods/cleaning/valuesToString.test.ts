import assert from "assert"
import valuesToString from "../../../../src/methods/cleaning/valuesToString.js"

describe("valuesToString", function () {
    it("should convert values to string", function () {
        const data = [{ key1: 1, key2: 2 }]
        const stringifiedData = valuesToString(data, "key1")
        assert.deepEqual(stringifiedData, [{ key1: "1", key2: 2 }])
    })

    it("should save values as strings with a new key", function () {
        const data = [{ key1: 1, key2: 2 }]
        const stringifiedData = valuesToString(data, "key1", "key1x")
        assert.deepEqual(stringifiedData, [{ key1: 1, key1x: "1", key2: 2 }])
    })

    it("should throw error if newKey already exists", function () {
        const data = [{ key1: 1, key2: 2 }]
        assert.throws(() => valuesToString(data, "key1", "key2"))
    })
})
