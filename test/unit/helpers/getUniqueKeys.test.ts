import assert from "assert"
import getUniqueKeys from "../../../src/helpers/getUniqueKeys.js"

describe("getUniqueKeys", function () {
    it("should return unique keys", function () {
        const keys = getUniqueKeys([{ patate: 0, poil: 2 }])
        assert.deepEqual(keys, ["patate", "poil"])
    })

    it("should return unique keys missing keys", function () {
        const keys = getUniqueKeys([{ patate: 0 }, { poil: 2 }])
        assert.deepEqual(keys, ["patate", "poil"])
    })

    it("should return empty list", function () {
        const keys = getUniqueKeys([])
        assert.deepEqual(keys.length, 0)
    })
})
