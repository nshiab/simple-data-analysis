import assert from "assert"
import SimpleData from "../../../../src/class/SimpleData.js"

describe("getLast", function () {
    it("should return last item", function () {
        const data = [
            { key1: 1, key2: 2 },
            { key1: 11, key2: 22 },
            { key1: 111, key2: 222 },
        ]

        assert.deepEqual(
            { key1: 111, key2: 222 },
            new SimpleData({ data: data }).getLast()
        )
    })
})
