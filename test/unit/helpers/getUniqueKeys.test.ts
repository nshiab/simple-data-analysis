import assert from "assert"
import getUniqueKeys from "../../../src/helpers/getUniqueKeys.js"

describe("getUniqueKeys", function () {
    it("should return unique keys", function () {
        const keys = getUniqueKeys([{ key1: 0, key2: 2 }])
        assert.deepEqual(keys, ["key1", "key2"])
    })

    it("should return unique keys missing keys", function () {
        const keys = getUniqueKeys([{ key1: 0 }, { key2: 2 }])
        assert.deepEqual(keys, ["key1", "key2"])
    })

    it("should return empty list", function () {
        const keys = getUniqueKeys([])
        assert.deepEqual(keys.length, 0)
    })
})
