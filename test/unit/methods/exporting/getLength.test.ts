import assert from "assert"
import { SimpleData } from "../../../../src/index.js"

describe("getLength", function () {
    it("should return 0 when empty", function () {
        const simpleData = new SimpleData()
        assert.deepStrictEqual(simpleData.getLength(), 0)
    })
    it("should return the length of the data", function () {
        const simpleData = new SimpleData({
            data: [{ key1: 1 }, { key1: 2 }, { key1: 3 }],
        })
        assert.deepStrictEqual(simpleData.getLength(), 3)
    })
})
