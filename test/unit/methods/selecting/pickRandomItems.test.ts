import assert from "assert"
import pickRandomItems from "../../../../src/methods/selecting/pickRandomItems"

describe("pickRandomItems", function () {
    it("should return a random set of data, of the same length as the value provided", function () {
        const data = [
            { key1: 0, key2: 2 },
            { key1: 1, key2: 2 },
            { key1: 2, key2: 4 },
            { key1: 2, key2: 6 },
        ]
        const newData = pickRandomItems(data, 2)
        assert.deepEqual(newData.length, 2)
    })
})
