import assert from "assert"
import hasKey from "../../../src/helpers/hasKey.js"

describe("hasKey", function () {
    it("should return true when the key exists", function () {
        const haskey1 = hasKey({ key1: 1 }, "key1")
        assert.deepEqual(haskey1, true)
    })
    it("should return false when the key doesn't exist", function () {
        const haskey1 = hasKey({ key1: 1 }, "key2")
        assert.deepEqual(haskey1, false)
    })
})
