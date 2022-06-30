import assert from "assert"
import hasKey from "../../../src/helpers/hasKey.js"

describe("hasKey", function () {
    it("should return true when the key exists", function () {
        const hasPatate = hasKey({ patate: 1 }, "patate")
        assert.deepEqual(hasPatate, true)
    })
    it("should return false when the key doesn't exist", function () {
        const hasPatate = hasKey({ patate: 1 }, "poil")
        assert.deepEqual(hasPatate, false)
    })
})
