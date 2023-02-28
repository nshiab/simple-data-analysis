import assert from "assert"
import hasKey from "../../../src/helpers/hasKey.js"

describe("hasKey", function () {
    it("should not throw an Error when the key exists", function () {
        hasKey([{ key1: 1 }], "key1")
    })
    it("should throw an Error when the key doesn't exist", function () {
        assert.throws(() => hasKey([{ key1: 1 }], "key2"), Error)
    })
})
